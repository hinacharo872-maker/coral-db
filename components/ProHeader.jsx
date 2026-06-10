import Link from 'next/link'

export default function ProHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-emerald-900 bg-zinc-950/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
        <Link href="/pro" className="min-w-0">
          <span className="block text-xs font-bold text-emerald-400">REEF ANALYSIS</span>
          <strong className="block truncate text-lg text-white">ReefChart Pro</strong>
        </Link>
        <nav className="grid w-full grid-cols-3 border-t border-zinc-800 sm:flex sm:w-auto sm:border-0">
          <Link href="/pro" className="flex min-h-11 items-center justify-center px-2 py-2 text-sm font-bold text-emerald-100 hover:bg-zinc-900 sm:px-3">
            分析
          </Link>
          <Link href="/pro/measure" className="flex min-h-11 items-center justify-center px-2 py-2 text-sm font-bold text-emerald-100 hover:bg-zinc-900 sm:px-3">
            測定
          </Link>
          <Link href="/pro/events" className="flex min-h-11 items-center justify-center px-2 py-2 text-sm font-bold text-emerald-100 hover:bg-zinc-900 sm:px-3">
            イベント
          </Link>
          <Link href="/lite" className="hidden min-h-11 border-l border-zinc-700 px-3 py-2 text-sm text-zinc-400 hover:text-white sm:block">
            Liteへ
          </Link>
        </nav>
      </div>
    </header>
  )
}
