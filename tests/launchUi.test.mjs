import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { feedbackUrl } from '../lib/publicFeatures.js'

test('feedback URL stays hidden when unset and preserves a configured URL', () => {
  assert.equal(feedbackUrl(undefined), '')
  assert.equal(feedbackUrl('   '), '')
  assert.equal(feedbackUrl(' https://example.com/feedback '), 'https://example.com/feedback')
})

test('Lite beta banner is used only by Lite route pages', async () => {
  const litePages = [
    '../app/lite/page.js',
    '../app/lite/measure/page.js',
    '../app/lite/profile/page.js',
    '../app/lite/record/page.js',
    '../app/lite/shop-card/page.js',
  ]

  for (const page of litePages) {
    const source = await readFile(new URL(page, import.meta.url), 'utf8')
    assert.match(source, /LiteBetaBanner/)
  }

  const proSource = await readFile(new URL('../app/pro/page.js', import.meta.url), 'utf8')
  const legacySource = await readFile(new URL('../app/legacy/page.js', import.meta.url), 'utf8')
  assert.doesNotMatch(proSource, /LiteBetaBanner/)
  assert.doesNotMatch(legacySource, /LiteBetaBanner/)
})

test('feedback link is limited to Lite home and shop card', async () => {
  const home = await readFile(new URL('../app/lite/page.js', import.meta.url), 'utf8')
  const shopCard = await readFile(new URL('../app/lite/shop-card/page.js', import.meta.url), 'utf8')
  const component = await readFile(new URL('../components/LiteFeedbackLink.jsx', import.meta.url), 'utf8')

  assert.match(home, /LiteFeedbackLink/)
  assert.match(shopCard, /LiteFeedbackLink/)
  assert.match(component, /target="_blank"/)
  assert.match(component, /if \(!href\) return null/)
})
