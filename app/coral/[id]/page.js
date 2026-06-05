'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const CATEGORY_COLORS = {
  SPS: 'bg-rose-950 text-rose-200',
  LPS: 'bg-amber-950 text-amber-200',
  Soft: 'bg-emerald-950 text-emerald-200',
  Zoanthid: 'bg-violet-950 text-violet-200',
}

const CARE_FIELDS = [
  { min: 'temperature_min', max: 'temperature_max', key: 'temperature', label: '水温', unit: '°C' },
  { min: 'salinity_min', max: 'salinity_max', key: 'salinity', label: '比重', unit: '' },
  { min: 'ph_min', max: 'ph_max', key: 'ph', label: 'pH', unit: '' },
  { min: 'kh_min', max: 'kh_max', key: 'kh', label: 'KH', unit: 'dKH' },
  { min: 'calcium_min', max: 'calcium_max', key: 'calcium', label: 'Ca', unit: 'ppm' },
  { min: 'magnesium_min', max: 'magnesium_max', key: 'magnesium', label: 'Mg', unit: 'ppm' },
  { min: 'nitrate_min', max: 'nitrate_max', key: 'nitrate', label: 'NO3', unit: 'ppm' },
  { min: 'phosphate_min', max: 'phosphate_max', key: 'phosphate', label: 'PO4', unit: 'ppm' },
]

function formatNumber(value) {
  if (value == null) return null
  const number = Number(value)
  if (!Number.isFinite(number)) return value
  return number.toLocaleString('ja-JP', { maximumFractionDigits: 3 })
}

function formatRange(min, max, unit) {
  if (min == null && max == null) return null
  if (min != null && max != null) return `${formatNumber(min)} - ${formatNumber(max)}${unit ? ` ${unit}` : ''}`
  if (min != null) return `${formatNumber(min)}以上${unit ? ` ${unit}` : ''}`
  return `${formatNumber(max)}以下${unit ? ` ${unit}` : ''}`
}

function formatIssue(issue) {
  const field = CARE_FIELDS.find(item => item.key === issue.key)
  const label = field?.label ?? issue.label ?? issue.key
  const status = issue.status === 'low' ? '低すぎます' : '高すぎます'
  const range = formatRange(issue.min, issue.max, field?.unit)
  return `${label}が${status}（現在: ${formatNumber(issue.current)}${field?.unit ? ` ${field.unit}` : ''}${range ? ` / 適正: ${range}` : ''}）`
}

export default function CoralDetail() {
  const { id } = useParams()
  const [coral, setCoral] = useState(null)
  const [careProfile, setCareProfile] = useState(null)
  const [references, setReferences] = useState([])
  const [match, setMatch] = useState(null)
  const [matchMessage, setMatchMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function fetchCoral() {
      try {
        setLoading(true)
        setError(null)

        const { data: catalogRecord, error: catalogError } = await supabase
          .from('curated_coral_catalog')
          .select('*')
          .eq('id', id)
          .single()

        if (catalogError) throw catalogError
        if (!active) return

        setCoral(catalogRecord)

        const [profileResult, referencesResult, sessionResult] = await Promise.all([
          supabase
            .from('coral_care_profiles')
            .select('*')
            .eq('coral_entity_id', catalogRecord.entity_id)
            .maybeSingle(),
          supabase
            .from('coral_references')
            .select('*')
            .eq('coral_entity_id', catalogRecord.entity_id)
            .order('created_at', { ascending: false }),
          supabase.auth.getSession(),
        ])

        if (!active) return

        if (profileResult.error) throw profileResult.error
        if (referencesResult.error) throw referencesResult.error

        setCareProfile(profileResult.data ?? null)
        setReferences(referencesResult.data ?? [])

        const session = sessionResult.data.session
        if (!session?.user?.id) {
          setMatch(null)
          setMatchMessage('ログインして水質ログを保存すると、このサンゴとの相性を確認できます。')
          return
        }

        const { data: matchData, error: matchError } = await supabase.rpc('get_current_coral_risks', {
          p_user_id: session.user.id,
        })

        if (!active) return

        if (matchError) throw matchError

        const currentMatch = (matchData ?? []).find(item => item.coral_entity_id === catalogRecord.entity_id)
        setMatch(currentMatch ?? null)
        setMatchMessage(currentMatch ? null : '最新の水質ログがまだないため、相性判定は待機中です。')
      } catch (err) {
        if (!active) return
        setError('サンゴデータの読み込みに失敗しました。')
        console.error(err)
      } finally {
        if (active) setLoading(false)
      }
    }

    if (id) fetchCoral()

    return () => {
      active = false
    }
  }, [id])

  const displayName = coral?.trade_name || `${coral?.genus ?? ''} ${coral?.species ?? ''}`.trim()
  const scientificName = coral?.genus && coral?.species ? `${coral.genus} ${coral.species}` : null
  const categoryColor = CATEGORY_COLORS[coral?.coral_category] ?? 'bg-slate-800 text-slate-300'
  const careRows = useMemo(() => {
    if (!careProfile) return []
    return CARE_FIELDS
      .map(field => ({
        ...field,
        range: formatRange(careProfile[field.min], careProfile[field.max], field.unit),
      }))
      .filter(field => field.range)
  }, [careProfile])
  const issues = Array.isArray(match?.issues) ? match.issues : []

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="text-center py-20 text-cyan-300">
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !coral) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="text-center py-20">
          <div className="text-5xl mb-4 text-rose-300">!</div>
          <p className="text-rose-300">{error ?? 'データが見つかりません。'}</p>
          <Link href="/" className="text-cyan-300 hover:text-cyan-100 mt-4 inline-block">一覧に戻る</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <div className="bg-slate-900 border-b border-slate-800 py-3 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-cyan-300 hover:text-cyan-100 text-sm transition-colors">
            一覧に戻る
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-slate-900 rounded-lg overflow-hidden shadow-xl border border-slate-800">
          <div className="h-48 bg-gradient-to-br from-cyan-950 to-slate-950 flex items-center justify-center">
            <span className="text-sm font-bold tracking-[0.25em] text-cyan-200/70">CORAL PROFILE</span>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {coral.coral_category && (
                  <span className={`text-sm px-3 py-1 rounded-full ${categoryColor}`}>
                    {coral.coral_category}
                  </span>
                )}
                {coral.review_status && (
                  <span className="text-sm px-3 py-1 rounded-full bg-slate-950 text-slate-300 border border-slate-700">
                    {coral.review_status}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
              {coral.common_name_jp && (
                <p className="text-cyan-300 text-lg mt-1">{coral.common_name_jp}</p>
              )}
              {scientificName && displayName !== scientificName && (
                <p className="text-slate-400 italic mt-0.5">{scientificName}</p>
              )}
            </div>

            <section className="rounded-lg border border-slate-800 bg-slate-950 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-300">現在の水質との相性</h2>
                  <p className="text-xs text-slate-500 mt-1">最新の水質ログと適正範囲を照合します。</p>
                </div>
                {match && (
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${match.is_compatible ? 'bg-emerald-950 text-emerald-200 border border-emerald-600' : 'bg-rose-950 text-rose-200 border border-rose-600'}`}>
                    {match.is_compatible ? '適合' : `注意 ${match.risk_count}項目`}
                  </span>
                )}
              </div>

              {matchMessage && <p className="text-sm text-slate-400 mt-4">{matchMessage}</p>}
              {issues.length > 0 && (
                <div className="mt-4 space-y-2">
                  {issues.map(issue => (
                    <p key={`${issue.key}-${issue.status}`} className="rounded-md border border-rose-800 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
                      {formatIssue(issue)}
                    </p>
                  ))}
                </div>
              )}
              {match?.is_compatible && (
                <p className="text-sm text-emerald-200 mt-4">現在の最新ログでは、登録済みの適正範囲から外れている項目はありません。</p>
              )}
            </section>

            {careRows.length > 0 && (
              <section>
                <div className="flex flex-col gap-1 mb-3">
                  <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-widest">適正水質範囲</h2>
                  {careProfile?.source_note && <p className="text-xs text-slate-500">{careProfile.source_note}</p>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {careRows.map(field => (
                    <div key={field.key} className="bg-slate-950 rounded-md p-4 flex flex-col gap-1 border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">{field.label}</span>
                      <span className="text-white font-bold">{field.range}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-slate-300 text-sm font-semibold uppercase tracking-widest mb-3">科学的・経験的根拠</h2>
              {references.length === 0 ? (
                <p className="rounded-md border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
                  まだ根拠ソースは登録されていません。
                </p>
              ) : (
                <div className="space-y-3">
                  {references.map(reference => (
                    <div key={reference.id} className="rounded-md border border-slate-800 bg-slate-950 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-cyan-950 px-2 py-0.5 text-xs font-semibold text-cyan-200">
                          {reference.source_type}
                        </span>
                        <h3 className="text-sm font-bold text-white">{reference.title}</h3>
                      </div>
                      {reference.citation && <p className="mt-2 text-sm text-slate-300">{reference.citation}</p>}
                      {reference.notes && <p className="mt-2 text-sm text-slate-400">{reference.notes}</p>}
                      {reference.url && (
                        <a href={reference.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-cyan-300 hover:text-cyan-100">
                          ソースを開く
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </article>
      </main>
    </div>
  )
}
