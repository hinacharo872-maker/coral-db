'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import CoralCard from '@/components/CoralCard'
import Header from '@/components/Header'

const DIFFICULTIES = [
  { value: '',  label: 'すべて' },
  { value: '2', label: '初心者 (Lv.1-2)' },
  { value: '3', label: '中級者 (Lv.3)' },
  { value: '4', label: '上級者 (Lv.4-5)' },
]

export default function Home() {
  const [records, setRecords] = useState([])
  const [search, setSearch]   = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchRecords() {
      try {
        const { data, error } = await supabase
          .from('coral_encyclopedia')
          .select('*')
          .order('id', { ascending: true })
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

  const sourceTypes = useMemo(
    () => [...new Set(records.map(r => r.source_type).filter(Boolean))],
    [records]
  )

  const filtered = useMemo(() => {
    let result = records
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.species_name?.toLowerCase().includes(q) ||
        r.common_name?.toLowerCase().includes(q) ||
        r.common_name_jp?.toLowerCase().includes(q) ||
        r.scientific_name?.toLowerCase().includes(q) ||
        r.summary_jp?.toLowerCase().includes(q)
      )
    }
    if (difficulty) {
      const lv = Number(difficulty)
      result = result.filter(r => {
        if (lv <= 2) return r.difficulty != null && r.difficulty <= 2
        if (lv === 3) return r.difficulty === 3
        return r.difficulty != null && r.difficulty >= 4
      })
    }
    if (sourceType) result = result.filter(r => r.source_type === sourceType)
    return result
  }, [search, difficulty, sourceType, records])

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-950 to-slate-900 text-white py-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">🪸 サンゴ図鑑</h1>
        <p className="text-blue-200 text-lg">Coral Encyclopedia</p>
        {!loading && records.length > 0 && (
          <p className="text-blue-400 text-sm mt-3">{records.length} 件収録</p>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-blue-950/80 backdrop-blur border-b border-blue-900 py-4 px-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto space-y-3">

          {/* Search */}
          <input
            type="text"
            placeholder="サンゴ名（日本語・英語）・学名で検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-slate-900 border border-blue-800 text-white placeholder-blue-500 focus:outline-none focus:border-blue-400 text-sm"
          />

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2 items-center">
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
            {sourceTypes.length > 0 && (
              <>
                <span className="text-slate-600 mx-1">|</span>
                <span className="text-slate-400 text-xs font-medium shrink-0">ソース:</span>
                <button
                  onClick={() => setSourceType('')}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    sourceType === ''
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white'
                  }`}
                >
                  すべて
                </button>
                {sourceTypes.map(t => (
                  <button
                    key={t}
                    onClick={() => setSourceType(t)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      sourceType === t
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-500 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </>
            )}
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
              onClick={() => { setSearch(''); setDifficulty(''); setSourceType('') }}
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
