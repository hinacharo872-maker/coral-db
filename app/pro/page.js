'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ProHeader from '@/components/ProHeader'
import ProChart from '@/components/ProChart'
import { supabase } from '@/lib/supabase'
import { browserSiteUrl } from '@/lib/siteUrl'
import { analyzeParameter, buildConsumptionSummary, describeEventTrend } from '@/lib/proAnalytics'
import { PRO_CORE_PARAMETERS, PRO_PARAMETER_BY_KEY, PRO_PARAMETERS, PRO_EVENT_LABELS } from '@/lib/proParameters'
import { createProDemo } from '@/lib/proDemo'

const PERIODS = [7, 14, 30]
const CHART_PERIODS = [7, 14, 30, 90, 'all']
const STABLE_THRESHOLDS = { kh_dkh: 0.02, ca_ppm: 0.5, mg_ppm: 1 }

export default function ProHomePage() {
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [periodDays, setPeriodDays] = useState(14)
  const [chartPeriod, setChartPeriod] = useState(30)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: authData }) => {
      setSession(authData.session)
      setAuthChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthChecked(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!authChecked) return
    if (!session) {
      setData(createProDemo())
      setLoading(false)
      return
    }
    loadProData()
  }, [session, authChecked])

  async function loadProData() {
    setLoading(true)
    setError('')
    const tankResult = await supabase
      .from('pro_tank_profiles')
      .select('*')
      .order('created_at')
      .limit(1)
      .maybeSingle()
    if (tankResult.error) {
      setError('Proデータを読み込めませんでした。データベース更新後にもう一度お試しください。')
      setLoading(false)
      return
    }
    if (!tankResult.data) {
      setData(null)
      setLoading(false)
      return
    }
    const [measurementResult, eventResult] = await Promise.all([
      supabase.from('pro_measurements').select('*').eq('tank_id', tankResult.data.id).order('measured_at'),
      supabase.from('pro_events').select('*').eq('tank_id', tankResult.data.id).order('event_at', { ascending: false }),
    ])
    if (measurementResult.error || eventResult.error) {
      setError('測定またはイベント履歴を読み込めませんでした。')
    } else {
      setData({
        isDemo: false,
        tank: tankResult.data,
        measurements: measurementResult.data ?? [],
        events: eventResult.data ?? [],
      })
    }
    setLoading(false)
  }

  async function createTank() {
    if (!session?.user?.id) return
    setCreating(true)
    const { data: tank, error: createError } = await supabase
      .from('pro_tank_profiles')
      .insert({ user_id: session.user.id, display_name: 'メインリーフ水槽' })
      .select('*')
      .single()
    if (createError) setError('Pro水槽を作成できませんでした。')
    else setData({ isDemo: false, tank, measurements: [], events: [] })
    setCreating(false)
  }

  async function sendMagicLink(event) {
    event.preventDefault()
    setMessage('')
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${browserSiteUrl()}/pro` },
    })
    setMessage(authError ? 'ログインメールを送れませんでした。' : 'ログインリンクをメールへ送りました。')
  }

  const analyses = useMemo(() => Object.fromEntries(PRO_CORE_PARAMETERS.map(parameter => [
    parameter.key,
    analyzeParameter(data?.measurements ?? [], parameter.key, periodDays, {
      stableThreshold: STABLE_THRESHOLDS[parameter.key],
    }),
  ])), [data, periodDays])

  if (!authChecked || loading) return <ProShell><p className="text-zinc-400">Pro分析を準備しています...</p></ProShell>

  if (session && !data) {
    return (
      <ProShell>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <section className="mx-auto max-w-xl border border-emerald-900 bg-zinc-950 p-6">
          <p className="text-sm font-bold text-emerald-400">REEFCHART PRO</p>
          <h1 className="mt-2 text-3xl font-bold text-white">分析用の水槽を作成</h1>
          <p className="mt-3 leading-7 text-zinc-300">Liteとは別の測定履歴として管理します。Liteのデータは変更されません。</p>
          <button type="button" onClick={createTank} disabled={creating} className="mt-6 min-h-14 w-full bg-emerald-400 px-5 py-3 text-lg font-bold text-zinc-950 disabled:bg-zinc-700">
            {creating ? '作成中...' : 'Pro水槽を作成'}
          </button>
        </section>
      </ProShell>
    )
  }

  const targetRanges = data.tank.target_ranges || {}
  const correlations = data.events
    .map(event => {
      const parameter = PRO_PARAMETER_BY_KEY.get(event.related_parameter)
      return parameter ? describeEventTrend(event, data.measurements, parameter) : null
    })
    .filter(Boolean)
    .slice(0, 3)

  return (
    <ProShell>
      {data.isDemo && (
        <section className="border border-cyan-700 bg-cyan-950/40 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold text-cyan-300">PRO ANALYSIS DEMO</p>
              <p className="mt-1 text-sm text-zinc-200">分析価値を確認するためのデモデータです。Liteのデータとはつながっていません。</p>
            </div>
            <form onSubmit={sendMagicLink} className="grid w-full max-w-md gap-2 sm:grid-cols-[1fr_auto]">
              <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="メールアドレス" className="min-h-12 min-w-0 flex-1 border border-zinc-700 bg-zinc-950 px-3 text-white" />
              <button className="min-h-12 bg-emerald-400 px-4 font-bold text-zinc-950">保存を始める</button>
            </form>
          </div>
          {message && <p className="mt-2 text-sm text-cyan-200">{message}</p>}
        </section>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <section className="mt-6 flex flex-col gap-4 border-b border-zinc-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-emerald-400">CONSUMPTION OVERVIEW</p>
          <h1 className="mt-1 text-3xl font-bold text-white">{data.tank.display_name}</h1>
          <p className="mt-2 text-zinc-400">{data.tank.tank_volume_liters ? `${data.tank.tank_volume_liters} L` : '水量未登録'} / KH・Ca・Mgの消費と予測</p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Link href={`/pro/measure?tank=${data.tank.id}`} className="flex min-h-12 items-center justify-center bg-emerald-400 px-4 font-bold text-zinc-950">測定を追加</Link>
          <Link href={`/pro/events?tank=${data.tank.id}`} className="flex min-h-12 items-center justify-center border border-amber-500 px-4 font-bold text-amber-200">イベントを追加</Link>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-white">消費速度</h2>
          <PeriodControl values={PERIODS} value={periodDays} onChange={setPeriodDays} suffix="日" />
        </div>
        <div className="mt-3 grid gap-3 lg:grid-cols-3">
          {PRO_CORE_PARAMETERS.map(parameter => (
            <ConsumptionCard
              key={parameter.key}
              parameter={parameter}
              analysis={analyses[parameter.key]}
              target={targetRanges[parameter.key] || { min: parameter.target[0], max: parameter.target[1] }}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-lg font-bold text-white">変化後の確認メモ</h2>
          <div className="mt-3 space-y-3">
            {correlations.length ? correlations.map(text => (
              <p key={text} className="border-l-4 border-amber-400 pl-3 text-sm leading-6 text-zinc-200">{text}</p>
            )) : <p className="text-sm text-zinc-500">関連する測定が増えると、イベント後の傾向をここに表示します。</p>}
          </div>
        </div>
        <div className="border border-zinc-800 bg-zinc-950 p-4">
          <h2 className="text-lg font-bold text-white">最近のイベント</h2>
          <div className="mt-3 space-y-3">
            {data.events.slice(0, 4).map(event => (
              <div key={event.id} className="border-b border-zinc-800 pb-3 last:border-0">
                <p className="text-xs font-bold text-amber-300">{PRO_EVENT_LABELS[event.event_type] || 'イベント'}</p>
                <p className="mt-1 font-bold text-white">{event.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{new Date(event.event_at).toLocaleDateString('ja-JP')}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">水質・イベント・予測</h2>
            <p className="mt-1 text-sm text-zinc-400">点線の予測は現在の傾向が続いた場合の参考値です。</p>
          </div>
          <PeriodControl values={CHART_PERIODS} value={chartPeriod} onChange={setChartPeriod} suffix="日" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {PRO_PARAMETERS.map(parameter => (
            <ProChart
              key={parameter.key}
              measurements={data.measurements}
              events={data.events}
              parameter={parameter}
              periodDays={chartPeriod}
              target={targetRanges[parameter.key] || { min: parameter.target[0], max: parameter.target[1] }}
            />
          ))}
        </div>
      </section>

      <section className="mt-8 border border-zinc-800 bg-zinc-950 p-4 text-sm leading-6 text-zinc-400">
        <strong className="text-white">安全について</strong>
        <p className="mt-1">消費速度と予測は測定記録から計算した参考情報です。添加量は自動計算しません。測定誤差、実水量、製品説明、直近の水換えや添加履歴を確認してください。</p>
      </section>
    </ProShell>
  )
}

function ConsumptionCard({ parameter, analysis, target }) {
  const decimals = parameter.key === 'kh_dkh' ? 2 : 1
  const consumption = analysis.dailyConsumption
  const trendText = buildConsumptionSummary(analysis.trend, consumption, decimals, parameter.unit)
  const predictedLowDays = analysis.predicted7d != null && analysis.predicted7d < target.min
    ? 7
    : analysis.predicted14d != null && analysis.predicted14d < target.min
      ? 14
      : null

  return (
    <article className={`min-w-0 overflow-hidden border-2 p-4 sm:p-5 ${predictedLowDays ? 'border-amber-500 bg-amber-950/30' : 'border-emerald-900 bg-zinc-950'}`}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{parameter.label}</h3>
        <span className="text-xs text-zinc-500">{analysis.sampleCount}回</span>
      </div>
      <p className="mt-4 text-lg font-bold text-emerald-300">{trendText}</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
        <Prediction label="現在" value={analysis.currentValue} unit={parameter.unit} />
        <Prediction label="7日後" value={analysis.predicted7d} unit={parameter.unit} />
        <Prediction label="14日後" value={analysis.predicted14d} unit={parameter.unit} wide />
      </div>
      {predictedLowDays && (
        <p className="mt-4 border-l-4 border-amber-400 pl-3 text-sm leading-6 text-amber-100">
          この傾向が続くと、約{predictedLowDays}日後に目標範囲を下回る可能性があります。測定間隔と管理履歴を確認してください。
        </p>
      )}
    </article>
  )
}

function Prediction({ label, value, unit, wide = false }) {
  return (
    <div className={`min-w-0 border border-zinc-800 bg-zinc-900 p-2 ${wide ? 'col-span-2 sm:col-span-1' : ''}`}>
      <p className="text-[11px] text-zinc-500">{label}</p>
      <p className="mt-1 truncate font-bold text-white">{value == null ? '―' : Number(value).toFixed(unit === 'dKH' ? 2 : 1)}</p>
      <p className="truncate text-[10px] text-zinc-500">{value == null ? '' : unit}</p>
    </div>
  )
}

function PeriodControl({ values, value, onChange, suffix }) {
  return (
    <div className="flex max-w-full flex-wrap border border-zinc-700">
      {values.map(option => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`min-h-11 px-3 text-sm font-bold ${value === option ? 'bg-emerald-400 text-zinc-950' : 'bg-zinc-950 text-zinc-300'}`}
        >
          {option === 'all' ? '全期間' : `${option}${suffix}`}
        </button>
      ))}
    </div>
  )
}

function ErrorMessage({ children }) {
  return <p className="mt-4 border border-rose-700 bg-rose-950 p-4 text-rose-100">{children}</p>
}

function ProShell({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ProHeader />
      <main className="mx-auto max-w-7xl overflow-x-clip px-3 py-5 sm:px-4 sm:py-7">{children}</main>
    </div>
  )
}
