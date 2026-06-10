const DAY_MS = 86400000

function median(values) {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function normalizePoints(points = []) {
  const byTimestamp = new Map()
  for (const point of points) {
    const timestamp = new Date(point?.date ?? point?.measured_at).getTime()
    const value = Number(point?.value)
    if (!Number.isFinite(timestamp) || !Number.isFinite(value)) continue
    byTimestamp.set(timestamp, { timestamp, value })
  }
  return [...byTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp)
}

function leastSquares(points) {
  if (points.length < 2) return null
  const start = points[0].timestamp
  const normalized = points.map(point => ({
    x: (point.timestamp - start) / DAY_MS,
    y: point.value,
  }))
  const meanX = normalized.reduce((sum, point) => sum + point.x, 0) / normalized.length
  const meanY = normalized.reduce((sum, point) => sum + point.y, 0) / normalized.length
  const denominator = normalized.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0)
  if (denominator === 0) return null
  const slope = normalized.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0,
  ) / denominator
  return { slope, intercept: meanY - slope * meanX, start }
}

export function calculateSlope(points = []) {
  const normalized = normalizePoints(points)
  const initial = leastSquares(normalized)
  if (!initial || normalized.length < 4) return initial?.slope ?? null

  const residuals = normalized.map(point => {
    const x = (point.timestamp - initial.start) / DAY_MS
    return point.value - (initial.intercept + initial.slope * x)
  })
  const center = median(residuals)
  const mad = median(residuals.map(residual => Math.abs(residual - center)))
  if (mad === 0) return initial.slope

  const limit = mad * 3.5
  const filtered = normalized.filter((_point, index) => Math.abs(residuals[index] - center) <= limit)
  const robust = filtered.length >= 3 ? leastSquares(filtered) : initial
  return robust?.slope ?? initial.slope
}

export function calculateDailyConsumption(points = []) {
  const slope = calculateSlope(points)
  if (slope == null) return null
  return Math.max(0, -slope)
}

export function predictValue(currentValue, slopePerDay, days) {
  if (currentValue == null || slopePerDay == null || days == null) return null
  const current = Number(currentValue)
  const slope = Number(slopePerDay)
  const horizon = Number(days)
  if (![current, slope, horizon].every(Number.isFinite)) return null
  return current + slope * horizon
}

export function classifyTrend(slopePerDay, stableThreshold = 0.01) {
  if (slopePerDay == null || !Number.isFinite(Number(slopePerDay))) return 'insufficient_data'
  const slope = Number(slopePerDay)
  if (Math.abs(slope) <= stableThreshold) return 'stable'
  return slope < 0 ? 'consuming' : 'increasing'
}

export function buildConsumptionSummary(trend, dailyConsumption, decimals, unit) {
  if (trend === 'consuming' && dailyConsumption != null) {
    return `1日あたり ${Number(dailyConsumption).toFixed(decimals)} ${unit} 減少`
  }
  if (trend === 'stable') return 'この期間はおおむね安定'
  if (trend === 'increasing') return '上昇傾向。添加・水換え・測定条件を確認'
  return '計算には2回以上の測定が必要'
}

export function selectPeriodMeasurements(measurements = [], periodDays = 14, now = new Date()) {
  if (periodDays === 'all') return [...measurements]
  const cutoff = now.getTime() - Number(periodDays) * DAY_MS
  return measurements.filter(measurement => new Date(measurement.measured_at).getTime() >= cutoff)
}

export function analyzeParameter(measurements, parameterKey, periodDays, options = {}) {
  const selected = selectPeriodMeasurements(measurements, periodDays, options.now)
  const points = selected
    .filter(measurement => measurement?.[parameterKey] != null)
    .map(measurement => ({ date: measurement.measured_at, value: measurement[parameterKey] }))
  const slope = calculateSlope(points)
  const latest = [...selected]
    .filter(measurement => measurement?.[parameterKey] != null)
    .sort((a, b) => new Date(b.measured_at) - new Date(a.measured_at))[0]
  const stableThreshold = options.stableThreshold ?? 0.01

  return {
    sampleCount: points.length,
    slopePerDay: slope,
    dailyConsumption: slope == null ? null : Math.max(0, -slope),
    trend: points.length < 2 ? 'insufficient_data' : classifyTrend(slope, stableThreshold),
    currentValue: latest?.[parameterKey] == null ? null : Number(latest[parameterKey]),
    predicted7d: latest && slope != null ? predictValue(latest[parameterKey], slope, 7) : null,
    predicted14d: latest && slope != null ? predictValue(latest[parameterKey], slope, 14) : null,
  }
}

export function describeEventTrend(event, measurements, parameter, daysAfter = 14) {
  const eventTime = new Date(event?.event_at).getTime()
  if (!Number.isFinite(eventTime) || !parameter?.key) return null
  const after = measurements
    .filter(measurement => {
      const time = new Date(measurement.measured_at).getTime()
      return time >= eventTime && time <= eventTime + daysAfter * DAY_MS && measurement[parameter.key] != null
    })
    .map(measurement => ({ date: measurement.measured_at, value: measurement[parameter.key] }))
  const slope = calculateSlope(after)
  if (after.length < 2 || slope == null) return null
  const trend = classifyTrend(slope, parameter.key === 'po4_ppm' ? 0.002 : 0.01)
  if (trend === 'stable' || trend === 'insufficient_data') return null
  return `${event.title}後、${parameter.label}が${trend === 'consuming' ? '低下' : '上昇'}傾向です。ほかの作業や測定条件も合わせて確認してください。`
}
