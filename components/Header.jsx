import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-cyan-900/60 bg-slate-950/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white transition-colors hover:text-cyan-200">
          <span aria-hidden="true" className="text-cyan-300">◆</span>
          Aqua Reef Log
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/lite-preview" className="hidden min-h-10 border border-slate-700 px-3 py-2 text-sm font-bold text-slate-200 hover:border-cyan-500 sm:block">
            Liteレビュー
          </Link>
          <Link href="/share/create" className="min-h-10 border border-cyan-700 px-3 py-2 text-sm font-bold text-cyan-100 hover:border-cyan-300">
            ショップ共有
          </Link>
        </nav>
      </div>
    </header>
  )
}
