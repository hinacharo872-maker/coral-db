import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-blue-950 border-b border-blue-900 py-3 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-white font-bold text-lg flex items-center gap-2 hover:text-blue-200 transition-colors">
          🪸 World Coral DB
        </Link>
        <span className="text-blue-400 text-sm hidden sm:block">世界サンゴデータベース</span>
      </div>
    </header>
  )
}
