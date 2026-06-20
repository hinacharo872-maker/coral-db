import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('Lite starts without showing an email form as the primary action', () => {
  const source = read('app/lite/page.js')
  assert.match(source, /メールなしで使ってみる/)
  assert.match(source, /この端末だけに記録して、すぐ試せます/)
  assert.match(source, /ログインして記録を保存/)
  assert.match(source, /showLogin &&/)
})

test('guest measurement, environment, water change, and additive screens use local storage', () => {
  assert.match(read('app/lite/measure/page.js'), /addMeasurement/)
  assert.match(read('app/lite/profile/page.js'), /saveTankProfile/)
  const record = read('app/lite/record/page.js')
  assert.match(record, /addWaterChange/)
  assert.match(record, /addAdditive/)
  assert.match(record, /写真を残すにはログインが必要です/)
})

test('authenticated save paths remain connected to Supabase', () => {
  assert.match(read('app/lite/measure/page.js'), /from\('lite_measurements'\)\.insert/)
  assert.match(read('app/lite/profile/page.js'), /from\('lite_tank_profiles'\)/)
  const record = read('app/lite/record/page.js')
  assert.match(record, /record_lite_water_change/)
  assert.match(record, /from\('lite_additive_usage'\)\.insert/)
  assert.match(record, /from\('lite_tank_photos'\)\.insert/)
})
