import assert from 'node:assert/strict'
import test from 'node:test'
import { GUEST_LITE_STORAGE_KEY, LocalLiteStore } from '../lib/localLiteStore.js'

function memoryStorage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }
}

function createStore(storage = memoryStorage()) {
  let id = 0
  let second = 0
  return new LocalLiteStore(storage, {
    now: () => `2026-06-20T00:00:${String(second++).padStart(2, '0')}.000Z`,
    createId: () => `local-${++id}`,
  })
}

test('guest data uses a versioned key and preserves an existing session', () => {
  const storage = memoryStorage()
  const store = createStore(storage)
  const first = store.start()
  const second = store.start()

  assert.equal(GUEST_LITE_STORAGE_KEY, 'reefchart_lite_guest_v1')
  assert.equal(first.tank.id, 'guest-tank-v1')
  assert.equal(second.started_at, first.started_at)
  assert.equal(JSON.parse(storage.getItem(GUEST_LITE_STORAGE_KEY)).version, 1)
})

test('guest profile and measurements are restored for the shop card', () => {
  const store = createStore()
  store.saveTankProfile({
    tank_width_cm: 120,
    tank_depth_cm: 55,
    tank_height_cm: 55,
    tank_volume_liters: 350,
    ph: 8.2,
    salt_mix_name: 'Reef Salt',
    lighting_equipment: [{ name: 'LED', quantity: 2 }],
    wave_pumps: [{ name: 'Wave Pump', quantity: 2 }],
    filtration_method: 'オーバーフロー',
  })
  store.addMeasurement({ kh_dkh: 8, temperature_c: 25, salinity_sg: 1.025 })
  store.addMeasurement({ no3_ppm: 5, po4_ppm: 0.04 })

  const record = store.buildShopRecord()
  assert.equal(record.isGuest, true)
  assert.equal(record.tank.tank_volume_liters, 350)
  assert.equal(record.parameterLatest.kh_dkh.value, 8)
  assert.equal(record.parameterLatest.po4_ppm.value, 0.04)
  assert.equal(record.photo, null)
})

test('guest water changes and additives stay on the device', () => {
  const store = createStore()
  store.addWaterChange({
    changed_at: '2026-06-20T08:00:00.000Z',
    tank_volume_liters: 120,
    change_volume_liters: 20,
    water_change_frequency_days: 7,
  })
  store.addAdditive({
    brand_snapshot: 'Example',
    product_name_snapshot: 'Buffer',
    amount_text: '5 ml',
    frequency: 'daily',
  })

  const data = store.read()
  assert.equal(data.tank.last_water_change_at, '2026-06-20T08:00:00.000Z')
  assert.equal(data.tank.water_change_volume_liters, 20)
  assert.equal(data.water_changes.length, 1)
  assert.equal(data.additives[0].product_name_snapshot, 'Buffer')
})

test('guest photos stay on the device and the latest photo appears in the shop card', () => {
  const store = createStore()
  store.addPhoto({ photo_url: 'data:image/jpeg;base64,first', taken_at: '2026-06-19T12:00:00.000Z' })
  store.addPhoto({ photo_url: 'data:image/jpeg;base64,latest', taken_at: '2026-06-20T12:00:00.000Z', note: '今日' })

  const record = store.buildShopRecord()
  assert.equal(record.photo.photo_url, 'data:image/jpeg;base64,latest')
  assert.equal(record.photo.note, '今日')
})

test('guest data saved before photo support remains readable', () => {
  const storage = memoryStorage()
  const store = createStore(storage)
  const data = store.start()
  delete data.photos
  storage.setItem(GUEST_LITE_STORAGE_KEY, JSON.stringify(data))

  assert.deepEqual(store.read().photos, [])
})

test('invalid or unavailable local data does not crash the app', () => {
  const storage = memoryStorage()
  storage.setItem(GUEST_LITE_STORAGE_KEY, '{broken')
  assert.equal(createStore(storage).read(), null)
  assert.equal(new LocalLiteStore(null).read(), null)
})
