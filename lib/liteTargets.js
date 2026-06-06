export const LITE_TARGETS = Object.freeze({
  temperature_c: { green: [24.0, 26.5], yellow: [23.0, 28.0] },
  salinity_sg: { green: [1.024, 1.026], yellow: [1.022, 1.027] },
  kh_dkh: { green: [7.0, 9.0], yellow: [6.5, 10.0] },
  no3_ppm: { green: [2, 20], yellow: [0, 30] },
  po4_ppm: { green: [0.02, 0.10], yellow: [0, 0.20] },
})

export const REQUIRED_LITE_KEYS = Object.freeze([
  'kh_dkh',
  'temperature_c',
  'salinity_sg',
  'no3_ppm',
  'po4_ppm',
])

export const LITE_PARAMETER_LABELS = Object.freeze({
  kh_dkh: 'KH',
  temperature_c: '水温',
  salinity_sg: '比重',
  no3_ppm: 'NO3',
  po4_ppm: 'PO4',
})

export const LITE_EFFECT_PARAMETER_KEYS = Object.freeze({
  kh_dkh: 'kh',
  salinity_sg: 'salinity',
  no3_ppm: 'no3',
  po4_ppm: 'po4',
})

export function findMissingKeys(latestMeasurement) {
  return REQUIRED_LITE_KEYS.filter(key => latestMeasurement?.[key] == null)
}

export function labelOf(parameterKey) {
  return LITE_PARAMETER_LABELS[parameterKey] || parameterKey
}

/**
 * @typedef {'green' | 'yellow' | 'red' | 'unknown'} Severity
 */

/**
 * @param {number | null | undefined} value
 * @param {{ green: [number, number], yellow: [number, number] } | null | undefined} target
 * @returns {Severity}
 */
export function judgeValue(value, target) {
  if (value == null || !Number.isFinite(value) || !target) return 'unknown'

  const [gMin, gMax] = target.green
  const [yMin, yMax] = target.yellow

  if (value >= gMin && value <= gMax) return 'green'
  if (value >= yMin && value <= yMax) return 'yellow'
  return 'red'
}

export function getLiteSeverity(parameterKey, value) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) {
    return 'unknown'
  }

  const target = LITE_TARGETS[parameterKey]
  return judgeValue(Number(value), target)
}

export function judgeAll(latestMeasurement) {
  return REQUIRED_LITE_KEYS.map(parameterKey => {
    const rawValue = latestMeasurement?.[parameterKey]
    const value = rawValue == null || rawValue === '' ? null : Number(rawValue)

    return {
      parameterKey,
      value: Number.isFinite(value) ? value : null,
      severity: judgeValue(Number.isFinite(value) ? value : null, LITE_TARGETS[parameterKey]),
    }
  })
}

export function inferCorrectionDirection(parameterKey, value) {
  const target = LITE_TARGETS[parameterKey]
  if (!target || value == null || !Number.isFinite(Number(value))) return null

  const numericValue = Number(value)
  if (numericValue < target.green[0]) return 'increase'
  if (numericValue > target.green[1]) return 'decrease'
  return 'stabilize'
}
