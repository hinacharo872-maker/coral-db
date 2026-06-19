import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildLiteEnvironmentParts,
  formatEquipment,
  formatPh,
  formatTankDimensions,
  formatTankVolume,
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
  assert.equal(hasLiteEnvironment({ tank_volume_liters: 120 }), true)
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

test('pH display removes unnecessary trailing zeros', () => {
  assert.equal(formatPh(8.2), '8.2')
  assert.equal(formatPh('8.25'), '8.25')
  assert.equal(formatPh(null), '')
  assert.equal(formatPh('not-a-number'), '')
})

test('tank dimensions support complete and partial input', () => {
  assert.equal(formatTankDimensions({
    tank_width_cm: 120,
    tank_depth_cm: 55,
    tank_height_cm: 55,
  }), '120 × 55 × 55 cm')
  assert.equal(formatTankDimensions({ tank_width_cm: 90 }), '幅 90 cm')
  assert.equal(formatTankDimensions({ tank_depth_cm: 45, tank_height_cm: 50 }), '奥行 45 cm / 高さ 50 cm')
  assert.equal(formatTankDimensions({}), '')
  assert.equal(formatTankVolume(350), '350 L')
  assert.equal(formatTankVolume(null), '')
})

test('diagram parts contain only entered environment details', () => {
  const parts = buildLiteEnvironmentParts({
    tank_volume_liters: 120,
    tank_width_cm: 120,
    tank_depth_cm: 55,
    tank_height_cm: 55,
    lighting_equipment: [{ name: 'Spectra SP200', quantity: 2 }],
    wave_pumps: [{ name: 'MP40', quantity: 2 }],
    filtration_method: 'オーバーフロー',
    salt_mix_name: 'Red Sea Blue Bucket',
    ph: 8.2,
  })

  assert.deepEqual(parts.map(part => part.key), [
    'tank',
    'lighting',
    'wave',
    'filtration',
    'salt',
    'ph',
  ])
  assert.deepEqual(parts[0].details, [
    '水槽サイズ：120 × 55 × 55 cm',
    '実水量：120 L',
    '濾過方式：オーバーフロー',
  ])
  assert.equal(parts[1].value, 'Spectra SP200 ×2')
  assert.equal(parts[2].value, 'MP40 ×2')
  assert.equal(parts.at(-1).value, '8.2')
})

test('diagram parts omit missing optional equipment', () => {
  assert.deepEqual(buildLiteEnvironmentParts({}), [])
  assert.deepEqual(
    buildLiteEnvironmentParts({ tank_volume_liters: 90, ph: 8.1 }).map(part => part.key),
    ['tank', 'ph'],
  )
  assert.deepEqual(
    buildLiteEnvironmentParts({ salt_mix_name: 'Reef Salt' }).map(part => part.key),
    ['salt'],
  )
})
