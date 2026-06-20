import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

test('guest shop card reads the local record and keeps the environment diagram', () => {
  const source = read('app/lite/shop-card/page.js')
  assert.match(source, /buildShopRecord/)
  assert.match(source, /<LiteEnvironmentSummary tank=\{record\.tank\}/)
  assert.match(source, /この端末に保存した記録を表示しています/)
  assert.match(source, /href="\/share\/create"/)
})

test('guest share creation explains why login is required and preserves local data', () => {
  const source = read('app/share/create/page.js')
  assert.match(source, /共有リンクを作るにはログインが必要です/)
  assert.match(source, /共有リンクはクラウドに保存して発行するため、無料ログインが必要です/)
  assert.match(source, /ログイン後にこの端末の記録を移行できます（準備中）/)
  assert.doesNotMatch(source, /localStorage\.removeItem/)
})

test('guest start analytics sends only the event name', () => {
  const home = read('app/lite/page.js')
  const analytics = read('lib/liteAnalytics.js')
  assert.match(home, /trackLiteEvent\('lite_guest_started'\)/)
  assert.doesNotMatch(home, /trackLiteEvent\('lite_guest_started',/)
  assert.match(analytics, /'lite_guest_started'/)
})
