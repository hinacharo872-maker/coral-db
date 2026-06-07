import assert from 'node:assert/strict'
import test from 'node:test'
import { buildLiteAdvice, isRepeatedOutOfRange, shouldSuggestProOrIcp } from '../lib/liteRecommendations.js'

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
  verified: true,
})

const previous = values => [{ measured_at: '2026-06-06T00:00:00Z', ...normal, ...values }]

test('one low KH reading only asks for another measurement', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    ownedAdditives: [{ additive_id: 'kh-product', is_active: true }],
    additiveEffects: [effect('kh-product', 'kh', 'increase')],
  })
  assert.equal(advice.some(item => item.type === 'remeasure'), true)
  assert.equal(advice.some(item => item.type === 'use_owned_additive'), false)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('two low KH readings use an owned verified product without purchase advice', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    recentMeasurements: previous({ kh_dkh: 6.7 }),
    ownedAdditives: [{ additive_id: 'kh-product', is_active: true }],
    additiveEffects: [effect('kh-product', 'kh', 'increase')],
  })
  assert.equal(advice.some(item => item.type === 'use_owned_additive'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('two low KH readings without an owned product preserve direction', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    recentMeasurements: previous({ kh_dkh: 6.7 }),
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
    recentMeasurements: previous({ kh_dkh: 10.4 }),
    additiveEffects: [effect('kh-product', 'kh', 'increase')],
  })
  assert.equal(advice.some(item => item.type === 'consult_shop'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('one high nitrate reading only asks for another measurement', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, no3_ppm: 25 },
    additiveEffects: [effect('no3-product', 'no3', 'decrease')],
  })
  assert.equal(advice.some(item => item.type === 'remeasure'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('two high nitrate readings prioritize feeding and water changes', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, no3_ppm: 25 },
    recentMeasurements: previous({ no3_ppm: 24 }),
    additiveEffects: [effect('no3-product', 'no3', 'decrease')],
  })
  assert.equal(advice.some(item => item.type === 'consult_shop'), true)
  assert.equal(advice.some(item => item.message.includes('給餌量')), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('two high PO4 readings use an owned verified product without purchase advice', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, po4_ppm: 0.15 },
    recentMeasurements: previous({ po4_ppm: 0.14 }),
    ownedAdditives: [{ additive_id: 'po4-product', is_active: true }],
    additiveEffects: [effect('po4-product', 'po4', 'decrease')],
  })
  assert.equal(advice.some(item => item.type === 'use_owned_additive'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('two high PO4 readings without an owned product route to shop consultation', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, po4_ppm: 0.15 },
    recentMeasurements: previous({ po4_ppm: 0.14 }),
    additiveEffects: [effect('another-product', 'po4', 'decrease')],
    preferredShop: { id: 'shop-1' },
  })
  assert.equal(advice.some(item => item.type === 'consult_shop'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('abnormal salinity never creates additive purchase advice', () => {
  for (const salinity of [1.02, 1.03]) {
    const advice = buildLiteAdvice({
      latestMeasurement: { ...normal, salinity_sg: salinity },
      recentMeasurements: previous({ salinity_sg: salinity }),
      additiveEffects: [effect('anything', 'salinity', 'increase')],
    })
    assert.equal(advice.some(item => item.type === 'consult_shop'), true)
    assert.equal(advice.some(item => item.type === 'buy_additive'), false)
  }
})

test('abnormal temperature never creates additive purchase advice', () => {
  for (const temperature of [22, 29]) {
    const advice = buildLiteAdvice({
      latestMeasurement: { ...normal, temperature_c: temperature },
      recentMeasurements: previous({ temperature_c: temperature }),
      additiveEffects: [effect('anything', 'kh', 'increase')],
    })
    assert.equal(advice.some(item => item.type === 'consult_shop'), true)
    assert.equal(advice.some(item => item.type === 'buy_additive'), false)
  }
})

test('empty additive effects disables all purchase routing', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    recentMeasurements: previous({ kh_dkh: 6.7 }),
    additiveEffects: [],
  })
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
  assert.equal(advice.some(item => item.reason === 'additive_effects_unconfigured'), true)
})

test('two red values stop product routing', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 5, po4_ppm: 0.3 },
    recentMeasurements: previous({ kh_dkh: 5.2, po4_ppm: 0.28 }),
    additiveEffects: [effect('kh-product', 'kh', 'increase'), effect('po4-product', 'po4', 'decrease')],
  })
  assert.equal(advice.some(item => item.type === 'consult_shop'), true)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
})

test('unverified effects are excluded from owned-product and purchase routing', () => {
  const advice = buildLiteAdvice({
    latestMeasurement: { ...normal, kh_dkh: 6.8 },
    recentMeasurements: previous({ kh_dkh: 6.7 }),
    ownedAdditives: [{ additive_id: 'kh-product', is_active: true }],
    additiveEffects: [{ ...effect('kh-product', 'kh', 'increase'), verified: false }],
  })
  assert.equal(advice.some(item => item.type === 'use_owned_additive'), false)
  assert.equal(advice.some(item => item.type === 'buy_additive'), false)
  assert.equal(advice.some(item => item.type === 'consult_shop'), true)
})

test('repeated out-of-range requires two readings in the same direction', () => {
  assert.equal(isRepeatedOutOfRange('kh_dkh', { ...normal, kh_dkh: 6.8 }, previous({ kh_dkh: 6.7 })), true)
  assert.equal(isRepeatedOutOfRange('kh_dkh', { ...normal, kh_dkh: 6.8 }, previous({ kh_dkh: 8 })), false)
  assert.equal(isRepeatedOutOfRange('kh_dkh', { ...normal, kh_dkh: 6.8 }, previous({ kh_dkh: 10.5 })), false)
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

test('user-facing advice text never exposes internal identifiers', () => {
  const scenarios = [
    buildLiteAdvice({ latestMeasurement: {}, additiveEffects: [] }),
    buildLiteAdvice({
      latestMeasurement: { ...normal, kh_dkh: 6.8 },
      recentMeasurements: previous({ kh_dkh: 6.7 }),
      ownedAdditives: [{ additive_id: 'kh-product', is_active: true }],
      additiveEffects: [effect('kh-product', 'kh', 'increase')],
    }),
    buildLiteAdvice({
      latestMeasurement: { ...normal, po4_ppm: 0.15 },
      recentMeasurements: previous({ po4_ppm: 0.14 }),
      additiveEffects: [effect('another-product', 'po4', 'decrease')],
      preferredShop: { id: 'shop-1' },
    }),
  ]
  const forbidden = [
    'additive_effects',
    'parameter_key',
    'direction',
    'increase',
    'decrease',
    'consult_shop',
    'use_owned_additive',
    'buy_additive',
    'recommendation_type',
  ]
  for (const advice of scenarios.flat()) {
    const visibleText = `${advice.message || ''} ${advice.actionLabel || ''}`
    for (const term of forbidden) assert.equal(visibleText.includes(term), false)
  }
})
