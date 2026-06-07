import {
  LITE_EFFECT_PARAMETER_KEYS,
  LITE_TARGETS,
  REQUIRED_LITE_KEYS,
  findMissingKeys,
  inferCorrectionDirection,
  judgeAll,
  judgeValue,
  labelOf,
} from './liteTargets.js'

/**
 * Checks whether an active product owned by the user has a matching,
 * structured effect. This is a routing hint, not a dosing recommendation.
 *
 * @param {string} parameterKey
 * @param {string} direction
 * @param {Array<{ additive_id?: string | null, is_active?: boolean }>} ownedAdditives
 * @param {Array<{ additive_id?: string | null, parameter_key?: string, direction?: string }>} additiveEffects
 * @returns {boolean}
 */
export function canHandleWithOwnedAdditives(
  parameterKey,
  direction,
  ownedAdditives = [],
  additiveEffects = [],
) {
  if (!parameterKey || !direction) return false
  if (!Array.isArray(ownedAdditives) || !Array.isArray(additiveEffects)) return false

  return ownedAdditives.some(owned => {
    if (!owned?.additive_id || owned.is_active === false) return false

    return additiveEffects.some(effect =>
      effect?.additive_id === owned.additive_id
      && effect.parameter_key === parameterKey
      && effect.direction === direction
    )
  })
}

function measurementDateKey(measurement) {
  const timestamp = new Date(measurement?.measured_at).getTime()
  if (!Number.isFinite(timestamp)) return null
  return new Date(timestamp).toISOString().slice(0, 10)
}

export function countContinuousDays(recentMeasurements = []) {
  if (!Array.isArray(recentMeasurements)) return 0

  const uniqueDays = [...new Set(recentMeasurements.map(measurementDateKey).filter(Boolean))]
    .map(day => Date.parse(`${day}T00:00:00Z`))
    .sort((a, b) => a - b)

  let longestStreak = uniqueDays.length ? 1 : 0
  let currentStreak = longestStreak

  for (let index = 1; index < uniqueDays.length; index += 1) {
    if (uniqueDays[index] - uniqueDays[index - 1] === 86400000) {
      currentStreak += 1
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

export function hasStableMeasurementCoverage(
  recentMeasurements = [],
  requiredKeys = REQUIRED_LITE_KEYS,
) {
  if (!Array.isArray(recentMeasurements) || !Array.isArray(requiredKeys)) return false

  return requiredKeys.every(key =>
    recentMeasurements.some(measurement => {
      const value = measurement?.[key]
      return value != null && value !== '' && Number.isFinite(Number(value))
    }),
  )
}

export function isMostlyInGreenRange(recentMeasurements = [], greenRatio = 0.8) {
  if (!Array.isArray(recentMeasurements) || recentMeasurements.length === 0) return false

  const judgedValues = recentMeasurements.flatMap(measurement =>
    REQUIRED_LITE_KEYS.flatMap(key => {
      const value = measurement?.[key]
      if (value == null || value === '' || !Number.isFinite(Number(value))) return []
      return [judgeValue(Number(value), LITE_TARGETS[key])]
    }),
  )

  if (judgedValues.length === 0) return false
  const greenCount = judgedValues.filter(severity => severity === 'green').length
  return greenCount / judgedValues.length >= greenRatio
}

export function shouldSuggestProOrIcp(recentMeasurements = []) {
  const days = countContinuousDays(recentMeasurements)
  const hasFiveKeys = hasStableMeasurementCoverage(recentMeasurements, REQUIRED_LITE_KEYS)
  const stable = isMostlyInGreenRange(recentMeasurements)

  return days >= 30 && hasFiveKeys && stable
}

function productRoute(preferredShop, parameterKey) {
  const encodedKey = encodeURIComponent(parameterKey)
  return preferredShop?.id
    ? `/shops/${encodeURIComponent(preferredShop.id)}/products?parameter=${encodedKey}`
    : '/lite/shop-card'
}

export function buildLiteAdvice({
  tankProfile,
  latestMeasurement,
  recentMeasurements = [],
  ownedAdditives = [],
  additiveEffects = [],
  preferredShop,
} = {}) {
  const advice = []
  const missingKeys = findMissingKeys(latestMeasurement)

  for (const key of missingKeys) {
    const encodedKey = encodeURIComponent(key)
    const missingMessage = key === 'po4_ppm'
      ? 'PO4を測ると、ショップがより正確に助言できます。'
      : key === 'no3_ppm'
        ? 'NO3を測ると、栄養塩の状態が分かりやすくなります。'
        : `${labelOf(key)}を次に測ると、ショップへ相談しやすくなります。`
    advice.push({
      type: 'measure_missing',
      severity: 'yellow',
      parameterKey: key,
      message: missingMessage,
      actionLabel: `${labelOf(key)}テストキットを見る`,
      route: preferredShop?.id
        ? `/shops/${encodeURIComponent(preferredShop.id)}/kits?parameter=${encodedKey}`
        : `/kits?parameter=${encodedKey}`,
    })
  }

  const judged = judgeAll(latestMeasurement)
  const redItems = judged.filter(item => item.severity === 'red')
  const yellowItems = judged.filter(item => item.severity === 'yellow')

  if (redItems.length >= 2) {
    advice.push({
      type: 'consult_shop',
      severity: 'red',
      message: '複数の項目が大きく外れています。自己判断で添加せず、ショップにこの画面を見せて相談してください。',
      actionLabel: 'ショップに見せる',
      route: '/lite/shop-card',
    })
    return advice
  }

  for (const item of [...redItems, ...yellowItems]) {
    const effectParameterKey = LITE_EFFECT_PARAMETER_KEYS[item.parameterKey]
    const direction = inferCorrectionDirection(item.parameterKey, item.value)
    const owned = effectParameterKey
      ? canHandleWithOwnedAdditives(
          effectParameterKey,
          direction,
          ownedAdditives,
          additiveEffects,
        )
      : false

    if (owned) {
      advice.push({
        type: 'use_owned_additive',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: `${labelOf(item.parameterKey)}が目標範囲から外れています。まずはお持ちの添加剤のメーカー公式用法を確認してください。新しい添加剤を買う必要はありません。`,
        actionLabel: '手持ち添加剤の使い方を見る',
        route: `/lite/additives/owned?parameter=${encodeURIComponent(item.parameterKey)}`,
      })
    } else if (!effectParameterKey) {
      advice.push({
        type: 'consult_shop',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: `${labelOf(item.parameterKey)}が目標範囲から外れています。添加剤で調整せず、設備や測定方法をショップに確認してください。`,
        actionLabel: 'ショップに見せる',
        route: '/lite/shop-card',
      })
    } else {
      advice.push({
        type: 'buy_additive',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: item.parameterKey === 'po4_ppm'
          ? 'PO4が高めです。給餌量・水換え・リン酸塩対策についてショップに相談してください。'
          : `${labelOf(item.parameterKey)}が目標範囲から外れています。対応方法や添加剤についてショップに相談してください。`,
        actionLabel: 'ショップに相談',
        route: productRoute(preferredShop, item.parameterKey),
      })
    }
  }

  if (shouldSuggestProOrIcp(recentMeasurements)) {
    advice.push({
      type: 'consider_pro',
      severity: 'green',
      message: '安定して記録できています。より詳しく管理したい場合はPro版やICPテストも検討できます。',
      actionLabel: 'Pro版について見る',
      route: '/pro',
    })
  }

  if (advice.length === 0) {
    advice.push({
      type: 'no_action',
      severity: 'green',
      message: '直近の記録では大きな確認ポイントはありません。次回も測れた項目だけ記録しましょう。',
      actionLabel: null,
      route: null,
    })
  }

  void tankProfile
  return advice
}
