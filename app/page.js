'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CoralCard from '@/components/CoralCard'
import Header from '@/components/Header'
import WaterQualityDashboard from '@/components/WaterQualityDashboard'

export default function Home() {
  const [records, setRecords] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [activeView, setActiveView] = useState('water')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRecords() {
      try {
        const { data, error } = await supabase
          .from('coral_master_list')
          .select('*')
          .order('id', { ascending: true })
        if (error) throw error
        setRecords(data ?? [])
      } catch (err) {
        setError('サンゴデータの読み込みに失敗しました。Supabase設定を確認してください。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  const categories = useMemo(
    () => [...new Set(records.map(record => record.coral_category).filter(Boolean))].sort(),
    [records]
  )

  const filtered = useMemo(() => {
    let result = records
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(record =>
        record.trade_name?.toLowerCase().includes(q) ||
        record.common_name_jp?.toLowerCase().includes(q) ||
        record.genus?.toLowerCase().includes(q) ||
        record.species?.toLowerCase().includes(q) ||
        record.brand_prefix?.toLowerCase().includes(q) ||
        record.source_shop?.toLowerCase().includes(q)
      )
    }
    if (category) result = result.filter(record => record.coral_category === category)
    return result
  }, [search, category, records])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_30%),linear-gradient(135deg,_#082f49,_#020617_65%)]">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <div className="max-w-3xl">
            <p className="text-cyan-200 text-sm font-semibold tracking-wide">Marine aquarium manager</p>
            <h1 className="text-3xl md:text-5xl font-bold mt-2">Aqua Reef Log</h1>
            <p className="text-slate-300 text-base md:text-lg mt-3 leading-relaxed">
              海水水槽の水質測定を記録し、サンゴデータベースとつなげて管理するためのアプリです。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <div className="border border-cyan-900/70 bg-slate-950/50 rounded-lg p-4">
              <p className="text-xs text-slate-400">水質ログ</p>
              <p className="text-2xl font-bold text-white mt-1">8項目</p>
            </div>
            <div className="border border-cyan-900/70 bg-slate-950/50 rounded-lg p-4">
              <p className="text-xs text-slate-400">サンゴDB</p>
              <p className="text-2xl font-bold text-white mt-1">{records.length}</p>
            </div>
            <div className="border border-cyan-900/70 bg-slate-950/50 rounded-lg p-4">
              <p className="text-xs text-slate-400">保存先</p>
              <p className="text-2xl font-bold text-white mt-1">Local</p>
            </div>
            <div className="border border-cyan-900/70 bg-slate-950/50 rounded-lg p-4">
              <p className="text-xs text-slate-400">DB連携</p>
              <p className="text-2xl font-bold text-white mt-1">Supabase</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 border-b border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveView('water')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeView === 'water'
                ? 'border-cyan-400 text-cyan-200'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            水質管理
          </button>
          <button
            type="button"
            onClick={() => setActiveView('coral')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeView === 'coral'
                ? 'border-cyan-400 text-cyan-200'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            サンゴDB
          </button>
        </div>

        {activeView === 'water' ? (
          <WaterQualityDashboard />
        ) : (
          <section>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-5 space-y-3">
              <input
                type="text"
                placeholder="トレード名、日本語名、属名、ショップ名で検索"
                value={search}
                onChange={event => setSearch(event.target.value)}
                className="w-full px-4 py-2.5 rounded-md bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
              />

              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-slate-400 text-xs font-medium shrink-0">カテゴリ:</span>
                  <button
                    type="button"
                    onClick={() => setCategory('')}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      category === ''
                        ? 'bg-cyan-600 border-cyan-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-cyan-500 hover:text-white'
                    }`}
                  >
                    すべて
                  </button>
                  {categories.map(item => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                        category === item
                          ? 'bg-cyan-600 border-cyan-500 text-white'
                          : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-cyan-500 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading && (
              <div className="text-center py-20 text-cyan-300">
                <div className="text-5xl mb-4 animate-pulse">◇</div>
                <p>データを読み込み中...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">!</div>
                <p className="text-rose-300">{error}</p>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="text-center py-20 text-cyan-300">
                <div className="text-5xl mb-4">◇</div>
                <p>該当するサンゴが見つかりませんでした。</p>
                <button
                  type="button"
                  onClick={() => { setSearch(''); setCategory('') }}
                  className="mt-4 text-sm text-cyan-300 hover:text-cyan-100 underline"
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
          </section>
        )}
      </main>
    </div>
  )
}
