import test from 'node:test'
import assert from 'node:assert/strict'
import { createNagarehanaDemo } from '../lib/liteDemo.js'

test('nagarehana demo is isolated and contains the complete shop review record', () => {
  const demo = createNagarehanaDemo()

  assert.equal(demo.isDemo, true)
  assert.equal(demo.tank.tank_volume_liters, 120)
  assert.equal(demo.tank.water_change_frequency_days, 14)
  assert.equal(demo.tank.water_change_volume_liters, 20)
  assert.equal(demo.measurements.length, 5)
  assert.equal(demo.additives.length, 3)
  assert.ok(demo.additives[0].additive_id)
  assert.equal(demo.additives[1].additive_id, null)
  assert.equal(demo.photos.length, 3)
  assert.equal(demo.checks.length, 4)
})

test('nagarehana demo shows falling KH and rising nutrients', () => {
  const demo = createNagarehanaDemo()
  const first = demo.measurements[0]
  const latest = demo.measurements.at(-1)

  assert.ok(latest.kh_dkh < first.kh_dkh)
  assert.ok(latest.no3_ppm > first.no3_ppm)
  assert.ok(latest.po4_ppm > first.po4_ppm)
  assert.ok(Math.abs(new Date(latest.measured_at) - new Date(first.measured_at)) >= 10 * 86400000)
})
