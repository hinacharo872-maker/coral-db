import { NextResponse } from 'next/server'
import { isProEnabled } from './lib/publicFeatures'

export function middleware(request) {
  if (!isProEnabled(process.env.NEXT_PUBLIC_PRO_ENABLED)) {
    return NextResponse.redirect(new URL('/lite', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/pro/:path*',
}

