'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { LITE_PARAMETER_LABELS, LITE_TARGETS, findMissingKeys, judgeAll } from '@/lib/liteTargets'

const PARAMETERS = [
  { key: 'kh_dkh', unit: 'dKH' },
  { key: 'temperature_c', unit: '℃' },
  { key: 'salinity_sg', unit: 'SG' },
  { key: 'no3_ppm', unit: 'ppm' },
  { key: 'po4_ppm', unit: 'ppm' },
]

const SEVERITY_STYLE = {
  green: 'border-emerald-500 bg-emerald-950 text-emerald-50',
  yellow: 'border-amber-400 bg-amber-950 text-amber-50',
  red: 'border-rose-500 bg-rose-950 text-rose-50',
  unknown: 'border-slate-600 bg-slate-900 text-slate-300',
}

const SEVERITY_LABEL = {
  green: '正常',
  yellow: '注意',
  red: '危険',
  unknown: '今回は未測定',
}

const FREQUENCY_LABELS = {
  daily: '毎日',
  every_2_days: '2日に1回',
  weekly: '週1回',
  as_needed: '必要時',
  unknown: '頻度未登録',
}

export default function LiteShopCardPage() {
  return (
    <Suspense fallback={<PageShell><p className="text-slate-300">カルテを準備しています...</p></PageShell>}>
      <LiteShopCard />
    </Suspense>
  )
}

function LiteShopCard() {
  const searchParams = useSearchParams()
  const requestedTankId = searchParams.get('tank')
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      const { data: authData } = await supabase.auth.getSession()
      if (!authData.session) {
        setError('Liteホームからログインしてください。')
        setLoading(false)
        return
      }

      let tankQuery = supabase
        .from('lite_tank_profiles')
        .select('id, display_name, tank_volume_liters, water_change_frequency_days, water_change_volume_liters, last_water_change_at, photo_url')
      tankQuery = requestedTankId ? tankQuery.eq('id', requestedTankId) : tankQuery.order('created_at').limit(1)
      const tankResult = await tankQuery.maybeSingle()
      if (tankResult.error || !tankResult.data) {
        setError('表示できるLite水槽がありません。')
        setLoading(false)
        return
      }

      const tank = tankResult.data
      const [measurementsResult, additivesResult, photoResult] = await Promise.all([
        supabase
          .from('lite_measurements')
          .select('measured_at, temperature_c, salinity_sg, kh_dkh, no3_ppm, po4_ppm')
          .eq('tank_id', tank.id)
          .order('measured_at', { ascending: false })
          .limit(100),
        supabase
          .from('lite_additive_usage')
          .select('brand_snapshot, product_name_snapshot, amount_text, frequency, usage_note')
          .eq('tank_id', tank.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('lite_tank_photos')
          .select('photo_url, taken_at, note')
          .eq('tank_id', tank.id)
          .order('taken_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ])

      if (measurementsResult.error || additivesResult.error || photoResult.error) {
        setError('水槽カルテを読み込めませんでした。もう一度お試しください。')
      } else {
        const measurements = measurementsResult.data ?? []
        const parameterLatest = Object.fromEntries(PARAMETERS.map(parameter => {
          const measurement = measurements.find(item => item[parameter.key] != null)
          return [parameter.key, measurement
            ? { value: measurement[parameter.key], measured_at: measurement.measured_at }
            : null]
        }))
        setRecord({
          tank,
          parameterLatest,
          additives: additivesResult.data ?? [],
          photo: photoResult.data ?? null,
        })
      }
      setLoading(false)
    }
    load()
  }, [requestedTankId])

  const checks = useMemo(() => {
    if (!record) return []
    const values = Object.fromEntries(PARAMETERS.map(parameter => [
      parameter.key,
      record.parameterLatest[parameter.key]?.value ?? null,
    ]))
    const missing = findMissingKeys(values).map(key => `${LITE_PARAMETER_LABELS[key]}を測ると判断しやすくなります`)
    const outside = judgeAll(values)
      .filter(item => item.severity === 'yellow' || item.severity === 'red')
      .map(item => `${LITE_PARAMETER_LABELS[item.parameterKey]}が${item.severity === 'red' ? '大きく範囲外です' : '目標範囲から外れています'}`)
    return [...outside, ...missing].slice(0, 4)
  }, [record])

  if (loading) return <PageShell><p className="text-slate-300">カルテを準備しています...</p></PageShell>
  if (error || !record) {
    return (
      <PageShell>
        <p className="border border-rose-700 bg-rose-950 p-4 text-rose-100">{error || 'カルテを表示できません。'}</p>
        <Link href="/lite" className="mt-4 flex min-h-12 items-center justify-center bg-cyan-400 px-4 py-3 font-bold text-slate-950">Liteホームへ</Link>
      </PageShell>
    )
  }

  const values = Object.fromEntries(PARAMETERS.map(parameter => [
    parameter.key,
    record.parameterLatest[parameter.key]?.value ?? null,
  ]))
  const severities = new Map(judgeAll(values).map(item => [item.parameterKey, item.severity]))
  const photoUrl = record.photo?.photo_url || record.tank.photo_url

  return (
    <PageShell>
      <section className="border-b border-slate-700 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-emerald-300">ショップに見せる画面</p>
            <h1 className="mt-1 text-3xl font-bold text-white">{record.tank.display_name || 'わたしの水槽'}</h1>
          </div>
          <Link href="/lite" className="min-h-11 shrink-0 border border-slate-600 px-3 py-2 text-sm font-bold text-slate-200">戻る</Link>
        </div>
        <p className="mt-2 text-sm text-slate-400">この画面をそのままショップ店員に見せてください。</p>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="grid grid-cols-2 gap-2">
          <Fact label="水槽サイズ" value={record.tank.tank_volume_liters != null ? `${record.tank.tank_volume_liters} L` : '未登録'} />
          <Fact label="水換え頻度" value={record.tank.water_change_frequency_days ? `${record.tank.water_change_frequency_days}日ごと` : '未登録'} />
          <Fact label="1回の換水量" value={record.tank.water_change_volume_liters != null ? `${record.tank.water_change_volume_liters} L` : '未登録'} />
          <Fact label="最終換水日" value={formatDate(record.tank.last_water_change_at)} />
        </div>
        <div className="aspect-[4/3] overflow-hidden border border-slate-700 bg-slate-900">
          {photoUrl
            ? <img src={photoUrl} alt="直近の水槽写真" className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center text-sm text-slate-500">写真未登録</div>}
        </div>
      </section>

      <section className="mt-4">
        <h2 className="text-sm font-bold text-white">現在の水質</h2>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {PARAMETERS.map(parameter => {
            const latest = record.parameterLatest[parameter.key]
            const severity = severities.get(parameter.key) || 'unknown'
            const freshness = getFreshness(latest?.measured_at)
            return (
              <article key={parameter.key} className={`min-h-32 border-2 p-3 ${SEVERITY_STYLE[severity]}`}>
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <strong>{LITE_PARAMETER_LABELS[parameter.key]}</strong>
                  <span className="border border-current px-1.5 py-0.5 text-[10px] font-bold">{SEVERITY_LABEL[severity]}</span>
                </div>
                <p className="mt-2 text-2xl font-bold">{formatValue(latest?.value, parameter.key)}</p>
                {latest?.value != null && <p className="text-xs opacity-80">{parameter.unit}</p>}
                <p className={`mt-2 text-xs font-bold ${freshness.tone}`}>{freshness.label}</p>
                <p className="mt-0.5 text-[10px] opacity-70">{formatDate(latest?.measured_at)}</p>
                <p className="mt-2 border-t border-current/30 pt-1 text-[10px] opacity-80">
                  目標 {formatTarget(parameter.key)}
                </p>
              </article>
            )
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <section className="border border-slate-700">
          <h2 className="border-b border-slate-700 bg-slate-900 px-3 py-2 text-sm font-bold text-white">使用中の添加剤</h2>
          {record.additives.length ? record.additives.map((additive, index) => (
            <div key={`${additive.product_name_snapshot}-${index}`} className="border-b border-slate-800 px-3 py-2 last:border-0">
              <p className="font-bold text-white">{[additive.brand_snapshot, additive.product_name_snapshot].filter(Boolean).join(' ') || '名称未登録'}</p>
              <p className="mt-0.5 text-sm text-slate-300">
                {[additive.amount_text, FREQUENCY_LABELS[additive.frequency] || '頻度未登録'].filter(Boolean).join(' / ')}
              </p>
            </div>
          )) : <p className="p-3 text-sm text-slate-400">使用中の添加剤は未登録です。</p>}
        </section>

        <section className="border border-slate-700 bg-slate-900">
          <h2 className="border-b border-slate-700 px-3 py-2 text-sm font-bold text-white">アプリからの確認ポイント</h2>
          <div className="space-y-2 p-3">
            {checks.length ? checks.map(check => (
              <p key={check} className="border-l-4 border-amber-400 pl-3 text-sm text-slate-100">{check}</p>
            )) : <p className="border-l-4 border-emerald-400 pl-3 text-sm text-slate-100">大きな確認ポイントはありません。</p>}
            <p className="pt-1 text-[11px] text-slate-500">診断ではなく、店員が確認する入口を表示しています。</p>
          </div>
        </section>
      </div>

      <section className="mt-4 border border-slate-700 bg-slate-900 p-3 text-xs leading-relaxed text-slate-400">
        <p>これは診断ではありません。ショップが確認するための記録です。</p>
        <p className="mt-1">添加や購入の判断は、この画面を見ながらショップと相談してください。</p>
      </section>
    </PageShell>
  )
}

function formatValue(value, key) {
  if (value == null) return '—'
  if (key === 'salinity_sg') return Number(value).toFixed(4)
  if (key === 'po4_ppm') return Number(value).toFixed(3)
  return Number(value).toFixed(key === 'temperature_c' || key === 'kh_dkh' ? 1 : 0)
}

function formatDate(value) {
  if (!value) return '未登録'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '未登録' : date.toLocaleDateString('ja-JP')
}

function getFreshness(value) {
  if (!value) return { label: '測定日不明', tone: 'text-slate-400' }
  const days = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86400000))
  if (days >= 14) return { label: `${days}日前・古い可能性`, tone: 'text-rose-200' }
  if (days >= 7) return { label: `${days}日前・少し古い`, tone: 'text-amber-200' }
  return { label: days === 0 ? '今日' : `${days}日前`, tone: 'text-emerald-200' }
}

function formatTarget(key) {
  const target = LITE_TARGETS[key]
  if (!target) return '未設定'
  const decimals = key === 'salinity_sg' ? 3 : key === 'po4_ppm' ? 2 : 1
  return `${target.green[0].toFixed(decimals)}-${target.green[1].toFixed(decimals)}`
}

function Fact({ label, value }) {
  return (
    <div className="border border-slate-700 bg-slate-900 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-base font-bold text-white">{value}</p>
    </div>
  )
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4">{children}</main>
    </div>
  )
}
