import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'
import { isProEnabled } from '../lib/publicFeatures.js'

test('Pro is enabled only by the exact public feature flag value', () => {
  assert.equal(isProEnabled('true'), true)
  assert.equal(isProEnabled('false'), false)
  assert.equal(isProEnabled('TRUE'), false)
  assert.equal(isProEnabled(undefined), false)
})

test('Pro middleware covers the full Pro route tree and redirects to Lite', async () => {
  const source = await readFile(new URL('../middleware.js', import.meta.url), 'utf8')

  assert.match(source, /matcher:\s*['"]\/pro\/:path\*['"]/)
  assert.match(source, /NextResponse\.redirect\(new URL\(['"]\/lite['"]/)
  assert.match(source, /NextResponse\.next\(\)/)
})
