'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { LITE_MEASUREMENT_STEPS } from '@/lib/liteMeasurement'

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
          if (!latest[record.tank_id]) latest[record.tank_id] = record
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
      options: { emailRedirectTo: `${window.location.origin}/lite` },
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
        <section className="mx-auto max-w-md border border-slate-700 bg-slate-900 p-5">
          <p className="text-sm font-bold text-cyan-300">AQUA REEF LOG LITE</p>
          <h1 className="mt-1 text-3xl font-bold text-white">かんたん水質記録</h1>
          <p className="mt-3 leading-relaxed text-slate-300">測れた項目だけで大丈夫です。ショップへ見せやすい水槽カルテを作ります。</p>
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
      <p className="text-sm font-bold text-cyan-300">AQUA REEF LOG LITE</p>
      <h1 className="mt-1 text-3xl font-bold text-white">Liteホーム</h1>
      <p className="mt-2 text-slate-300">今日は測れた項目だけ記録しましょう。</p>

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
  return (
    <article className="border border-slate-700 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">{tank.display_name || 'わたしの水槽'}</h2>
          <p className="mt-1 text-sm text-slate-400">{tank.tank_volume_liters ? `${tank.tank_volume_liters} L` : '水量はあとで登録できます'}</p>
        </div>
        <span className="border border-cyan-700 px-2 py-1 text-xs font-bold text-cyan-200">Lite</span>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-1">
        {LITE_MEASUREMENT_STEPS.map(step => (
          <div key={step.key} className="min-w-0 border border-slate-800 bg-slate-950 p-2 text-center">
            <p className="truncate text-[11px] text-slate-400">{step.label}</p>
            <p className="mt-1 truncate text-sm font-bold text-white">{latest?.[step.key] ?? '—'}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">{latest?.measured_at ? `前回の記録: ${new Date(latest.measured_at).toLocaleDateString('ja-JP')}` : 'まだ測定記録はありません。'}</p>

      <Link href={`/lite/measure?tank=${tank.id}`} className="mt-5 flex min-h-14 items-center justify-center bg-cyan-400 px-5 py-3 text-lg font-bold text-slate-950">
        測定する
      </Link>
      <Link href="/share/create" className="mt-2 flex min-h-11 items-center justify-center border border-slate-600 px-4 py-2 text-sm font-bold text-slate-200">
        ショップカルテを共有
      </Link>
    </article>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-7">{children}</main>
    </div>
  )
}
