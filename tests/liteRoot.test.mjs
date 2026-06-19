import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

const rootSource = readFileSync(new URL('../app/page.js', import.meta.url), 'utf8')
const legacySource = readFileSync(new URL('../app/legacy/page.js', import.meta.url), 'utf8')

test('root route is the ReefChart Lite beta entrance', () => {
  for (const requiredText of [
    'ReefChart Lite β版',
    '海水水槽の状態を、ショップに見せやすくする無料ログアプリです',
    'Liteをはじめる',
    '水質を記録',
    '水換えを記録',
    '添加剤を記録',
    '写真を追加',
    'ショップに見せる',
    'KH（炭酸塩硬度）',
    '水温',
    '塩分濃度',
    '硝酸塩（NO3）',
    'リン酸塩（PO4）',
  ]) {
    assert.equal(rootSource.includes(requiredText), true, `missing root copy: ${requiredText}`)
  }
})

test('root route does not import or expose the legacy full application', () => {
  for (const forbiddenText of [
    'WaterQualityDashboard',
    'PRIVATE REEF LOG',
    '8項目',
    'サンゴDB',
    '品質監査',
    'Supabase',
    'カルシウム（Ca）',
    'マグネシウム（Mg）',
    'カスタム項目',
    'デモを見る',
  ]) {
    assert.equal(rootSource.includes(forbiddenText), false, `legacy copy leaked into root: ${forbiddenText}`)
  }
})

test('legacy full application remains isolated under the legacy route', () => {
  assert.equal(legacySource.includes('WaterQualityDashboard'), true)
  assert.equal(legacySource.includes('8項目'), true)
  assert.equal(legacySource.includes('サンゴDB'), true)
})
