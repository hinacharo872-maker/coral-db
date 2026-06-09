const DEFAULT_SITE_URL = 'https://reefchart.vercel.app'

export function configuredSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')
}

export function browserSiteUrl() {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return window.location.origin
  }
  return configuredSiteUrl()
}

export function absoluteSiteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${configuredSiteUrl()}${normalizedPath}`
}
