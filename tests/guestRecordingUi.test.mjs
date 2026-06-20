import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('Lite starts with a simple primary action and no initial email form', () => {
  const source = read('app/lite/page.js')
  assert.match(source, />\s*はじめる\s*</)
  assert.match(source, /この端末だけに記録して、すぐ試せます/)
  assert.match(source, /デモを見る/)
  assert.doesNotMatch(source, /type="email"/)
  assert.doesNotMatch(source, /ログインして記録を保存/)
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

test('guest landing keeps the environment-controlled feedback link', () => {
  const source = read('app/lite/page.js')
  assert.match(source, /<LiteFeedbackLink\s*\/>/)
})
