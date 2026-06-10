'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ProHeader from '@/components/ProHeader'
import { supabase } from '@/lib/supabase'
import { hasAnyProMeasurement, parseNullableNumber, PRO_PARAMETERS } from '@/lib/proParameters'

export default function ProMeasurePage() {
  return (
    <Suspense fallback={<ProShell><p className="text-zinc-400">入力画面を準備しています...</p></ProShell>}>
      <ProMeasureForm />
    </Suspense>
  )
}

function ProMeasureForm() {
  const searchParams = useSearchParams()
  const requestedTankId = searchParams.get('tank')
  const [session, setSession] = useState(null)
  const [tank, setTank] = useState(null)
  const [values, setValues] = useState({})
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().slice(0, 16))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const canSave = useMemo(() => hasAnyProMeasurement(values), [values])

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getSession()
      setSession(authData.session)
      if (!authData.session) {
        setLoading(false)
        return
      }
      let query = supabase.from('pro_tank_profiles').select('id, display_name')
      query = requestedTankId ? query.eq('id', requestedTankId) : query.order('created_at').limit(1)
      const result = await query.maybeSingle()
      if (result.error) setError('Pro水槽を確認できませんでした。')
      else setTank(result.data)
      setLoading(false)
    }
    load()
  }, [requestedTankId])

  async function save(event) {
    event.preventDefault()
    if (!session?.user?.id || !tank?.id || !canSave) return
    setSaving(true)
    setError('')
    const payload = Object.fromEntries(PRO_PARAMETERS.map(parameter => [
      parameter.key,
      parseNullableNumber(values[parameter.key]),
    ]))
    const { error: saveError } = await supabase.from('pro_measurements').insert({
      ...payload,
      user_id: session.user.id,
      tank_id: tank.id,
      measured_at: new Date(measuredAt).toISOString(),
      note: note.trim() || null,
    })
    if (saveError) setError('測定を保存できませんでした。入力内容を残したまま、もう一度お試しください。')
    else setSaved(true)
    setSaving(false)
  }

  if (loading) return <ProShell><p className="text-zinc-400">Pro水槽を確認しています...</p></ProShell>
  if (!session || !tank) {
    return (
      <ProShell>
        <section className="mx-auto max-w-xl border border-zinc-800 bg-zinc-950 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Proホームから開始してください</h1>
          <p className="mt-3 text-zinc-400">ログインし、分析用の水槽を作成すると測定を保存できます。</p>
          <Link href="/pro" className="mt-6 flex min-h-14 items-center justify-center bg-emerald-400 px-5 font-bold text-zinc-950">Proホームへ</Link>
        </section>
      </ProShell>
    )
  }
  if (saved) {
    return (
      <ProShell>
        <section className="mx-auto max-w-xl border border-emerald-800 bg-emerald-950/30 p-6 text-center">
          <p className="text-sm font-bold text-emerald-300">MEASUREMENT SAVED</p>
          <h1 className="mt-2 text-3xl font-bold text-white">測定を保存しました</h1>
          <p className="mt-3 text-zinc-300">消費速度と予測へ反映されます。空欄の項目があっても問題ありません。</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href="/pro" className="flex min-h-14 items-center justify-center bg-emerald-400 px-5 font-bold text-zinc-950">分析を見る</Link>
            <button type="button" onClick={() => { setSaved(false); setValues({}); setNote('') }} className="min-h-14 border border-zinc-600 px-5 font-bold text-white">続けて入力</button>
          </div>
        </section>
      </ProShell>
    )
  }

  return (
    <ProShell>
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-bold text-emerald-400">ADVANCED MEASUREMENT</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Pro水質入力</h1>
        <p className="mt-2 text-zinc-400">{tank.display_name} / 測れた項目だけ入力できます。</p>

        <form onSubmit={save} className="mt-6">
          <label className="block max-w-sm">
            <span className="text-sm font-bold text-zinc-300">測定日時</span>
            <input type="datetime-local" required value={measuredAt} onChange={event => setMeasuredAt(event.target.value)} className="mt-1 min-h-14 w-full border border-zinc-700 bg-zinc-950 px-4 text-white" />
          </label>

          <section className="mt-6">
            <h2 className="text-lg font-bold text-white">消費速度の中心項目</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {PRO_PARAMETERS.filter(parameter => parameter.core).map(parameter => (
                <MeasurementInput key={parameter.key} parameter={parameter} value={values[parameter.key] ?? ''} onChange={value => setValues(current => ({ ...current, [parameter.key]: value }))} prominent />
              ))}
            </div>
          </section>

          <section className="mt-7">
            <h2 className="text-lg font-bold text-white">その他の測定項目</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PRO_PARAMETERS.filter(parameter => !parameter.core).map(parameter => (
                <MeasurementInput key={parameter.key} parameter={parameter} value={values[parameter.key] ?? ''} onChange={value => setValues(current => ({ ...current, [parameter.key]: value }))} />
              ))}
            </div>
          </section>

          <label className="mt-6 block">
            <span className="text-sm font-bold text-zinc-300">測定メモ</span>
            <textarea rows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="測定方法、試薬ロット、気になったこと" className="mt-1 w-full border border-zinc-700 bg-zinc-950 p-4 text-white" />
          </label>

          {!canSave && <p className="mt-4 border border-amber-800 bg-amber-950/40 p-4 text-sm text-amber-100">保存するには、測定できた項目を1つ以上入力してください。</p>}
          {error && <p className="mt-4 border border-rose-700 bg-rose-950 p-4 text-rose-100">{error}</p>}
          <div className="sticky bottom-0 mt-6 grid gap-2 border-t border-zinc-800 bg-zinc-950/95 py-3 backdrop-blur sm:grid-cols-[1fr_2fr]">
            <Link href="/pro" className="flex min-h-14 items-center justify-center border border-zinc-700 px-4 font-bold text-zinc-300">今回は保存せず戻る</Link>
            <button disabled={!canSave || saving} className="min-h-14 bg-emerald-400 px-5 text-lg font-bold text-zinc-950 disabled:bg-zinc-700 disabled:text-zinc-400">
              {saving ? '保存しています...' : '測定を保存'}
            </button>
          </div>
        </form>
      </section>
    </ProShell>
  )
}

function MeasurementInput({ parameter, value, onChange, prominent = false }) {
  return (
    <label className={`block border p-4 ${prominent ? 'border-emerald-800 bg-emerald-950/20' : 'border-zinc-800 bg-zinc-950'}`}>
      <span className="block min-h-11 font-bold text-white">{parameter.label}</span>
      <div className="mt-2 flex items-end gap-2">
        <input
          type="number"
          inputMode="decimal"
          step={parameter.step}
          value={value}
          onChange={event => onChange(event.target.value)}
          className={`min-h-14 min-w-0 flex-1 border border-zinc-700 bg-zinc-900 px-3 text-center font-bold text-white ${prominent ? 'text-3xl' : 'text-2xl'}`}
        />
        <span className="pb-4 text-sm font-bold text-zinc-400">{parameter.unit}</span>
      </div>
    </label>
  )
}

function ProShell({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <ProHeader />
      <main className="mx-auto max-w-7xl overflow-x-clip px-3 py-5 sm:px-4 sm:py-7">{children}</main>
    </div>
  )
}
