'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

const RECORD_TYPES = {
  'water-change': { title: '水換えを記録', description: '今回の水換えと、いつもの頻度をまとめて残せます。' },
  additive: { title: '添加剤を記録', description: '使用中の製品名、1回量、頻度を記録します。' },
  photo: { title: '写真を追加', description: '現在の水槽写真をカルテへ追加します。' },
}

const FREQUENCIES = [
  ['daily', '毎日'],
  ['every_2_days', '2日に1回'],
  ['weekly', '週1回'],
  ['as_needed', '必要時'],
  ['unknown', 'まだ決めていない'],
]

export default function LiteRecordPage() {
  return (
    <Suspense fallback={<Shell><p className="text-slate-300">入力画面を準備しています...</p></Shell>}>
      <RecordForm />
    </Suspense>
  )
}

function RecordForm() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type') || 'water-change'
  const tankId = searchParams.get('tank')
  const definition = RECORD_TYPES[type] || RECORD_TYPES['water-change']
  const [session, setSession] = useState(null)
  const [tank, setTank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tankVolume: '',
    frequencyDays: '',
    amountLiters: '',
    changedAt: new Date().toISOString().slice(0, 10),
    brand: '',
    productName: '',
    doseAmount: '',
    frequency: 'unknown',
    note: '',
    photoData: '',
    photoName: '',
  })

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getSession()
      setSession(authData.session)
      if (!authData.session || !tankId) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('lite_tank_profiles')
        .select('id, display_name, tank_volume_liters, water_change_frequency_days, water_change_volume_liters')
        .eq('id', tankId)
        .single()
      if (error) setError('水槽を読み込めませんでした。')
      else {
        setTank(data)
        setForm(current => ({
          ...current,
          tankVolume: data.tank_volume_liters ?? '',
          frequencyDays: data.water_change_frequency_days ?? '',
          amountLiters: data.water_change_volume_liters ?? '',
        }))
      }
      setLoading(false)
    }
    load()
  }, [tankId])

  async function onPhotoSelected(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    try {
      const photoData = await resizeImage(file)
      setForm(current => ({ ...current, photoData, photoName: file.name }))
    } catch {
      setError('写真を読み込めませんでした。別の写真をお試しください。')
    }
  }

  async function save(event) {
    event.preventDefault()
    if (!session?.user?.id || !tankId) return
    setSaving(true)
    setError('')
    let result

    if (type === 'water-change') {
      result = await supabase
        .from('lite_tank_profiles')
        .update({
          tank_volume_liters: nullableNumber(form.tankVolume),
          water_change_frequency_days: nullableNumber(form.frequencyDays),
          water_change_volume_liters: nullableNumber(form.amountLiters),
          last_water_change_at: form.changedAt || null,
        })
        .eq('id', tankId)
    } else if (type === 'additive') {
      if (!form.productName.trim()) {
        setError('添加剤の商品名を入力してください。')
        setSaving(false)
        return
      }
      result = await supabase.from('lite_additive_usage').insert({
        tank_id: tankId,
        user_id: session.user.id,
        brand_snapshot: form.brand.trim() || null,
        product_name_snapshot: form.productName.trim(),
        amount_text: form.doseAmount.trim() || null,
        frequency: form.frequency,
        usage_note: form.note.trim() || null,
        is_active: true,
        started_at: new Date().toISOString().slice(0, 10),
      })
    } else {
      if (!form.photoData) {
        setError('追加する写真を選んでください。')
        setSaving(false)
        return
      }
      result = await supabase.from('lite_tank_photos').insert({
        tank_id: tankId,
        user_id: session.user.id,
        photo_url: form.photoData,
        taken_at: new Date().toISOString(),
        note: form.note.trim() || null,
      })
    }

    if (result.error) setError('保存できませんでした。入力内容を確認して、もう一度お試しください。')
    else setSaved(true)
    setSaving(false)
  }

  if (loading) return <Shell><p className="text-slate-300">入力画面を準備しています...</p></Shell>
  if (!session || !tankId || !tank) {
    return (
      <Shell>
        <p className="border border-amber-700 bg-amber-950 p-4 text-amber-100">Liteホームから水槽を選んでください。</p>
        <Link href="/lite" className="mt-4 flex min-h-12 items-center justify-center bg-cyan-400 px-4 py-3 font-bold text-slate-950">Liteホームへ</Link>
      </Shell>
    )
  }
  if (saved) {
    return (
      <Shell>
        <section className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-3xl font-bold text-slate-950">✓</div>
          <h1 className="mt-5 text-3xl font-bold text-white">記録できました</h1>
          <p className="mt-3 text-slate-300">ショップに見せるカルテへ反映しました。</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href="/lite" className="flex min-h-14 items-center justify-center border border-slate-600 px-4 py-3 font-bold text-white">Liteホームへ</Link>
            <Link href={`/lite/shop-card?tank=${tankId}`} className="flex min-h-14 items-center justify-center bg-emerald-400 px-4 py-3 font-bold text-slate-950">ショップに見せる</Link>
          </div>
        </section>
      </Shell>
    )
  }

  return (
    <Shell>
      <section className="mx-auto max-w-xl">
        <p className="text-xs font-bold text-cyan-300">{tank.display_name || 'わたしの水槽'}</p>
        <h1 className="mt-1 text-3xl font-bold text-white">{definition.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{definition.description}</p>

        <form onSubmit={save} className="mt-6 space-y-4">
          {type === 'water-change' && (
            <>
              <NumberField label="水槽サイズ" unit="L" value={form.tankVolume} onChange={value => setField(setForm, 'tankVolume', value)} />
              <NumberField label="水換え頻度" unit="日ごと" value={form.frequencyDays} onChange={value => setField(setForm, 'frequencyDays', value)} />
              <NumberField label="今回の換水量" unit="L" value={form.amountLiters} onChange={value => setField(setForm, 'amountLiters', value)} required />
              <label className="block">
                <span className="text-sm font-bold text-slate-200">水換え日</span>
                <input type="date" required value={form.changedAt} onChange={event => setField(setForm, 'changedAt', event.target.value)} className="mt-1 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-lg text-white" />
              </label>
            </>
          )}

          {type === 'additive' && (
            <>
              <TextField label="メーカー" value={form.brand} onChange={value => setField(setForm, 'brand', value)} placeholder="例: Red Sea" />
              <TextField label="商品名" value={form.productName} onChange={value => setField(setForm, 'productName', value)} placeholder="例: Reef Foundation B" required />
              <TextField label="1回の数量" value={form.doseAmount} onChange={value => setField(setForm, 'doseAmount', value)} placeholder="例: 5 ml" />
              <label className="block">
                <span className="text-sm font-bold text-slate-200">使用頻度</span>
                <select value={form.frequency} onChange={event => setField(setForm, 'frequency', event.target.value)} className="mt-1 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-lg text-white">
                  {FREQUENCIES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </>
          )}

          {type === 'photo' && (
            <>
              <label className="block border-2 border-dashed border-cyan-700 bg-slate-900 p-5 text-center">
                <span className="block text-lg font-bold text-white">水槽写真を選ぶ</span>
                <span className="mt-1 block text-sm text-slate-400">カメラ撮影または写真一覧から選択</span>
                <input type="file" accept="image/*" capture="environment" onChange={onPhotoSelected} className="mt-4 block w-full text-sm text-slate-300" />
              </label>
              {form.photoData && <img src={form.photoData} alt="追加する水槽写真" className="max-h-80 w-full object-contain border border-slate-700 bg-black" />}
            </>
          )}

          {(type === 'additive' || type === 'photo') && (
            <label className="block">
              <span className="text-sm font-bold text-slate-200">メモ</span>
              <textarea rows={3} value={form.note} onChange={event => setField(setForm, 'note', event.target.value)} className="mt-1 w-full border border-slate-600 bg-slate-950 p-4 text-base text-white" />
            </label>
          )}

          {error && <p className="border border-rose-700 bg-rose-950 p-4 text-sm text-rose-100">{error}</p>}
          <button type="submit" disabled={saving} className="min-h-16 w-full bg-cyan-400 px-5 py-3 text-xl font-bold text-slate-950 disabled:bg-slate-700">
            {saving ? '保存中...' : '記録する'}
          </button>
          <Link href="/lite" className="flex min-h-12 items-center justify-center text-sm font-bold text-slate-400 underline underline-offset-4">今回は記録せず戻る</Link>
        </form>
      </section>
    </Shell>
  )
}

function setField(setForm, key, value) {
  setForm(current => ({ ...current, [key]: value }))
}

function nullableNumber(value) {
  if (value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function NumberField({ label, unit, value, onChange, required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <div className="mt-1 flex items-center border border-slate-600 bg-slate-950">
        <input type="number" inputMode="decimal" min="0" step="0.1" required={required} value={value} onChange={event => onChange(event.target.value)} className="min-h-14 min-w-0 flex-1 bg-transparent px-4 text-2xl font-bold text-white outline-none" />
        <span className="shrink-0 pr-4 text-sm font-bold text-slate-400">{unit}</span>
      </div>
    </label>
  )
}

function TextField({ label, value, onChange, placeholder, required = false }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-200">{label}</span>
      <input type="text" required={required} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} className="mt-1 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-lg text-white" />
    </label>
  )
}

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const image = new Image()
      image.onerror = reject
      image.onload = () => {
        const maxSize = 1280
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.78))
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  )
}
