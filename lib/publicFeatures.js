export function isProEnabled(value) {
  return value === 'true'
}

export function feedbackUrl(value) {
  return typeof value === 'string' ? value.trim() : ''
}
