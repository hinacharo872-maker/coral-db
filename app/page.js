'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import CoralCard from '@/components/CoralCard'
import CoralCleanupDashboard from '@/components/CoralCleanupDashboard'
import CoralIdentityDashboard from '@/components/CoralIdentityDashboard'
import CoralQualityDashboard from '@/components/CoralQualityDashboard'
import Header from '@/components/Header'
import WaterQualityDashboard from '@/components/WaterQualityDashboard'
import { useCoralWaterMatch } from '@/hooks/useCoralWaterMatch'

const LANGUAGES = [
  { code: 'ja', label: '日本語' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
  { code: 'zh', label: '中文' },
]

const PAGE_TEXT = {
  ja: {
    tabs: { water: '水質管理', coral: 'サンゴDB', identity: 'DB整理', cleanup: '追加整理', quality: 'DB品質' },
    language: '言語',
    heroKicker: 'Marine aquarium manager',
    heroTitle: 'Aqua Reef Log',
    heroBody: '海水水槽の水質測定と、根拠を追跡できるサンゴデータベースをまとめて管理します。',
    summaryWater: '水質ログ',
    summaryWaterValue: '8項目',
    summaryCoral: 'サンゴDB',
    summaryQuality: '品質監査',
    summaryQualityValue: '常時更新',
    summaryPlatform: 'データ基盤',
    loadCoralError: 'サンゴデータの読み込みに失敗しました。Supabase設定を確認してください。',
    searchPlaceholder: 'トレード名、日本語名、属名、ショップ名で検索',
    category: 'カテゴリ:',
    all: 'すべて',
    loading: 'データを読み込み中...',
    noCorals: '該当するサンゴが見つかりませんでした。',
    resetFilters: 'フィルターをリセット',
    showing: (total, loaded, filtered) => `全 ${total} 件中、先頭 ${loaded} 件から ${filtered} 件表示`,
  },
  en: {
    tabs: { water: 'Water Log', coral: 'Coral DB', identity: 'DB Cleanup', cleanup: 'More Cleanup', quality: 'DB Quality' },
    language: 'Language',
    heroKicker: 'Marine aquarium manager',
    heroTitle: 'Aqua Reef Log',
    heroBody: 'Manage reef-tank water records and a coral database with traceable source information.',
    summaryWater: 'Water log',
    summaryWaterValue: '8 items',
    summaryCoral: 'Coral DB',
    summaryQuality: 'Quality review',
    summaryQualityValue: 'Updating',
    summaryPlatform: 'Data platform',
    loadCoralError: 'Could not load coral data. Please check Supabase settings.',
    searchPlaceholder: 'Search trade name, Japanese name, genus, or shop',
    category: 'Category:',
    all: 'All',
    loading: 'Loading data...',
    noCorals: 'No matching corals found.',
    resetFilters: 'Reset filters',
    showing: (total, loaded, filtered) => `Showing ${filtered} from the first ${loaded} of ${total} records`,
  },
  de: {
    tabs: { water: 'Wasserwerte', coral: 'Korallen-DB', identity: 'DB-Bereinigung', cleanup: 'Weitere Bereinigung', quality: 'DB-Qualität' },
    language: 'Sprache',
    heroKicker: 'Meerwasser-Aquarium-Manager',
    heroTitle: 'Aqua Reef Log',
    heroBody: 'Verwalte Wasserwerte deines Riffaquariums und eine Korallendatenbank mit nachvollziehbaren Quellen.',
    summaryWater: 'Wasserwerte',
    summaryWaterValue: '8 Werte',
    summaryCoral: 'Korallen-DB',
    summaryQuality: 'Qualitätsprüfung',
    summaryQualityValue: 'Laufend',
    summaryPlatform: 'Datenbasis',
    loadCoralError: 'Korallendaten konnten nicht geladen werden. Bitte Supabase-Einstellungen prüfen.',
    searchPlaceholder: 'Nach Handelsname, japanischem Namen, Gattung oder Shop suchen',
    category: 'Kategorie:',
    all: 'Alle',
    loading: 'Daten werden geladen...',
    noCorals: 'Keine passenden Korallen gefunden.',
    resetFilters: 'Filter zurücksetzen',
    showing: (total, loaded, filtered) => `${filtered} Treffer aus den ersten ${loaded} von ${total} Datensätzen`,
  },
  zh: {
    tabs: { water: '水质管理', coral: '珊瑚数据库', identity: '数据库整理', cleanup: '追加整理', quality: '数据库质量' },
    language: '语言',
    heroKicker: '海水水族箱管理',
    heroTitle: 'Aqua Reef Log',
    heroBody: '统一管理海水缸水质记录，以及可追溯来源的珊瑚数据库。',
    summaryWater: '水质记录',
    summaryWaterValue: '8项',
    summaryCoral: '珊瑚数据库',
    summaryQuality: '质量审核',
    summaryQualityValue: '持续更新',
    summaryPlatform: '数据平台',
    loadCoralError: '珊瑚数据读取失败。请检查 Supabase 设置。',
    searchPlaceholder: '按商品名、日文名、属名或店铺搜索',
    category: '分类:',
    all: '全部',
    loading: '正在读取数据...',
    noCorals: '没有找到匹配的珊瑚。',
    resetFilters: '重置筛选',
    showing: (total, loaded, filtered) => `共 ${total} 条，已载入前 ${loaded} 条，显示 ${filtered} 条`,
  },
}

const NUMBER_LOCALE = { ja: 'ja-JP', en: 'en-US', de: 'de-DE', zh: 'zh-CN' }
const TABS = ['water', 'coral', 'identity', 'cleanup', 'quality']

export default function Home() {
  const [records, setRecords] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [activeView, setActiveView] = useState('water')
  const [locale, setLocale] = useState('ja')
  const [compatibleOnly, setCompatibleOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const coralMatch = useCoralWaterMatch()
  const text = PAGE_TEXT[locale] || PAGE_TEXT.ja
  const numberLocale = NUMBER_LOCALE[locale] || 'ja-JP'

  useEffect(() => {
    const saved = window.localStorage.getItem('aqua-reef-locale')
    if (saved && PAGE_TEXT[saved]) setLocale(saved)
  }, [])

  function changeLocale(nextLocale) {
    setLocale(nextLocale)
    window.localStorage.setItem('aqua-reef-locale', nextLocale)
  }

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : locale
  }, [locale])

  useEffect(() => {
    if ((coralMatch.isDemo || coralMatch.matches.length === 0) && compatibleOnly) {
      setCompatibleOnly(false)
    }
  }, [coralMatch.isDemo, coralMatch.matches.length, compatibleOnly])

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
        setError(text.loadCoralError)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [text.loadCoralError])

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
    result = result.map(record => ({
      ...record,
      waterMatch: coralMatch.matchByEntityId.get(record.entity_id) ?? null,
    }))
    if (compatibleOnly) result = result.filter(record => record.waterMatch?.is_compatible)
    if (!coralMatch.isDemo && coralMatch.matches.length > 0) {
      result = [...result].sort((a, b) => {
        const aRisk = a.waterMatch?.risk_count ?? 999
        const bRisk = b.waterMatch?.risk_count ?? 999
        if (aRisk !== bRisk) return aRisk - bRisk
        return (a.trade_name ?? '').localeCompare(b.trade_name ?? '')
      })
    }
    return result
  }, [search, category, records, compatibleOnly, coralMatch.matchByEntityId, coralMatch.matches.length, coralMatch.isDemo])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <section className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.22),_transparent_30%),linear-gradient(135deg,_#082f49,_#020617_65%)]">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-12">
          <div className="max-w-3xl">
            <p className="text-cyan-200 text-sm font-semibold">{text.heroKicker}</p>
            <h1 className="text-3xl md:text-5xl font-bold mt-2">{text.heroTitle}</h1>
            <p className="text-slate-300 text-base md:text-lg mt-3 leading-relaxed">
              {text.heroBody}
            </p>
          </div>

          <div className="flex justify-end mt-5">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <span>{text.language}</span>
              <select value={locale} onChange={event => changeLocale(event.target.value)} className="bg-slate-950/80 border border-cyan-900 rounded-md px-3 py-2 text-white">
                {LANGUAGES.map(language => <option key={language.code} value={language.code}>{language.label}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <SummaryCard label={text.summaryWater} value={text.summaryWaterValue} />
            <SummaryCard label={text.summaryCoral} value={totalCount.toLocaleString(numberLocale)} />
            <SummaryCard label={text.summaryQuality} value={text.summaryQualityValue} />
            <SummaryCard label={text.summaryPlatform} value="Supabase" />
          </div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 border-b border-slate-800 mb-6 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveView(tab)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeView === tab
                  ? 'border-cyan-400 text-cyan-200'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {text.tabs[tab]}
            </button>
          ))}
        </div>

        {activeView === 'water' && <WaterQualityDashboard locale={locale} />}
        {activeView === 'identity' && <CoralIdentityDashboard />}
        {activeView === 'cleanup' && <CoralCleanupDashboard locale={locale} />}
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
            text={text}
            numberLocale={numberLocale}
            coralMatch={coralMatch}
            compatibleOnly={compatibleOnly}
            setCategory={setCategory}
            setSearch={setSearch}
            setCompatibleOnly={setCompatibleOnly}
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
  text,
  numberLocale,
  coralMatch,
  compatibleOnly,
  setCategory,
  setSearch,
  setCompatibleOnly,
}) {
  const canUseMatchFilter = !coralMatch.isDemo && coralMatch.matches.length > 0

  return (
    <section>
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-5 space-y-3">
        <input
          type="text"
          placeholder={text.searchPlaceholder}
          value={search}
          onChange={event => setSearch(event.target.value)}
          className="w-full px-4 py-2.5 rounded-md bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm"
        />

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-slate-400 text-xs font-medium shrink-0">{text.category}</span>
            <FilterButton active={category === ''} onClick={() => setCategory('')}>{text.all}</FilterButton>
            {categories.map(item => (
              <FilterButton key={item} active={category === item} onClick={() => setCategory(item)}>
                {item}
              </FilterButton>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <label className={`flex items-center gap-3 text-sm ${canUseMatchFilter ? 'text-slate-100' : 'text-slate-500'}`}>
            <input
              type="checkbox"
              checked={compatibleOnly}
              disabled={!canUseMatchFilter}
              onChange={event => setCompatibleOnly(event.target.checked)}
              className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
            />
            <span>現在のあなたの水質で飼育可能</span>
          </label>
          <div className="text-xs text-slate-400">
            {coralMatch.loading && !coralMatch.isDemo && '水質との相性を確認中...'}
            {coralMatch.error && <span className="text-rose-300">{coralMatch.error}</span>}
            {coralMatch.message && <span>{coralMatch.message}</span>}
            {!coralMatch.loading && !coralMatch.error && canUseMatchFilter && (
              <span>リスクが少ない順に表示しています。</span>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-20 text-cyan-300">{text.loading}</div>}
      {error && <div className="text-center py-20 text-rose-300">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-20 text-cyan-300">
          <p>{text.noCorals}</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setCategory('') }}
            className="mt-4 text-sm text-cyan-300 hover:text-cyan-100 underline"
          >
            {text.resetFilters}
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="text-slate-500 text-sm mb-4">
            {text.showing(totalCount.toLocaleString(numberLocale), records.length.toLocaleString(numberLocale), filtered.length.toLocaleString(numberLocale))}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(coral => <CoralCard key={coral.id} coral={coral} match={coral.waterMatch} />)}
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
