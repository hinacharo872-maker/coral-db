'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TEXT = {
  ja: {
    kicker: 'Second-pass cleanup',
    title: '追加整理候補',
    body: '確定済みの統合は残したまま、販売用語・現物番号・サイズ表記で分かれている候補を探します。',
    loading: '追加整理候補を読み込み中...',
    error: '追加整理候補を読み込めませんでした。',
    totalListings: '元データ',
    nonCoral: '非サンゴ候補',
    missingGenus: '属名未整理',
    missingCategory: 'カテゴリ未整理',
    refinementGroups: '追加整理候補',
    crossEntity: '別候補に分離中',
    suggested: '推奨名',
    sourceNames: '元の販売名',
    shops: 'ショップ',
    inferred: '推定',
    flags: {
      cross_entity_merge_candidate: '統合候補',
      size_variant: 'サイズ違い',
      genus_can_be_inferred: '属名推定可',
      category_can_be_inferred: 'カテゴリ推定可',
    },
    empty: '追加整理候補はありません。',
  },
  en: {
    kicker: 'Second-pass cleanup',
    title: 'Additional Cleanup Candidates',
    body: 'Find candidates split by sales wording, item numbers, and size labels while keeping reviewed merges intact.',
    loading: 'Loading cleanup candidates...',
    error: 'Could not load cleanup candidates.',
    totalListings: 'Source listings',
    nonCoral: 'Non-coral candidates',
    missingGenus: 'Missing genus',
    missingCategory: 'Missing category',
    refinementGroups: 'Cleanup groups',
    crossEntity: 'Split across candidates',
    suggested: 'Suggested name',
    sourceNames: 'Source listing names',
    shops: 'Shops',
    inferred: 'Inferred',
    flags: {
      cross_entity_merge_candidate: 'Merge candidate',
      size_variant: 'Size variant',
      genus_can_be_inferred: 'Genus inferable',
      category_can_be_inferred: 'Category inferable',
    },
    empty: 'No cleanup candidates.',
  },
  de: {
    kicker: 'Second-pass cleanup',
    title: 'Weitere Bereinigung',
    body: 'Findet Kandidaten, die durch Verkaufstexte, Artikelnummern und Größenangaben getrennt wurden.',
    loading: 'Bereinigungskandidaten werden geladen...',
    error: 'Bereinigungskandidaten konnten nicht geladen werden.',
    totalListings: 'Quellangebote',
    nonCoral: 'Nicht-Korallen',
    missingGenus: 'Gattung fehlt',
    missingCategory: 'Kategorie fehlt',
    refinementGroups: 'Bereinigungsgruppen',
    crossEntity: 'Über Kandidaten getrennt',
    suggested: 'Vorschlag',
    sourceNames: 'Ursprüngliche Angebotsnamen',
    shops: 'Shops',
    inferred: 'Abgeleitet',
    flags: {
      cross_entity_merge_candidate: 'Zusammenführen',
      size_variant: 'Größenvariante',
      genus_can_be_inferred: 'Gattung ableitbar',
      category_can_be_inferred: 'Kategorie ableitbar',
    },
    empty: 'Keine weiteren Kandidaten.',
  },
  zh: {
    kicker: 'Second-pass cleanup',
    title: '追加整理候选',
    body: '在保留已审核合并的基础上，查找因销售用语、编号和尺寸标记而分开的候选。',
    loading: '正在读取追加整理候选...',
    error: '无法读取追加整理候选。',
    totalListings: '来源记录',
    nonCoral: '非珊瑚候选',
    missingGenus: '缺少属名',
    missingCategory: '缺少分类',
    refinementGroups: '整理候选组',
    crossEntity: '分散在多个候选',
    suggested: '建议名称',
    sourceNames: '原始销售名',
    shops: '店铺',
    inferred: '推定',
    flags: {
      cross_entity_merge_candidate: '合并候选',
      size_variant: '尺寸差异',
      genus_can_be_inferred: '可推定属名',
      category_can_be_inferred: '可推定分类',
    },
    empty: '没有追加整理候选。',
  },
}

const NUMBER_LOCALE = { ja: 'ja-JP', en: 'en-US', de: 'de-DE', zh: 'zh-CN' }

export default function CoralCleanupDashboard({ locale = 'ja' }) {
  const text = TEXT[locale] || TEXT.ja
  const numberLocale = NUMBER_LOCALE[locale] || 'ja-JP'
  const [summary, setSummary] = useState(null)
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCleanup() {
      setLoading(true)
      setError(null)
      const [summaryResult, candidatesResult] = await Promise.all([
        supabase.from('coral_cleanup_summary').select('*').single(),
        supabase.from('coral_refinement_candidates').select('*').limit(60),
      ])
      if (summaryResult.error || candidatesResult.error) {
        setError(text.error)
      } else {
        setSummary(summaryResult.data)
        setCandidates(candidatesResult.data ?? [])
      }
      setLoading(false)
    }
    fetchCleanup()
  }, [text.error])

  if (loading) return <div className="py-16 text-center text-cyan-300">{text.loading}</div>
  if (error || !summary) return <div className="border border-rose-800 bg-rose-950/50 rounded-lg p-4 text-rose-100">{error}</div>

  const metrics = [
    { label: text.totalListings, value: summary.total_listings },
    { label: text.nonCoral, value: summary.non_coral_candidates },
    { label: text.missingGenus, value: summary.missing_genus },
    { label: text.missingCategory, value: summary.missing_category },
    { label: text.refinementGroups, value: summary.refinement_groups },
    { label: text.crossEntity, value: summary.cross_entity_groups },
  ]

  return (
    <section className="space-y-5">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <p className="text-cyan-300 text-sm font-semibold">{text.kicker}</p>
        <h2 className="text-2xl font-bold text-white mt-1">{text.title}</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl">{text.body}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map(metric => (
          <div key={metric.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{Number(metric.value ?? 0).toLocaleString(numberLocale)}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {candidates.map(candidate => (
          <article key={candidate.refinement_key} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">{text.suggested}</p>
                <h3 className="text-lg font-bold text-white mt-1">{candidate.suggested_name}</h3>
                <p className="text-xs text-cyan-300 mt-1">{text.inferred}: {[candidate.inferred_genus, candidate.inferred_category].filter(Boolean).join(' / ') || '-'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{candidate.listing_count} listings</Badge>
                <Badge>{candidate.entity_count} entities</Badge>
                <Badge>{candidate.shop_count} shops</Badge>
                {(candidate.issue_flags ?? []).map(flag => <Badge key={flag} tone={flag.includes('merge') ? 'amber' : 'cyan'}>{text.flags[flag] ?? flag}</Badge>)}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">{text.sourceNames}</p>
                <div className="space-y-1">
                  {(candidate.listing_names ?? []).slice(0, 8).map(name => <p key={name} className="text-sm text-slate-300">{name}</p>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">{text.shops}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(candidate.shops ?? []).map(shop => <Badge key={shop}>{shop}</Badge>)}
                </div>
              </div>
            </div>
          </article>
        ))}
        {candidates.length === 0 && <div className="py-12 text-center text-slate-500">{text.empty}</div>}
      </div>
    </section>
  )
}

function Badge({ children, tone = 'slate' }) {
  const colors = {
    slate: 'border-slate-700 bg-slate-950 text-slate-300',
    amber: 'border-amber-800 bg-amber-950 text-amber-200',
    cyan: 'border-cyan-800 bg-cyan-950 text-cyan-200',
  }
  return <span className={`text-xs border rounded-full px-2.5 py-1 ${colors[tone]}`}>{children}</span>
}
