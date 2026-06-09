import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 px-4 py-6 text-slate-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>ReefChart Lite β版</p>
        <nav className="flex gap-5">
          <Link href="/privacy" className="min-h-11 py-3 hover:text-white">プライバシーポリシー</Link>
          <Link href="/terms" className="min-h-11 py-3 hover:text-white">利用規約</Link>
        </nav>
      </div>
    </footer>
  )
}
