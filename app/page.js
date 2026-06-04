'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CoralCard from '@/components/CoralCard'
import CoralIdentityDashboard from '@/components/CoralIdentityDashboard'
import CoralQualityDashboard from '@/components/CoralQualityDashboard'
import Header from '@/components/Header'
import WaterQualityDashboard from '@/components/WaterQualityDashboard'

const TABS = [
  { id: 'water', label: '水質管理' },
  { id: 'coral', label: 'サンゴDB' },
  { id: 'identity', label: 'DB整理' },
  { id: 'quality', label: 'DB品質' },
]

export default function Home() {
  const [records, setRecords] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [activeView, setActiveView] = useState('water')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchRecords() {
      try {
        const { data, count, error } = await supabase
          .from('curated_coral_catalog')
          .select('*', { count: 'exact' })
          .order('id', { ascending: true })
          .limit(1000)

        if (error) throw error
        setRecords(data ?? [])
        setTotalCount(count ?? data?.length ?? 0)
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
      const query = search.toLowerCase()
      result = result.filter(record =>
        record.trade_name?.toLowerCase().includes(query) ||
        record.common_name_jp?.toLowerCase().includes(query) ||
        record.genus?.toLowerCase().includes(query) ||
        record.species?.toLowerCase().includes(query) ||
        record.brand_prefix?.toLowerCase().includes(query) ||
        record.source_shop?.toLowerCase().includes(query)
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
            <p className="text-cyan-200 text-sm font-semibold">Marine aquarium manager</p>
            <h1 className="text-3xl md:text-5xl font-bold mt-2">Aqua Reef Log</h1>
            <p className="text-slate-300 text-base md:text-lg mt-3 leading-relaxed">
              海水水槽の水質測定と、根拠を追跡できるサンゴデータベースをまとめて管理します。
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
            <SummaryCard label="水質ログ" value="8項目" />
            <SummaryCard label="サンゴDB" value={totalCount.toLocaleString('ja-JP')} />
            <SummaryCard label="品質監査" value="常時更新" />
            <SummaryCard label="データ基盤" value="Supabase" />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 border-b border-slate-800 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeView === tab.id
                  ? 'border-cyan-400 text-cyan-200'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeView === 'water' && <WaterQualityDashboard />}
        {activeView === 'identity' && <CoralIdentityDashboard />}
        {activeView === 'quality' && <CoralQualityDashboard />}
        {activeView === 'coral' && (
          <CoralBrowser
            records={records}
            filtered={filtered}
            categories={categories}
            category={category}
            search={search}
            loading={loading}
            error={error}
            totalCount={totalCount}
            setCategory={setCategory}
            setSearch={setSearch}
          />
        )}
      </main>
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="border border-cyan-900/70 bg-slate-950/50 rounded-lg p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}

function CoralBrowser({
  records,
  filtered,
  categories,
  category,
  search,
  loading,
  error,
  totalCount,
  setCategory,
  setSearch,
}) {
  return (
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
            <FilterButton active={category === ''} onClick={() => setCategory('')}>すべて</FilterButton>
            {categories.map(item => (
              <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>
                {item}
              </FilterButton>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="text-center py-20 text-cyan-300">データを読み込み中...</div>}
      {error && <div className="text-center py-20 text-rose-300">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-cyan-300">
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
          <p className="text-slate-500 text-sm mb-4">
            全 {totalCount.toLocaleString('ja-JP')} 件中、先頭 {records.length.toLocaleString('ja-JP')} 件から {filtered.length.toLocaleString('ja-JP')} 件表示
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(coral => <CoralCard key={coral.id} coral={coral} />)}
          </div>
        </>
      )}
    </section>
  )
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs px-3 py-1 rounded-full border transition-colors ${
        active
          ? 'bg-cyan-600 border-cyan-500 text-white'
          : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-cyan-500 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
