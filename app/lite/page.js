'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import LiteBetaBanner from '@/components/LiteBetaBanner'
import LiteFeedbackLink from '@/components/LiteFeedbackLink'
import { supabase } from '@/lib/supabase'
import { LITE_MEASUREMENT_STEPS } from '@/lib/liteMeasurement'
import { LITE_PARAMETER_LABELS, judgeAll } from '@/lib/liteTargets'
import { browserSiteUrl } from '@/lib/siteUrl'

export default function LiteHomePage() {
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [tanks, setTanks] = useState([])
  const [latestByTank, setLatestByTank] = useState({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthChecked(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthChecked(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    loadLiteHome()
  }, [session])

  async function loadLiteHome() {
    setLoading(true)
    setError('')
    const tankResult = await supabase
      .from('lite_tank_profiles')
      .select('id, display_name, tank_volume_liters')
      .order('created_at')

    if (tankResult.error) {
      setError('Lite水槽を読み込めませんでした。もう一度お試しください。')
      setLoading(false)
      return
    }

    const nextTanks = tankResult.data ?? []
    setTanks(nextTanks)
    if (nextTanks.length) {
      const measurementResult = await supabase
        .from('lite_measurements')
        .select('tank_id, measured_at, temperature_c, salinity_sg, kh_dkh, no3_ppm, po4_ppm')
        .in('tank_id', nextTanks.map(tank => tank.id))
        .order('measured_at', { ascending: false })

      if (!measurementResult.error) {
        const latest = {}
        for (const record of measurementResult.data ?? []) {
          if (!latest[record.tank_id]) {
            latest[record.tank_id] = { measured_at: record.measured_at, parameter_dates: {} }
          }
          for (const step of LITE_MEASUREMENT_STEPS) {
            if (latest[record.tank_id][step.key] == null && record[step.key] != null) {
              latest[record.tank_id][step.key] = record[step.key]
              latest[record.tank_id].parameter_dates[step.key] = record.measured_at
            }
          }
        }
        setLatestByTank(latest)
      }
    }
    setLoading(false)
  }

  async function sendMagicLink(event) {
    event.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${browserSiteUrl()}/lite` },
    })
    setMessage(error ? 'ログインメールを送れませんでした。もう一度お試しください。' : 'ログインリンクをメールへ送りました。')
  }

  async function createLiteTank() {
    if (!session?.user?.id) return
    setCreating(true)
    setError('')
    const { data, error } = await supabase
      .from('lite_tank_profiles')
      .insert({ user_id: session.user.id, display_name: 'わたしの水槽' })
      .select('id, display_name, tank_volume_liters')
      .single()
    if (error) setError('Lite水槽を作成できませんでした。')
    else setTanks([data])
    setCreating(false)
  }

  if (!authChecked || loading) return <Shell><p className="text-slate-300">Liteを準備しています...</p></Shell>

  if (!session) {
    return (
      <Shell>
        <section className="mx-auto mb-4 max-w-md border border-amber-500 bg-amber-950/50 p-5">
          <p className="text-xs font-bold text-amber-200">ログインなしで確認できます</p>
          <h1 className="mt-1 text-2xl font-bold text-white">ナガレハナ不調デモ</h1>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            水質の変化、添加剤、写真をまとめたショップ相談用カルテです。実データは変更しません。
          </p>
          <Link
            href="/lite/shop-card?demo=nagarehana"
            className="mt-4 flex min-h-14 items-center justify-center bg-amber-400 px-4 py-3 text-lg font-bold text-slate-950"
          >
            ナガレハナ不調デモを開く
          </Link>
        </section>
        <section className="mx-auto max-w-md border border-slate-700 bg-slate-900 p-5">
          <h1 className="mt-1 text-3xl font-bold text-white">かんたん水質記録</h1>
          <p className="mt-3 leading-relaxed text-slate-300">測れた項目だけで大丈夫です。ショップへ見せやすい水槽カルテを作ります。</p>
          <p className="mt-2 text-sm text-amber-100">現在はβ版です。大切な記録はCSVでのバックアップをおすすめします。</p>
          <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
            <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="メールアドレス" className="w-full border border-slate-600 bg-slate-950 px-4 py-4 text-lg text-white" />
            <button className="min-h-14 w-full bg-cyan-400 px-4 py-3 text-lg font-bold text-slate-950">ログインリンクを送る</button>
          </form>
          {message && <p className="mt-3 text-sm text-cyan-200">{message}</p>}
        </section>
      </Shell>
    )
  }

  return (
    <Shell>
      <h1 className="mt-1 text-3xl font-bold text-white">Liteホーム</h1>
      <p className="mt-2 text-slate-300">今日は測れた項目だけ記録しましょう。</p>
      <p className="mt-2 text-sm text-slate-400">現在はβ版です。大切な記録はCSVでのバックアップをおすすめします。</p>

      {error && <p className="mt-5 border border-rose-700 bg-rose-950 p-4 text-rose-100">{error}</p>}

      {tanks.length === 0 ? (
        <section className="mt-6 max-w-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-bold text-white">最初の水槽を準備します</h2>
          <p className="mt-2 text-sm text-slate-300">名前や水量はあとから追加できます。まずは測定記録から始められます。</p>
          <button type="button" disabled={creating} onClick={createLiteTank} className="mt-5 min-h-14 w-full bg-cyan-400 px-5 py-3 text-lg font-bold text-slate-950 disabled:bg-slate-700">
            {creating ? '準備中...' : 'Liteをはじめる'}
          </button>
        </section>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {tanks.map(tank => (
            <TankHomeCard key={tank.id} tank={tank} latest={latestByTank[tank.id]} />
          ))}
        </div>
      )}
    </Shell>
  )
}

function TankHomeCard({ tank, latest }) {
  const actions = [
    { href: `/lite/measure?tank=${tank.id}`, label: '水質を記録', primary: true },
    { href: `/lite/record?type=water-change&tank=${tank.id}`, label: '水換えを記録' },
    { href: `/lite/record?type=additive&tank=${tank.id}`, label: '添加剤を記録' },
    { href: `/lite/record?type=photo&tank=${tank.id}`, label: '写真を追加' },
    { href: `/lite/profile?tank=${tank.id}`, label: '飼育環境を登録' },
    { href: `/lite/shop-card?tank=${tank.id}`, label: 'ショップに見せる', shop: true },
  ]
  const judged = judgeAll(latest)
  const redCount = judged.filter(item => item.severity === 'red').length
  const yellowCount = judged.filter(item => item.severity === 'yellow').length
  const missing = judged.filter(item => item.severity === 'unknown')
  const todayStatus = redCount
    ? { label: 'ショップに見せて相談', tone: 'border-rose-500 bg-rose-950 text-rose-100' }
    : yellowCount
      ? { label: '確認したい項目あり', tone: 'border-amber-400 bg-amber-950 text-amber-100' }
      : missing.length === judged.length
        ? { label: '記録を始めましょう', tone: 'border-slate-600 bg-slate-950 text-slate-200' }
        : { label: '大きな確認なし', tone: 'border-emerald-500 bg-emerald-950 text-emerald-100' }
  const nextKey = missing[0]?.parameterKey

  return (
    <article className="border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{tank.display_name || 'わたしの水槽'}</h2>
          <p className="mt-1 text-sm text-slate-400">{tank.tank_volume_liters ? `${tank.tank_volume_liters} L` : '水量はあとで登録できます'}</p>
        </div>
        <span className="border border-cyan-700 px-2 py-1 text-xs font-bold text-cyan-200">Lite</span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <div className={`border-2 p-3 sm:col-span-1 ${todayStatus.tone}`}>
          <p className="text-[11px] font-bold opacity-75">今日の状態</p>
          <p className="mt-1 font-bold">{todayStatus.label}</p>
        </div>
        <div className="border border-slate-700 bg-slate-950 p-3">
          <p className="text-[11px] text-slate-400">最後の記録日</p>
          <p className="mt-1 font-bold text-white">{latest?.measured_at ? new Date(latest.measured_at).toLocaleDateString('ja-JP') : 'まだありません'}</p>
        </div>
        <div className="border border-slate-700 bg-slate-950 p-3">
          <p className="text-[11px] text-slate-400">次に測ると良い項目</p>
          <p className="mt-1 font-bold text-white">{nextKey ? LITE_PARAMETER_LABELS[nextKey] : '5項目そろっています'}</p>
        </div>
      </div>
      {missing.length > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          今回まだ測っていない項目: {missing.map(item => LITE_PARAMETER_LABELS[item.parameterKey]).join('、')}
        </p>
      )}

      <div className="mt-4 grid grid-cols-5 gap-1">
        {LITE_MEASUREMENT_STEPS.map(step => (
          <div key={step.key} className="min-w-0 border border-slate-800 bg-slate-950 p-2 text-center">
            <p className="truncate text-[11px] text-slate-400">{step.label}</p>
            <p className="mt-1 truncate text-sm font-bold text-white">{latest?.[step.key] ?? '—'}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">{latest?.measured_at ? `前回の記録: ${new Date(latest.measured_at).toLocaleDateString('ja-JP')}` : 'まだ測定記録はありません。'}</p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {actions.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className={`flex min-h-14 items-center justify-center px-3 py-3 text-center font-bold ${
              action.primary
                ? 'bg-cyan-400 text-slate-950'
                : action.shop
                  ? 'col-span-2 border-2 border-emerald-500 bg-emerald-950 text-emerald-100'
                  : 'border border-slate-600 bg-slate-950 text-slate-100'
            }`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </article>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <LiteBetaBanner />
      <main className="mx-auto max-w-5xl px-4 py-7">
        {children}
        <LiteFeedbackLink />
      </main>
    </div>
  )
}
