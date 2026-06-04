'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const FLAG_LABELS = {
  missing_genus: '属名なし',
  missing_species: '種小名なし',
  missing_category: 'カテゴリなし',
  missing_common_name_jp: '和名なし',
  duplicate_candidate: '重複候補',
  incomplete_care_profile: '飼育情報不足',
}

function percentage(value, total) {
  if (!total) return '0.0'
  return ((value / total) * 100).toFixed(1)
}

export default function CoralQualityDashboard() {
  const [summary, setSummary] = useState(null)
  const [sources, setSources] = useState([])
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAudit() {
      try {
        const [summaryResult, sourceResult, candidateResult] = await Promise.all([
          supabase.from('coral_quality_summary').select('*').single(),
          supabase.from('coral_source_quality').select('*').limit(10),
          supabase
            .from('coral_record_quality')
            .select('id,trade_name,genus,species,coral_category,source_shop,quality_score,quality_flags,duplicate_count')
            .order('quality_score', { ascending: true })
            .limit(20),
        ])

        if (summaryResult.error) throw summaryResult.error
        if (sourceResult.error) throw sourceResult.error
        if (candidateResult.error) throw candidateResult.error

        setSummary(summaryResult.data)
        setSources(sourceResult.data ?? [])
        setCandidates(candidateResult.data ?? [])
      } catch (err) {
        setError('品質監査データを読み込めませんでした。Supabase migrationの完了を確認してください。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAudit()
  }, [])

  if (loading) {
    return <div className="py-16 text-center text-cyan-300">品質監査を集計中...</div>
  }

  if (error || !summary) {
    return <div className="border border-rose-800 bg-rose-950/50 rounded-lg p-4 text-rose-100">{error}</div>
  }

  const metrics = [
    { label: '属名なし', value: summary.missing_genus, tone: 'text-amber-300' },
    { label: '種小名なし', value: summary.missing_species, tone: 'text-rose-300' },
    { label: 'カテゴリなし', value: summary.missing_category, tone: 'text-amber-300' },
    { label: '重複候補', value: summary.duplicate_candidate_rows, tone: 'text-violet-300' },
    { label: '飼育情報が完全', value: summary.complete_care_profiles, tone: 'text-emerald-300' },
    { label: '高品質レコード', value: summary.high_quality_records, tone: 'text-cyan-300' },
  ]

  return (
    <section className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-cyan-300 text-sm font-semibold">Database audit</p>
            <h2 className="text-2xl font-bold text-white mt-1">サンゴDB 品質監査</h2>
            <p className="text-slate-400 text-sm mt-2">
              現在の平均品質スコアは100点中 {summary.average_quality_score} 点です。
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">監査対象</p>
            <p className="text-3xl font-bold text-white">{summary.total_records.toLocaleString('ja-JP')}</p>
          </div>
        </div>

        <div className="mt-5 h-3 bg-slate-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400"
            style={{ width: `${Math.min(Number(summary.average_quality_score), 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map(metric => (
          <div key={metric.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className={`text-2xl font-bold mt-1 ${metric.tone}`}>{metric.value.toLocaleString('ja-JP')}</p>
            <p className="text-xs text-slate-500 mt-1">
              {percentage(metric.value, summary.total_records)}%
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h3 className="font-bold text-white">情報源別の品質</h3>
            <p className="text-xs text-slate-500 mt-1">件数の多いショップ順</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="text-left font-medium px-4 py-3">情報源</th>
                  <th className="text-right font-medium px-3 py-3">件数</th>
                  <th className="text-right font-medium px-3 py-3">平均点</th>
                  <th className="text-right font-medium px-4 py-3">種同定済</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sources.map(source => (
                  <tr key={source.source_shop}>
                    <td className="px-4 py-3 text-white">{source.source_shop}</td>
                    <td className="px-3 py-3 text-right text-slate-300">{source.record_count}</td>
                    <td className="px-3 py-3 text-right text-cyan-300 font-semibold">{source.average_quality_score}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{source.species_identified}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="font-bold text-white">改善の優先順位</h3>
          <div className="space-y-4 mt-4">
            <div className="border-l-2 border-rose-400 pl-3">
              <p className="text-white font-semibold">1. 種同定の根拠を追加</p>
              <p className="text-sm text-slate-400 mt-1">種小名なしが {summary.missing_species.toLocaleString('ja-JP')} 件。流通名と正式分類を分離して確認します。</p>
            </div>
            <div className="border-l-2 border-amber-400 pl-3">
              <p className="text-white font-semibold">2. 未分類レコードを整理</p>
              <p className="text-sm text-slate-400 mt-1">属名・カテゴリ不足を、商品名パターンと専門家レビューで絞り込みます。</p>
            </div>
            <div className="border-l-2 border-violet-400 pl-3">
              <p className="text-white font-semibold">3. 重複候補を統合</p>
              <p className="text-sm text-slate-400 mt-1">表記違いを含む候補を確認し、同一モーフの別ショップ掲載をまとめます。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800">
          <h3 className="font-bold text-white">優先レビュー候補</h3>
          <p className="text-xs text-slate-500 mt-1">品質スコアが低い順</p>
        </div>
        <div className="divide-y divide-slate-800">
          {candidates.map(record => (
            <Link
              key={record.id}
              href={`/coral/${record.id}`}
              className="grid md:grid-cols-[1fr_120px_1.4fr] gap-3 px-5 py-4 hover:bg-slate-800 transition-colors"
            >
              <div>
                <p className="text-white font-semibold">{record.trade_name || `Record #${record.id}`}</p>
                <p className="text-xs text-slate-500 mt-1">{record.source_shop || '情報源なし'}</p>
              </div>
              <div className="md:text-center">
                <span className="inline-flex border border-rose-800 bg-rose-950 text-rose-200 rounded-full px-2.5 py-1 text-xs">
                  {record.quality_score} 点
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(record.quality_flags ?? []).map(flag => (
                  <span key={flag} className="border border-slate-700 bg-slate-950 text-slate-300 rounded-full px-2 py-1 text-[11px]">
                    {FLAG_LABELS[flag] ?? flag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
