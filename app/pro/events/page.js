'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ProHeader from '@/components/ProHeader'
import { supabase } from '@/lib/supabase'
import { PRO_EVENT_LABELS, PRO_EVENT_TYPES, PRO_PARAMETERS } from '@/lib/proParameters'

const initialForm = {
  id: '',
  eventAt: new Date().toISOString().slice(0, 16),
  eventType: 'water_change',
  title: '',
  description: '',
  amountText: '',
  relatedParameter: '',
}

export default function ProEventsPage() {
  return (
    <Suspense fallback={<ProShell><p className="text-zinc-400">イベント画面を準備しています...</p></ProShell>}>
      <ProEvents />
    </Suspense>
  )
}

function ProEvents() {
  const searchParams = useSearchParams()
  const requestedTankId = searchParams.get('tank')
  const [session, setSession] = useState(null)
  const [tank, setTank] = useState(null)
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [requestedTankId])

  async function load() {
    setLoading(true)
    const { data: authData } = await supabase.auth.getSession()
    setSession(authData.session)
    if (!authData.session) {
      setLoading(false)
      return
    }
    let tankQuery = supabase.from('pro_tank_profiles').select('id, display_name')
    tankQuery = requestedTankId ? tankQuery.eq('id', requestedTankId) : tankQuery.order('created_at').limit(1)
    const tankResult = await tankQuery.maybeSingle()
    if (tankResult.error || !tankResult.data) {
      setError('Pro水槽を確認できませんでした。')
      setLoading(false)
      return
    }
    setTank(tankResult.data)
    const eventResult = await supabase.from('pro_events').select('*').eq('tank_id', tankResult.data.id).order('event_at', { ascending: false })
    if (eventResult.error) setError('イベント履歴を読み込めませんでした。')
    else setEvents(eventResult.data ?? [])
    setLoading(false)
  }

  async function save(event) {
    event.preventDefault()
    if (!session?.user?.id || !tank?.id || !form.title.trim()) return
    setSaving(true)
    setError('')
    const payload = {
      user_id: session.user.id,
      tank_id: tank.id,
      event_at: new Date(form.eventAt).toISOString(),
      event_type: form.eventType,
      title: form.title.trim(),
      description: form.description.trim() || null,
      amount_text: form.amountText.trim() || null,
      related_parameter: form.relatedParameter || null,
    }
    const result = form.id
      ? await supabase.from('pro_events').update(payload).eq('id', form.id).select('*').single()
      : await supabase.from('pro_events').insert(payload).select('*').single()
    if (result.error) {
      setError('イベントを保存できませんでした。')
    } else {
      setEvents(current => [
        result.data,
        ...current.filter(item => item.id !== result.data.id),
      ].sort((a, b) => new Date(b.event_at) - new Date(a.event_at)))
      setForm(initialForm)
    }
    setSaving(false)
  }

  function startEdit(event) {
    setForm({
      id: event.id,
      eventAt: new Date(event.event_at).toISOString().slice(0, 16),
      eventType: event.event_type,
      title: event.title,
      description: event.description || '',
      amountText: event.amount_text || '',
      relatedParameter: event.related_parameter || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function remove(event) {
    if (!window.confirm(`「${event.title}」を削除しますか？`)) return
    const { error: deleteError } = await supabase.from('pro_events').delete().eq('id', event.id)
    if (deleteError) setError('イベントを削除できませんでした。')
    else {
      setEvents(current => current.filter(item => item.id !== event.id))
      if (form.id === event.id) setForm(initialForm)
    }
  }

  if (loading) return <ProShell><p className="text-zinc-400">イベント履歴を読み込んでいます...</p></ProShell>
  if (!session || !tank) {
    return (
      <ProShell>
        <section className="mx-auto max-w-xl border border-zinc-800 bg-zinc-950 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Proホームから開始してください</h1>
          <Link href="/pro" className="mt-6 flex min-h-14 items-center justify-center bg-emerald-400 px-5 font-bold text-zinc-950">Proホームへ</Link>
        </section>
      </ProShell>
    )
  }

  return (
    <ProShell>
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-bold text-amber-400">EVENT CONTEXT</p>
        <h1 className="mt-1 text-3xl font-bold text-white">Proイベント</h1>
        <p className="mt-2 text-zinc-400">{tank.display_name} / 作業と水質変化を同じ時間軸へ残します。</p>

        <form onSubmit={save} className="mt-6 border border-zinc-800 bg-zinc-950 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-white">{form.id ? 'イベントを編集' : 'イベントを追加'}</h2>
            {form.id && <button type="button" onClick={() => setForm(initialForm)} className="min-h-11 px-3 text-sm font-bold text-zinc-400 underline">編集をやめる</button>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="日時">
              <input type="datetime-local" required value={form.eventAt} onChange={event => setForm(current => ({ ...current, eventAt: event.target.value }))} className="min-h-14 w-full border border-zinc-700 bg-zinc-900 px-3 text-white" />
            </Field>
            <Field label="種類">
              <select value={form.eventType} onChange={event => setForm(current => ({ ...current, eventType: event.target.value }))} className="min-h-14 w-full border border-zinc-700 bg-zinc-900 px-3 text-white">
                {PRO_EVENT_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="タイトル">
              <input required value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="例: Bacto Blend開始" className="min-h-14 w-full border border-zinc-700 bg-zinc-900 px-3 text-white" />
            </Field>
            <Field label="量・変更内容">
              <input value={form.amountText} onChange={event => setForm(current => ({ ...current, amountText: event.target.value }))} placeholder="例: 2 ml、照明5%減" className="min-h-14 w-full border border-zinc-700 bg-zinc-900 px-3 text-white" />
            </Field>
            <Field label="特に見たい水質項目">
              <select value={form.relatedParameter} onChange={event => setForm(current => ({ ...current, relatedParameter: event.target.value }))} className="min-h-14 w-full border border-zinc-700 bg-zinc-900 px-3 text-white">
                <option value="">指定しない</option>
                {PRO_PARAMETERS.map(parameter => <option key={parameter.key} value={parameter.key}>{parameter.label}</option>)}
              </select>
            </Field>
          </div>
          <Field label="詳細">
            <textarea rows={3} value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="変更した理由や観察したこと" className="min-h-24 w-full border border-zinc-700 bg-zinc-900 p-3 text-white" />
          </Field>
          {error && <p className="mt-4 border border-rose-700 bg-rose-950 p-4 text-rose-100">{error}</p>}
          <button disabled={saving} className="mt-4 min-h-14 w-full bg-amber-400 px-5 text-lg font-bold text-zinc-950 disabled:bg-zinc-700">
            {saving ? '保存しています...' : form.id ? '変更を保存' : 'イベントを保存'}
          </button>
        </form>

        <section className="mt-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">イベント履歴</h2>
            <Link href="/pro" className="text-sm font-bold text-emerald-300 underline">グラフで確認</Link>
          </div>
          <div className="mt-3 divide-y divide-zinc-800 border border-zinc-800">
            {events.length ? events.map(event => (
              <article key={event.id} className="bg-zinc-950 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-amber-300">{PRO_EVENT_LABELS[event.event_type] || 'イベント'} / {new Date(event.event_at).toLocaleString('ja-JP')}</p>
                    <h3 className="mt-1 text-lg font-bold text-white">{event.title}</h3>
                    {event.amount_text && <p className="mt-1 text-sm text-emerald-300">{event.amount_text}</p>}
                    {event.description && <p className="mt-2 text-sm leading-6 text-zinc-400">{event.description}</p>}
                  </div>
                  <div className="grid shrink-0 grid-cols-2 gap-2">
                    <button type="button" onClick={() => startEdit(event)} className="min-h-11 border border-zinc-600 px-4 text-sm font-bold text-white">編集</button>
                    <button type="button" onClick={() => remove(event)} className="min-h-11 border border-rose-800 px-4 text-sm font-bold text-rose-300">削除</button>
                  </div>
                </div>
              </article>
            )) : <p className="p-5 text-zinc-500">イベントはまだありません。</p>}
          </div>
        </section>
      </section>
    </ProShell>
  )
}

function Field({ label, children }) {
  return (
    <label className="mt-3 block">
      <span className="mb-1 block text-sm font-bold text-zinc-300">{label}</span>
      {children}
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
