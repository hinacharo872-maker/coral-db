import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatEquipment,
  hasLiteEnvironment,
  normalizeEquipment,
} from '../lib/liteEnvironment.js'

test('optional environment stays absent when every field is empty', () => {
  assert.equal(hasLiteEnvironment({}), false)
  assert.equal(hasLiteEnvironment({
    ph: null,
    salt_mix_name: '',
    lighting_equipment: null,
    wave_pumps: [],
    filtration_method: '',
  }), false)
})

test('each optional environment field can make the summary visible', () => {
  assert.equal(hasLiteEnvironment({ ph: 8.2 }), true)
  assert.equal(hasLiteEnvironment({ salt_mix_name: 'Reef Salt' }), true)
  assert.equal(hasLiteEnvironment({ lighting_equipment: [{ name: 'LED', quantity: 1 }] }), true)
  assert.equal(hasLiteEnvironment({ wave_pumps: [{ name: 'Pump', quantity: 1 }] }), true)
  assert.equal(hasLiteEnvironment({ filtration_method: 'オーバーフロー' }), true)
})

test('equipment values are trimmed, bounded, and empty names are removed', () => {
  assert.deepEqual(normalizeEquipment([
    { name: '  Spectra SP200  ', quantity: '2' },
    { name: '', quantity: 4 },
    { name: 'MP40', quantity: 120 },
  ]), [
    { name: 'Spectra SP200', quantity: 2 },
    { name: 'MP40', quantity: 99 },
  ])
  assert.deepEqual(normalizeEquipment('not-an-array'), [])
})

test('equipment display only appends a multiplier for multiple units', () => {
  assert.equal(formatEquipment({ name: 'MP40', quantity: 2 }), 'MP40 ×2')
  assert.equal(formatEquipment({ name: 'AI Prime', quantity: 1 }), 'AI Prime')
  assert.equal(formatEquipment({}), '')
})
