'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import LiteBetaBanner from '@/components/LiteBetaBanner'
import { supabase } from '@/lib/supabase'
import {
  LITE_MEASUREMENT_STEPS,
  buildLiteMeasurementPayload,
  findPreviousLiteValues,
  hasAnyLiteMeasurement,
} from '@/lib/liteMeasurement'

export default function LiteMeasurePage() {
  return (
    <Suspense fallback={<Shell><p className="text-slate-300">測定画面を準備しています...</p></Shell>}>
      <LiteMeasureFlow />
    </Suspense>
  )
}

function LiteMeasureFlow() {
  const searchParams = useSearchParams()
  const tankId = searchParams.get('tank')
  const inputRef = useRef(null)
  const [session, setSession] = useState(null)
  const [tank, setTank] = useState(null)
  const [previous, setPrevious] = useState({})
  const [values, setValues] = useState({})
  const [stepIndex, setStepIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const reviewIndex = LITE_MEASUREMENT_STEPS.length
  const currentStep = LITE_MEASUREMENT_STEPS[stepIndex]
  const hasAnyValue = useMemo(() => hasAnyLiteMeasurement(values), [values])

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getSession()
      const nextSession = authData.session
      setSession(nextSession)
      if (!nextSession || !tankId) {
        setLoading(false)
        return
      }

      const [tankResult, recordsResult] = await Promise.all([
        supabase.from('lite_tank_profiles').select('id, display_name').eq('id', tankId).single(),
        supabase
          .from('lite_measurements')
          .select('measured_at, temperature_c, salinity_sg, kh_dkh, no3_ppm, po4_ppm')
          .eq('tank_id', tankId)
          .order('measured_at', { ascending: false })
          .limit(100),
      ])

      if (tankResult.error) setError('水槽を確認できませんでした。Liteホームからもう一度開いてください。')
      else {
        setTank(tankResult.data)
        setPrevious(findPreviousLiteValues(recordsResult.data ?? []))
      }
      setLoading(false)
    }
    load()
  }, [tankId])

  useEffect(() => {
    if (currentStep && !loading) {
      window.setTimeout(() => inputRef.current?.focus(), 80)
    }
  }, [stepIndex, loading, currentStep])

  function goNext() {
    setStepIndex(current => Math.min(current + 1, reviewIndex))
  }

  function goBack() {
    setStepIndex(current => Math.max(current - 1, 0))
  }

  function copyPrevious() {
    if (!currentStep || previous[currentStep.key] == null) return
    setValues(current => ({ ...current, [currentStep.key]: String(previous[currentStep.key]) }))
    inputRef.current?.focus()
  }

  function skipCurrent() {
    if (!currentStep) return
    setValues(current => ({ ...current, [currentStep.key]: '' }))
    goNext()
  }

  async function saveMeasurement() {
    if (!hasAnyValue || !session?.user?.id || !tankId) return
    setSaving(true)
    setError('')
    const payload = buildLiteMeasurementPayload(values)
    const { error } = await supabase.from('lite_measurements').insert({
      ...payload,
      tank_id: tankId,
      user_id: session.user.id,
      measured_at: new Date().toISOString(),
    })
    if (error) setError('記録を保存できませんでした。入力内容はこの画面に残っています。もう一度お試しください。')
    else setSaved(true)
    setSaving(false)
  }

  if (loading) return <Shell><p className="text-slate-300">前回の記録を確認しています...</p></Shell>

  if (!session) {
    return (
      <Shell>
        <Message title="ログインが必要です" body="Liteホームからログインすると測定を記録できます。" />
        <Link href="/lite" className="mt-4 flex min-h-12 items-center justify-center bg-cyan-400 px-4 py-3 font-bold text-slate-950">Liteホームへ</Link>
      </Shell>
    )
  }

  if (!tankId || !tank) {
    return (
      <Shell>
        <Message title="水槽を選んでください" body="大丈夫です。Liteホームから測定する水槽を選べます。" />
        <Link href="/lite" className="mt-4 flex min-h-12 items-center justify-center bg-cyan-400 px-4 py-3 font-bold text-slate-950">Liteホームへ</Link>
      </Shell>
    )
  }

  if (saved) {
    const count = LITE_MEASUREMENT_STEPS.filter(step => values[step.key] !== '' && values[step.key] != null).length
    const skipped = LITE_MEASUREMENT_STEPS.filter(step => values[step.key] === '' || values[step.key] == null)
    return (
      <Shell>
        <section className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-3xl font-bold text-slate-950">✓</div>
          <h1 className="mt-5 text-3xl font-bold text-white">記録できました</h1>
          <p className="mt-3 text-slate-300">{count}項目を水槽カルテへ追加しました。測れなかった項目があっても問題ありません。</p>
          {skipped.length > 0 && (
            <p className="mt-4 border border-amber-700 bg-amber-950 p-4 text-left text-sm text-amber-100">
              次に {skipped.map(step => step.label).join('、')} を測ると、ショップが助言しやすくなります。
            </p>
          )}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href="/lite" className="flex min-h-14 items-center justify-center bg-cyan-400 px-5 py-3 text-lg font-bold text-slate-950">Liteホームへ</Link>
            <Link href={`/lite/shop-card?tank=${tankId}`} className="flex min-h-14 items-center justify-center border border-cyan-600 px-5 py-3 text-lg font-bold text-cyan-100">ショップに見せる</Link>
          </div>
        </section>
      </Shell>
    )
  }

  return (
    <Shell>
      <section className="mx-auto max-w-xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-cyan-300">{tank.display_name || 'わたしの水槽'}</p>
            <p className="mt-1 text-sm text-slate-400">測れた項目だけで大丈夫です</p>
          </div>
          <span className="text-sm font-bold text-slate-300">{Math.min(stepIndex + 1, 6)} / 6</span>
        </div>
        <div className="mt-3 grid grid-cols-6 gap-1" aria-label="入力の進み具合">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className={`h-2 ${index <= stepIndex ? 'bg-cyan-400' : 'bg-slate-800'}`} />
          ))}
        </div>

        {currentStep ? (
          <div className="mt-8">
            <p className="text-center text-sm font-bold text-cyan-300">今回測った値</p>
            <h1 className="mt-2 text-center text-4xl font-bold text-white">{currentStep.label}</h1>
            <p className="mt-2 text-center text-slate-400">{currentStep.help}</p>

            <div className="mt-8 flex items-end gap-3">
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                step={currentStep.step}
                value={values[currentStep.key] ?? ''}
                onChange={event => setValues(current => ({ ...current, [currentStep.key]: event.target.value }))}
                placeholder={currentStep.placeholder}
                aria-label={`${currentStep.label} ${currentStep.unit}`}
                className="min-w-0 flex-1 border-2 border-cyan-700 bg-slate-950 px-4 py-5 text-center text-5xl font-bold text-white outline-none focus:border-cyan-300"
              />
              <span className="pb-5 text-lg font-bold text-slate-300">{currentStep.unit}</span>
            </div>

            <div className="mt-5 border border-slate-700 bg-slate-900 p-4">
              <p className="text-xs text-slate-400">前回の値</p>
              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-2xl font-bold text-white">
                  {previous[currentStep.key] != null ? `${previous[currentStep.key]} ${currentStep.unit}` : '前回の記録はありません'}
                </p>
                <button
                  type="button"
                  disabled={previous[currentStep.key] == null}
                  onClick={copyPrevious}
                  className="min-h-11 shrink-0 border border-cyan-600 px-4 py-2 text-sm font-bold text-cyan-100 disabled:border-slate-700 disabled:text-slate-600"
                >
                  前回値をコピー
                </button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <button type="button" onClick={skipCurrent} className="min-h-14 border border-slate-600 px-3 py-3 text-base font-bold text-slate-200">
                今回は測らない
              </button>
              <button type="button" onClick={goNext} className="min-h-14 bg-cyan-400 px-3 py-3 text-lg font-bold text-slate-950">
                次へ
              </button>
            </div>
          </div>
        ) : (
          <Review values={values} hasAnyValue={hasAnyValue} saving={saving} onBack={goBack} onSave={saveMeasurement} />
        )}

        {currentStep && stepIndex > 0 && (
          <button type="button" onClick={goBack} className="mt-4 min-h-11 w-full text-sm font-bold text-slate-400 underline underline-offset-4">
            ひとつ前へ戻る
          </button>
        )}
        {error && <p className="mt-5 border border-rose-700 bg-rose-950 p-4 text-sm text-rose-100">{error}</p>}
      </section>
    </Shell>
  )
}

function Review({ values, hasAnyValue, saving, onBack, onSave }) {
  return (
    <div className="mt-8">
      <p className="text-center text-sm font-bold text-cyan-300">確認</p>
      <h1 className="mt-2 text-center text-3xl font-bold text-white">この内容で記録します</h1>
      <p className="mt-2 text-center text-slate-400">「今回は測らない」があっても大丈夫です。</p>

      <div className="mt-7 divide-y divide-slate-800 border border-slate-700 bg-slate-900">
        {LITE_MEASUREMENT_STEPS.map(step => {
          const value = values[step.key]
          const measured = value != null && String(value).trim() !== ''
          return (
            <div key={step.key} className="flex items-center justify-between gap-4 p-4">
              <span className="font-bold text-white">{step.label}</span>
              <span className={measured ? 'text-lg font-bold text-cyan-200' : 'text-sm text-slate-500'}>
                {measured ? `${value} ${step.unit}` : '今回は測らない'}
              </span>
            </div>
          )
        })}
      </div>

      {!hasAnyValue && (
        <p className="mt-4 border border-amber-700 bg-amber-950 p-4 text-sm text-amber-100">
          保存するには、測れた項目を1つだけ入力してください。
        </p>
      )}
      <button type="button" disabled={!hasAnyValue || saving} onClick={onSave} className="mt-6 min-h-16 w-full bg-cyan-400 px-5 py-4 text-xl font-bold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">
        {saving ? '保存しています...' : '記録を保存'}
      </button>
      <button type="button" onClick={onBack} className="mt-3 min-h-11 w-full text-sm font-bold text-slate-400 underline underline-offset-4">
        PO4へ戻る
      </button>
    </div>
  )
}

function Message({ title, body }) {
  return (
    <section className="mx-auto max-w-lg border border-slate-700 bg-slate-900 p-6 text-center">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-slate-300">{body}</p>
    </section>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <LiteBetaBanner />
      <main className="mx-auto max-w-4xl px-4 py-7">{children}</main>
    </div>
  )
}
