import assert from 'node:assert/strict'
import test from 'node:test'
import { buildLiteAdvice, shouldSuggestProOrIcp } from '../lib/liteRecommendations.js'

const normal = {
  temperature_c: 25,
  salinity_sg: 1.025,
  kh_dkh: 8,
  no3_ppm: 10,
  po4_ppm: 0.05,
}

const effect = (additiveId, parameterKey, direction) => ({
  additive_id: additiveId,
  parameter_key: parameterKey,
  direction,
})

test('owned KH increase product prevents purchase advice', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    ownedAdditives: [{ additive_id: 'kh-product', is_active: true }],
    additiveEffects: [effect('kh-product', 'kh', 'increase')],
  })
  assert.equal(advice.some(item => item.type === 'use_owned_additive'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('missing KH increase product includes direction in purchase route', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    additiveEffects: [effect('another-product', 'kh', 'increase')],
    preferredShop: { id: 'shop-1' },
  })
  const purchase = advice.find(item => item.type === 'buy_additive')
  assert.ok(purchase)
  assert.match(purchase.route, /parameter=kh&direction=increase/)
})

test('high KH consults shop without purchase advice', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 10.5 },
    additiveEffects: [effect('kh-product', 'kh', 'increase')],
  })
  assert.equal(advice.some(item => item.type === 'consult_shop'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('owned PO4 decrease product prevents purchase advice', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, po4_ppm: 0.15 },
    ownedAdditives: [{ additive_id: 'po4-product', is_active: true }],
    additiveEffects: [effect('po4-product', 'po4', 'decrease')],
  })
  assert.equal(advice.some(item => item.type === 'use_owned_additive'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('missing PO4 decrease product preserves direction', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, po4_ppm: 0.15 },
    additiveEffects: [effect('another-product', 'po4', 'decrease')],
    preferredShop: { id: 'shop-1' },
  })
  const purchase = advice.find(item => item.type === 'buy_additive')
  assert.ok(purchase)
  assert.match(purchase.route, /parameter=po4&direction=decrease/)
})

test('abnormal salinity never creates additive purchase advice', () => {
  for (const salinity of [1.02, 1.03]) {
    const advice = buildLiteAdvice({
      latestMeasurement: { ...normal, salinity_sg: salinity },
      additiveEffects: [effect('anything', 'salinity', 'increase')],
    })
    assert.equal(advice.some(item => item.type === 'consult_shop'), true)
    assert.equal(advice.some(item => item.type === 'buy_additive'), false)
  }
})

test('empty additive effects disables all purchase routing', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    additiveEffects: [],
  })
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
  assert.equal(advice.some(item => item.reason === 'additive_effects_unconfigured'), true)
})

test('two red values stop product routing', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 5, po4_ppm: 0.3 },
    additiveEffects: [effect('kh-product', 'kh', 'increase'), effect('po4-product', 'po4', 'decrease')],
  })
  assert.equal(advice.some(item => item.type === 'consult_shop'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('missing measurement prompts are limited and prioritized', () => {
  const advice = buildLiteAdvice({ latestMeasurement: {}, additiveEffects: [] })
    .filter(item => item.type === 'measure_missing')
  assert.equal(advice.length, 2)
  assert.deepEqual(advice.map(item => item.parameterKey), ['kh_dkh', 'salinity_sg'])
})

test('Pro suggestion uses 30-day habit, coverage, and stability', () => {
  const records = Array.from({ length: 8 }, (_, index) => ({
    measured_at: new Date(Date.UTC(2026, 4, 1 + index * 4)).toISOString(),
    kh_dkh: 8 + (index % 2) * 0.1,
    temperature_c: 25 + (index % 2) * 0.1,
    salinity_sg: 1.025,
    no3_ppm: index < 3 ? 10 : null,
    po4_ppm: index < 3 ? 0.05 : null,
  }))
  assert.equal(shouldSuggestProOrIcp(records), true)
})
