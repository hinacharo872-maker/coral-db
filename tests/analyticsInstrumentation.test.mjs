import assert from 'node:assert/strict'
import test from 'node:test'
import { readFile } from 'node:fs/promises'

test('Vercel Analytics is mounted in the root layout', async () => {
  const layout = await readFile(new URL('../app/layout.js', import.meta.url), 'utf8')
  const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

  assert.equal(packageJson.dependencies['@vercel/analytics'], '^2.0.1')
  assert.match(layout, /from ['"]@vercel\/analytics\/next['"]/)
  assert.match(layout, /<Analytics\s*\/>/)
})

test('Lite success events contain no aquarium or user properties', async () => {
  const measurement = await readFile(new URL('../app/lite/measure/page.js', import.meta.url), 'utf8')
  const sharing = await readFile(new URL('../app/share/create/page.js', import.meta.url), 'utf8')

  assert.match(measurement, /trackLiteEvent\(['"]measurement_saved['"]\)/)
  assert.match(sharing, /trackLiteEvent\(['"]share_link_created['"]\)/)
  assert.doesNotMatch(measurement, /trackLiteEvent\(['"]measurement_saved['"],/)
  assert.doesNotMatch(sharing, /trackLiteEvent\(['"]share_link_created['"],/)
})
