import test from 'node:test'
import assert from 'node:assert/strict'
import {
  analyzeParameter,
  buildConsumptionSummary,
  calculateDailyConsumption,
  calculateSlope,
  classifyTrend,
  describeEventTrend,
  predictValue,
} from '../lib/proAnalytics.js'

const dated = values => values.map((value, index) => ({
  date: new Date(Date.UTC(2026, 5, 1 + index * 3)).toISOString(),
  value,
}))

test('falling KH produces positive daily consumption', () => {
  const consumption = calculateDailyConsumption(dated([8.2, 8.0, 7.8, 7.6]))
  assert.ok(Math.abs(consumption - 0.0667) < 0.002)
  assert.equal(classifyTrend(-consumption, 0.01), 'consuming')
})

test('flat values are stable', () => {
  const slope = calculateSlope(dated([430, 430, 431, 430]))
  assert.equal(classifyTrend(slope, 0.2), 'stable')
})

test('rising values are classified as increasing', () => {
  const slope = calculateSlope(dated([1280, 1290, 1300, 1310]))
  assert.equal(classifyTrend(slope, 0.2), 'increasing')
  assert.equal(calculateDailyConsumption(dated([1280, 1290, 1300, 1310])), 0)
})

test('insufficient data returns no slope', () => {
  assert.equal(calculateSlope(dated([8.0])), null)
  assert.equal(classifyTrend(null), 'insufficient_data')
})

test('an extreme outlier does not destroy the underlying slope', () => {
  const points = dated([8.4, 8.2, 14.0, 7.8, 7.6])
  const slope = calculateSlope(points)
  assert.ok(slope < -0.04)
  assert.ok(slope > -0.09)
})

test('prediction follows current value and daily slope', () => {
  assert.equal(predictValue(7.6, -0.1, 7), 6.8999999999999995)
  assert.equal(predictValue(null, -0.1, 7), null)
})

test('sparse parameter rows are ignored without losing valid measurements', () => {
  const measurements = [
    { measured_at: '2026-06-01T00:00:00Z', kh_dkh: 8.2 },
    { measured_at: '2026-06-04T00:00:00Z', ca_ppm: 430 },
    { measured_at: '2026-06-07T00:00:00Z', kh_dkh: 7.8 },
  ]
  const analysis = analyzeParameter(measurements, 'kh_dkh', 'all', { stableThreshold: 0.01 })
  assert.equal(analysis.sampleCount, 2)
  assert.equal(analysis.trend, 'consuming')
})

test('event trend wording reports association without claiming causation', () => {
  const event = { event_at: '2026-06-01T00:00:00Z', title: 'Bacto Blend開始' }
  const measurements = [
    { measured_at: '2026-06-02T00:00:00Z', no3_ppm: 15 },
    { measured_at: '2026-06-08T00:00:00Z', no3_ppm: 10 },
    { measured_at: '2026-06-14T00:00:00Z', no3_ppm: 5 },
  ]
  const text = describeEventTrend(event, measurements, {
    key: 'no3_ppm',
    label: '硝酸塩（NO3）',
  })
  assert.match(text, /開始後/)
  assert.match(text, /低下傾向/)
  assert.doesNotMatch(text, /効きました|原因/)
})

test('consumption summary handles an empty Pro tank without throwing', () => {
  assert.equal(
    buildConsumptionSummary('insufficient_data', null, 2, 'dKH'),
    '計算には2回以上の測定が必要',
  )
  assert.equal(
    buildConsumptionSummary('consuming', 0.1, 2, 'dKH'),
    '1日あたり 0.10 dKH 減少',
  )
})
