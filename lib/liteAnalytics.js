import { track } from '@vercel/analytics'

const ALLOWED_EVENTS = new Set([
  'measurement_saved',
  'share_link_created',
])

export function trackLiteEvent(name) {
  if (!ALLOWED_EVENTS.has(name)) return

  try {
    track(name)
  } catch {
    // Analytics must never interrupt a successful user action.
  }
}
