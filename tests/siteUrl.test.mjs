import assert from 'node:assert/strict'
import test from 'node:test'
import { absoluteSiteUrl, configuredSiteUrl } from '../lib/siteUrl.js'

test('site URL defaults to the ReefChart beta production URL', () => {
  assert.equal(configuredSiteUrl(), 'https://reefchart.vercel.app')
  assert.equal(absoluteSiteUrl('/privacy'), 'https://reefchart.vercel.app/privacy')
})
