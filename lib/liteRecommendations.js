import {
  LITE_TARGETS,
  REQUIRED_LITE_KEYS,
  findMissingKeys,
  getLiteEmergencyDirection,
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
      && effect.verified === true
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

function singleReadingMessage(parameterKey, direction) {
  if (parameterKey === 'po4_ppm') {
    return 'リン酸塩（PO4）が高めに出ました。次回も測ると傾向が分かりやすくなります。'
  }
  if (parameterKey === 'no3_ppm') {
    return '硝酸塩（NO3）が高めに出ました。次回も測ると傾向が分かりやすくなります。'
  }
  if (parameterKey === 'salinity_sg') {
    return '塩分濃度が目標範囲から外れました。測定方法を確認し、次回も測って傾向を見ましょう。'
  }
  if (parameterKey === 'temperature_c') {
    return '水温が目標範囲から外れました。一時的な変化か確認するため、もう一度測ってみましょう。'
  }
  return `${labelOf(parameterKey)}が目標範囲から外れました。すぐに調整せず、次回も測って傾向を確認しましょう。`
}

function emergencyMessage(parameterKey, direction) {
  if (parameterKey === 'temperature_c') {
    return direction === 'high'
      ? '水温が非常に高い可能性があります。測定値を確認し、必要であれば早めにショップへ相談してください。'
      : '水温が非常に低い可能性があります。測定値を確認し、必要であれば早めにショップへ相談してください。'
  }
  if (parameterKey === 'kh_dkh') {
    return 'KH（炭酸塩硬度）が非常に低い可能性があります。測定値を確認し、自己判断で急に添加せずショップへ相談してください。'
  }
  return '塩分濃度が大きく外れている可能性があります。測定方法や水換え手順を確認し、必要であればショップへ相談してください。'
}

export function findLiteEmergencies(latestMeasurement) {
  return REQUIRED_LITE_KEYS.flatMap(parameterKey => {
    const direction = getLiteEmergencyDirection(parameterKey, latestMeasurement?.[parameterKey])
    if (!direction) return []
    return [{
      parameterKey,
      direction,
      value: Number(latestMeasurement[parameterKey]),
    }]
  })
}

/**
 * Returns true only when the latest two measured values for a parameter are
 * outside the green range in the same correction direction.
 */
export function isRepeatedOutOfRange(parameterKey, latestMeasurement, recentMeasurements = []) {
  const candidates = []
  const seen = new Set()
  const seenObjects = new WeakSet()

  for (const measurement of [latestMeasurement, ...recentMeasurements]) {
    if (!measurement || typeof measurement !== 'object' || seenObjects.has(measurement)) continue
    seenObjects.add(measurement)
    const value = measurement?.[parameterKey]
    if (value == null || value === '' || !Number.isFinite(Number(value))) continue
    const identity = measurement?.id
      ? `id:${measurement.id}`
      : measurement?.measured_at
        ? `measured_at:${measurement.measured_at}`
      : measurement === latestMeasurement
        ? `latest:${Number(value)}`
        : `value:${Number(value)}:${candidates.length}`
    if (seen.has(identity)) continue
    seen.add(identity)
    candidates.push(measurement)
  }

  const ordered = candidates
    .sort((a, b) => {
      if (a === latestMeasurement) return -1
      if (b === latestMeasurement) return 1
      return new Date(b.measured_at || 0) - new Date(a.measured_at || 0)
    })
    .slice(0, 2)

  if (ordered.length < 2) return false
  const directions = ordered.map(measurement => {
    const value = Number(measurement[parameterKey])
    const severity = judgeValue(value, LITE_TARGETS[parameterKey])
    return severity === 'green' || severity === 'unknown'
      ? null
      : inferCorrectionDirection(parameterKey, value)
  })
  return directions[0] != null && directions[0] === directions[1]
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
  const emergencies = findLiteEmergencies(latestMeasurement)
  if (emergencies.length > 0) {
    return emergencies.map(item => ({
      type: 'consult_shop',
      severity: 'red',
      isEmergency: true,
      parameterKey: item.parameterKey,
      value: item.value,
      message: emergencyMessage(item.parameterKey, item.direction),
      actionLabel: 'ショップに見せる',
      route: '/lite/shop-card',
    }))
  }

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
  const verifiedEffects = additiveEffects.filter(effect => effect?.verified === true)
  const effectsConfigured = verifiedEffects.length > 0
  const repeatedItems = [...redItems, ...yellowItems].filter(item =>
    isRepeatedOutOfRange(item.parameterKey, latestMeasurement, recentMeasurements),
  )

  if (repeatedItems.filter(item => item.severity === 'red').length >= 2) {
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
    const repeated = isRepeatedOutOfRange(item.parameterKey, latestMeasurement, recentMeasurements)
    if (!repeated) {
      advice.push({
        type: 'remeasure',
        severity: 'yellow',
        parameterKey: item.parameterKey,
        message: singleReadingMessage(item.parameterKey, direction),
        actionLabel: '次回も測る',
        route: null,
      })
      continue
    }

    const supportedEffect = purchasableEffect(item.parameterKey, direction)
    const effectCatalogHasSupport = supportedEffect && verifiedEffects.some(effect =>
      effect?.parameter_key === supportedEffect.parameterKey
      && effect?.direction === supportedEffect.direction,
    )
    const owned = effectCatalogHasSupport
      ? canHandleWithOwnedAdditives(
          supportedEffect.parameterKey,
          supportedEffect.direction,
          ownedAdditives,
          verifiedEffects,
        )
      : false

    if (owned) {
      const ownedMessage = item.parameterKey === 'po4_ppm'
        ? 'リン酸塩（PO4）が高めの状態が続いています。給餌量と水換えを確認し、現在お使いの製品の説明もご確認ください。'
        : item.parameterKey === 'no3_ppm'
          ? '硝酸塩（NO3）が高めの状態が続いています。給餌量と水換えを確認し、現在お使いの製品の説明もご確認ください。'
        : `${labelOf(item.parameterKey)}が目標範囲から外れています。すでにお使いの添加剤で対応できる可能性があります。まずは現在お使いの添加剤の説明をご確認ください。`
      advice.push({
        type: 'use_owned_additive',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: ownedMessage,
        actionLabel: 'お使いの製品を確認',
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
        message: 'お使いの製品だけで対応できるか確認できませんでした。新しく購入する前に、ショップへこの画面を見せて相談してください。',
        actionLabel: 'ショップに見せる',
        route: '/lite/shop-card',
        reason: effectsConfigured ? 'additive_effect_unavailable' : 'additive_effects_unconfigured',
      })
    } else if (item.parameterKey === 'no3_ppm' || item.parameterKey === 'po4_ppm') {
      advice.push({
        type: 'consult_shop',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: item.parameterKey === 'po4_ppm'
          ? 'リン酸塩（PO4）が高めの状態が続いています。給餌量、水換え頻度、1回の換水量を確認し、ショップへ相談してください。'
          : '硝酸塩（NO3）が高めの状態が続いています。給餌量、水換え頻度、1回の換水量を確認し、ショップへ相談してください。',
        actionLabel: 'ショップに見せる',
        route: '/lite/shop-card',
      })
    } else {
      advice.push({
        type: 'buy_additive',
        severity: item.severity,
        parameterKey: item.parameterKey,
        message: item.parameterKey === 'po4_ppm'
          ? 'リン酸塩（PO4）が高めです。お使いの製品を確認するか、給餌量や水換えについてショップへ相談してください。'
          : `${labelOf(item.parameterKey)}を調整する方法についてショップに相談してください。`,
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
