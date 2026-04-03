'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import CoralCard from '@/components/CoralCard'
import Header from '@/components/Header'

const CORAL_TYPES = [
  { value: '',     label: 'すべて' },
  { value: 'SPS',  label: 'SPS' },
  { value: 'LPS',  label: 'LPS' },
  { value: 'soft', label: 'ソフト' },
]

const DIFFICULTIES = [
  { value: '',             label: 'すべて' },
  { value: 'beginner',     label: '初心者' },
  { value: 'intermediate', label: '中級者' },
  { value: 'advanced',     label: '上級者' },
]

export default function Home() {
  const [records, setRecords] = useState([])
  const [search, setSearch]   = useState('')
  const [coralType, setCoralType] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchRecords() {
      try {
        const { data, error } = await supabase
          .from('coral_encyclopedia')
          .select('*')
          .order('coral_type', { ascending: true })
        if (error) throw error
        setRecords(data ?? [])
      } catch (err) {
        setError('データの読み込みに失敗しました。Supabase の設定を確認してください。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  const filtered = useMemo(() => {
    let result = records
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.common_name_ja?.toLowerCase().includes(q) ||
        r.common_name_en?.toLowerCase().includes(q) ||
        r.scientific_name?.toLowerCase().includes(q) ||
        r.genus?.toLowerCase().includes(q) ||
        r.family?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
      )
    }
    if (coralType) result = result.filter(r => r.coral_type === coralType)
    if (difficulty) result = result.filter(r => r.difficulty === difficulty)
    return result
  }, [search, coralType, difficulty, records])

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-950 to-slate-900 text-white py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">🪸 サンゴ図鑑</h1>
        <p className="text-blue-200 text-lg">Coral Encyclopedia</p>
        {!loading && records.length > 0 && (
          <p className="text-blue-400 text-sm mt-3">{records.length} 種類のサンゴを収録</p>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-blue-950/80 backdrop-blur border-b border-blue-900 py-4 px-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto space-y-3">

          {/* Search input */}
          <input
            type="text"
            placeholder="サンゴ名・学名・属名で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-blue-800 text-white placeholder-blue-500 focus:outline-none focus:border-blue-400 text-sm"
          />

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-400 text-xs font-medium shrink-0">種別:</span>
            {CORAL_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setCoralType(t.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  coralType === t.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
            <span className="text-slate-600 mx-1">|</span>
            <span className="text-slate-400 text-xs font-medium shrink-0">難易度:</span>
            {DIFFICULTIES.map(d => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  difficulty === d.value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
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
            <button
              onClick={() => { setSearch(''); setCoralType(''); setDifficulty('') }}
              className="mt-4 text-sm text-blue-400 hover:text-blue-200 underline"
            >
              フィルターをリセット
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-slate-500 text-sm mb-4">{filtered.length} 件表示</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(coral => (
                <CoralCard key={coral.id} coral={coral} />
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="text-center py-8 text-slate-600 text-sm border-t border-slate-800 mt-8">
        Coral Encyclopedia — サンゴ図鑑
      </footer>
    </div>
  )
}
