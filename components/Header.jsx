import Link from 'next/link'
import { isProEnabled } from '@/lib/publicFeatures'

export default function Header() {
  const proEnabled = isProEnabled(process.env.NEXT_PUBLIC_PRO_ENABLED)

  return (
    <header className="sticky top-0 z-30 border-b border-cyan-900/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white transition-colors hover:text-cyan-200">
          <span aria-hidden="true" className="text-cyan-300">◆</span>
          ReefChart Lite
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/lite" className="min-h-10 border border-cyan-700 px-3 py-2 text-sm font-bold text-cyan-100 hover:border-cyan-300">
            Lite
          </Link>
          <Link href="/lite/shop-card" className="hidden min-h-10 border border-cyan-700 px-3 py-2 text-sm font-bold text-cyan-100 hover:border-cyan-300 sm:inline-flex sm:items-center">
            ショップに見せる
          </Link>
          {proEnabled && (
            <Link href="/pro" className="min-h-10 border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-200 hover:border-emerald-300">
              Pro
            </Link>
          )}
          <Link href="/privacy" className="hidden min-h-10 px-2 py-2 text-sm font-bold text-slate-300 hover:text-white sm:inline-block">
            Privacy
          </Link>
          <Link href="/terms" className="hidden min-h-10 px-2 py-2 text-sm font-bold text-slate-300 hover:text-white sm:inline-block">
            Terms
          </Link>
        </nav>
      </div>
    </header>
  )
}
