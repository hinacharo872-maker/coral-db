'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CoralCard from '@/components/CoralCard'
import Header from '@/components/Header'

export default function Home() {
  const [records, setRecords]   = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch]     = useState('')
  const [sourceType, setSourceType] = useState('')
  const [language, setLanguage]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    async function fetchRecords() {
      try {
        const { data, error } = await supabase
          .from('coral_database')
          .select('*')
          .order('published_date', { ascending: false })
        if (error) throw error
        setRecords(data ?? [])
      } catch (err) {
        setError('データの読み込みに失敗しました。設定を確認してください。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecords()
  }, [])

  useEffect(() => {
    let result = records
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.authors?.toLowerCase().includes(q) ||
        r.summary_jp?.toLowerCase().includes(q) ||
        r.value_category?.toLowerCase().includes(q)
      )
    }
    if (sourceType) result = result.filter(r => r.source_type === sourceType)
    if (language)   result = result.filter(r => r.language === language)
    setFiltered(result)
  }, [search, sourceType, language, records])

  const sourceTypes = [...new Set(records.map(r => r.source_type).filter(Boolean))]
  const languages   = [...new Set(records.map(r => r.language).filter(Boolean))]

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero */}
      <div className="bg-gradient-to-b from-blue-950 to-slate-900 text-white py-14 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">🪸 世界サンゴデータベース</h1>
        <p className="text-blue-200 text-lg max-w-2xl mx-auto">
          World Coral Research Database
        </p>
        <p className="text-blue-300 text-sm mt-2 max-w-xl mx-auto">
          世界中のサンゴ研究・文献データを集めた公開データベース
        </p>
        {!loading && records.length > 0 && (
          <p className="text-blue-400 text-sm mt-4">{records.length} 件の文献データを収録</p>
        )}
      </div>

      {/* Search & Filter */}
      <div className="bg-blue-950 border-b border-blue-900 py-4 px-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="タイトル・著者・カテゴリで検索..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2 rounded-lg bg-slate-900 border border-blue-800 text-white placeholder-blue-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={sourceType}
            onChange={e => setSourceType(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-blue-800 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">全ソースタイプ</option>
            {sourceTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-900 border border-blue-800 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">全言語</option>
            {languages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
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
            <p>該当するデータが見つかりませんでした</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <p className="text-slate-500 text-sm mb-4">{filtered.length} 件表示</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(record => (
                <CoralCard key={record.id} record={record} />
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
