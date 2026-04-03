'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CoralCard from '@/components/CoralCard'
import Header from '@/components/Header'

export default function Home() {
  const [corals, setCorals]     = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch]     = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [coralType, setCoralType]   = useState('')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchCorals() {
      try {
        const { data, error } = await supabase
          .from('coral_database')
          .select('*')
          .order('scientific_name')
        if (error) throw error
        setCorals(data ?? [])
      } catch (err) {
        setError('データの読み込みに失敗しました。設定を確認してください。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCorals()
  }, [])

  useEffect(() => {
    let result = corals
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(c =>
        c.scientific_name?.toLowerCase().includes(q) ||
        c.common_name_en?.toLowerCase().includes(q) ||
        c.common_name_ja?.toLowerCase().includes(q) ||
        c.origin_region?.toLowerCase().includes(q) ||
        c.family?.toLowerCase().includes(q)
      )
    }
    if (difficulty) result = result.filter(c => c.difficulty === difficulty)
    if (coralType)  result = result.filter(c => c.coral_type === coralType)
    setFiltered(result)
  }, [search, difficulty, coralType, corals])

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-950 to-slate-900 text-white py-14 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">🪸 世界サンゴデータベース</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">
          World Coral Cultivation Database
        </p>
        <p className="text-blue-300 text-sm mt-2 max-w-xl mx-auto">
          世界中のサンゴ飼育データを集めた公開データベース
        </p>
        {!loading && corals.length > 0 && (
          <p className="text-blue-400 text-sm mt-4">{corals.length} 種のサンゴデータを収録</p>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-blue-950 border-b border-blue-900 py-4 px-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="学名・通称・産地で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 rounded-lg bg-slate-900 border border-blue-800 text-white placeholder-blue-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={coralType}
            onChange={e => setCoralType(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-blue-800 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">全タイプ</option>
            <option value="SPS">SPS</option>
            <option value="LPS">LPS</option>
            <option value="soft">ソフトコーラル</option>
          </select>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-blue-800 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">全難易度</option>
            <option value="beginner">初心者向け</option>
            <option value="intermediate">中級者向け</option>
            <option value="advanced">上級者向け</option>
          </select>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-20 text-blue-300">
            <div className="text-5xl mb-4 animate-pulse">🪸</div>
            <p>データを読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-rose-300">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-20 text-blue-400">
            <div className="text-5xl mb-4">🔍</div>
            <p>該当するサンゴが見つかりませんでした</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-slate-500 text-sm mb-4">{filtered.length} 件表示</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(coral => (
                <CoralCard key={coral.id} coral={coral} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="text-center py-8 text-slate-600 text-sm border-t border-slate-800 mt-8">
        World Coral Database — 世界サンゴデータベース
      </footer>
    </div>
  )
}
