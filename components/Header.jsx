import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-slate-950/95 border-b border-cyan-900/60 py-3 px-4 sticky top-0 z-30 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="text-white font-bold text-lg flex items-center gap-2 hover:text-cyan-200 transition-colors">
          <span aria-hidden="true" className="text-cyan-300">◇</span>
          Aqua Reef Log
        </Link>
        <span className="text-cyan-300 text-sm hidden sm:block">水質管理とサンゴデータベース</span>
      </div>
    </header>
  )
}
