import {
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

const MISSING_PRIORITY = ['kh_dkh', 'salinity_sg', 'no3_ppm', 'po4_ppm', 'temperature_c']
const PRO_COVERAGE = { kh_dkh: 6, temperature_c: 6, salinity_sg: 4, no3_ppm: 3, po4_ppm: 3 }
const MAX_RANGE_SWING = { kh_dkh: 2, temperature_c: 3, salinity_sg: 0.004, no3_ppm: 20, po4_ppm: 0.2 }

function measurementsInLast30Days(recentMeasurements = []) {
  const valid = recentMeasurements
    .filter(measurement => Number.isFinite(new Date(measurement?.measured_at).getTime()))
    .sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at))
  if (!valid.length) return []
  const newest = new Date(valid.at(-1).measured_at).getTime()
  return valid.filter(measurement => newest - new Date(measurement.measured_at).getTime() <= 29 * 86400000)
}

export function shouldSuggestProOrIcp(recentMeasurements = []) {
  const measurements = measurementsInLast30Days(recentMeasurements)
  const measurementDays = new Set(measurements.map(measurementDateKey).filter(Boolean))
  if (measurementDays.size < 8) return false

  for (const [key, minimum] of Object.entries(PRO_COVERAGE)) {
    const count = measurements.filter(item => item?.[key] != null && Number.isFinite(Number(item[key]))).length
    if (count < minimum) return false
  }

  const judged = measurements.flatMap(measurement =>
    REQUIRED_LITE_KEYS.flatMap(key => {
      const value = measurement?.[key]
      return value == null || !Number.isFinite(Number(value))
        ? []
        : [judgeValue(Number(value), LITE_TARGETS[key])]
    }),
  )
  if (!judged.length || judged.filter(value => value === 'red').length / judged.length > 0.1) return false

  return Object.entries(MAX_RANGE_SWING).every(([key, maximumSwing]) => {
    const values = measurements
      .map(item => Number(item?.[key]))
      .filter(Number.isFinite)
    return values.length === 0 || Math.max(...values) - Math.min(...values) <= maximumSwing
  })
}

function productRoute(preferredShop, parameterKey, direction) {
  const encodedKey = encodeURIComponent(parameterKey)
  const encodedDirection = encodeURIComponent(direction)
  return preferredShop?.id
    ? `/shops/${encodeURIComponent(preferredShop.id)}/products?parameter=${encodedKey}&direction=${encodedDirection}`
    : `/products?parameter=${encodedKey}&direction=${encodedDirection}`
}

function purchasableEffect(parameterKey, direction) {
  if (parameterKey === 'kh_dkh' && direction === 'increase') return { parameterKey: 'kh', direction }
  if (parameterKey === 'no3_ppm' && direction === 'decrease') return { parameterKey: 'no3', direction }
  if (parameterKey === 'po4_ppm' && direction === 'decrease') return { parameterKey: 'po4', direction }
  return null
}

function consultationMessage(parameterKey, direction) {
  if (parameterKey === 'salinity_sg') {
    return direction === 'increase'
      ? '比重が低めです。人工海水・比重計・水換え手順をショップと確認してください。'
      : '比重が高めです。足し水・蒸発・比重計・測定方法をショップと確認してください。'
  }
  if (parameterKey === 'temperature_c') {
    return '水温が目標範囲から外れています。ヒーター・クーラー・室温・測定方法を確認してください。'
  }
  if (parameterKey === 'kh_dkh' && direction === 'decrease') {
    return 'KHが高めです。KH添加剤を追加せず、水換え・添加状況・測定方法をショップと確認してください。'
  }
  return `${labelOf(parameterKey)}が目標範囲から外れています。添加剤を購入する前に、水換え・給餌・測定方法をショップと確認してください。`
}

export function buildLiteAdvice({
  tankProfile,
  latestMeasurement,
  recentMeasurements = [],
  ownedAdditives = [],
  additiveEffects = [],
  preferredShop,
  recentlyPromptedKeys = [],
} = {}) {
  const advice = []
  const missingKeys = findMissingKeys(latestMeasurement)
    .sort((a, b) => MISSING_PRIORITY.indexOf(a) - MISSING_PRIORITY.indexOf(b))
    .sort((a, b) => Number(recentlyPromptedKeys.includes(a)) - Number(recentlyPromptedKeys.includes(b)))
    .slice(0, 2)

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
  const effectsConfigured = additiveEffects.length > 0

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
    const direction = inferCorrectionDirection(item.parameterKey, item.value)
    const supportedEffect = purchasableEffect(item.parameterKey, direction)
    const effectCatalogHasSupport = supportedEffect && additiveEffects.some(effect =>
      effect?.parameter_key === supportedEffect.parameterKey
      && effect?.direction === supportedEffect.direction,
    )
    const owned = effectCatalogHasSupport
      ? canHandleWithOwnedAdditives(
          supportedEffect.parameterKey,
          supportedEffect.direction,
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
    } else if (!supportedEffect) {
      advice.push({
        type: 'consult_shop',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: consultationMessage(item.parameterKey, direction),
        actionLabel: 'ショップに見せる',
        route: '/lite/shop-card',
      })
    } else if (!effectCatalogHasSupport) {
      advice.push({
        type: 'consult_shop',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: '対応製品を安全に照合できないため、購入せずショップにこの画面を見せて相談してください。',
        actionLabel: 'ショップに見せる',
        route: '/lite/shop-card',
        reason: effectsConfigured ? 'additive_effect_unavailable' : 'additive_effects_unconfigured',
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
        route: productRoute(preferredShop, supportedEffect.parameterKey, supportedEffect.direction),
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
