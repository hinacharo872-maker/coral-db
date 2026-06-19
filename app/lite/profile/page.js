'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import LiteBetaBanner from '@/components/LiteBetaBanner'
import LiteTankEnvironmentDiagram from '@/components/LiteTankEnvironmentDiagram'
import { supabase } from '@/lib/supabase'
import {
  FILTRATION_OPTIONS,
  hasLiteEnvironment,
  LIGHTING_OPTIONS,
  normalizeEquipment,
  SALT_MIX_OPTIONS,
  WAVE_PUMP_OPTIONS,
} from '@/lib/liteEnvironment'

const OTHER = '__other__'

export default function LiteProfilePage() {
  return (
    <Suspense fallback={<Shell><p className="text-slate-300">飼育環境を準備しています...</p></Shell>}>
      <LiteEnvironmentForm />
    </Suspense>
  )
}

function LiteEnvironmentForm() {
  const searchParams = useSearchParams()
  const requestedTankId = searchParams.get('tank')
  const [session, setSession] = useState(null)
  const [tank, setTank] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    tankWidth: '',
    tankDepth: '',
    tankHeight: '',
    tankVolume: '',
    ph: '',
    saltMix: '',
    saltMixOther: '',
    filtration: '',
    filtrationOther: '',
    lights: [],
    wavePumps: [],
  })

  useEffect(() => {
    async function load() {
      const { data: authData } = await supabase.auth.getSession()
      setSession(authData.session)
      if (!authData.session) {
        setLoading(false)
        return
      }

      let query = supabase
        .from('lite_tank_profiles')
        .select('id, display_name, tank_width_cm, tank_depth_cm, tank_height_cm, tank_volume_liters, ph, salt_mix_name, lighting_equipment, wave_pumps, filtration_method')
      query = requestedTankId ? query.eq('id', requestedTankId) : query.order('created_at').limit(1)
      const result = await query.maybeSingle()
      if (result.error || !result.data) {
        setError('水槽プロフィールを読み込めませんでした。')
      } else {
        const data = result.data
        setTank(data)
        setForm({
          tankWidth: data.tank_width_cm ?? '',
          tankDepth: data.tank_depth_cm ?? '',
          tankHeight: data.tank_height_cm ?? '',
          tankVolume: data.tank_volume_liters ?? '',
          ph: data.ph ?? '',
          saltMix: SALT_MIX_OPTIONS.includes(data.salt_mix_name) ? data.salt_mix_name : data.salt_mix_name ? OTHER : '',
          saltMixOther: SALT_MIX_OPTIONS.includes(data.salt_mix_name) ? '' : data.salt_mix_name || '',
          filtration: FILTRATION_OPTIONS.includes(data.filtration_method) ? data.filtration_method : data.filtration_method ? OTHER : '',
          filtrationOther: FILTRATION_OPTIONS.includes(data.filtration_method) ? '' : data.filtration_method || '',
          lights: normalizeEquipment(data.lighting_equipment),
          wavePumps: normalizeEquipment(data.wave_pumps),
        })
      }
      setLoading(false)
    }
    load()
  }, [requestedTankId])

  async function save(event) {
    event.preventDefault()
    if (!session?.user?.id || !tank?.id) return
    setSaving(true)
    setError('')
    const ph = form.ph === '' ? null : Number(form.ph)
    if (ph != null && (!Number.isFinite(ph) || ph < 0 || ph > 14)) {
      setError('pHは0から14の範囲で入力してください。')
      setSaving(false)
      return
    }

    const tankWidth = optionalPositiveNumber(form.tankWidth)
    const tankDepth = optionalPositiveNumber(form.tankDepth)
    const tankHeight = optionalPositiveNumber(form.tankHeight)
    const tankVolume = optionalPositiveNumber(form.tankVolume)
    if ([tankWidth, tankDepth, tankHeight, tankVolume].some(value => Number.isNaN(value))) {
      setError('水槽サイズと実水量は、0より大きい数値で入力してください。')
      setSaving(false)
      return
    }

    const payload = {
      tank_width_cm: tankWidth,
      tank_depth_cm: tankDepth,
      tank_height_cm: tankHeight,
      tank_volume_liters: tankVolume,
      ph,
      salt_mix_name: selectedText(form.saltMix, form.saltMixOther),
      filtration_method: selectedText(form.filtration, form.filtrationOther),
      lighting_equipment: form.lights.length ? normalizeEquipment(form.lights) : null,
      wave_pumps: form.wavePumps.length ? normalizeEquipment(form.wavePumps) : null,
    }
    const { error: saveError } = await supabase
      .from('lite_tank_profiles')
      .update(payload)
      .eq('id', tank.id)
      .eq('user_id', session.user.id)
    if (saveError) setError('飼育環境を保存できませんでした。もう一度お試しください。')
    else {
      setTank(current => ({ ...current, ...payload }))
      setSaved(true)
    }
    setSaving(false)
  }

  if (loading) return <Shell><p className="text-slate-300">水槽プロフィールを読み込んでいます...</p></Shell>
  if (error && session && !tank) {
    return (
      <Shell>
        <section className="mx-auto max-w-xl border border-rose-700 bg-rose-950/40 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">飼育環境を読み込めませんでした</h1>
          <p className="mt-3 text-rose-100">{error}</p>
          <Link href="/lite" className="mt-5 flex min-h-14 items-center justify-center border border-slate-600 px-5 font-bold text-white">Liteホームへ</Link>
        </section>
      </Shell>
    )
  }
  if (!session || !tank) {
    return (
      <Shell>
        <section className="mx-auto max-w-xl border border-slate-700 bg-slate-900 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Liteホームから水槽を選んでください</h1>
          <Link href="/lite" className="mt-5 flex min-h-14 items-center justify-center bg-cyan-400 px-5 font-bold text-slate-950">Liteホームへ</Link>
        </section>
      </Shell>
    )
  }

  const previewPh = form.ph === '' || !Number.isFinite(Number(form.ph)) ? null : Number(form.ph)
  const previewTank = {
    ...tank,
    tank_width_cm: optionalPositiveNumber(form.tankWidth),
    tank_depth_cm: optionalPositiveNumber(form.tankDepth),
    tank_height_cm: optionalPositiveNumber(form.tankHeight),
    tank_volume_liters: optionalPositiveNumber(form.tankVolume),
    ph: previewPh,
    salt_mix_name: selectedText(form.saltMix, form.saltMixOther),
    filtration_method: selectedText(form.filtration, form.filtrationOther),
    lighting_equipment: normalizeEquipment(form.lights),
    wave_pumps: normalizeEquipment(form.wavePumps),
  }

  if (saved) {
    return (
      <Shell>
        <section className="mx-auto max-w-3xl border border-emerald-700 bg-emerald-950/40 p-4 text-center sm:p-6">
          <h1 className="text-2xl font-bold text-white">飼育環境を保存しました</h1>
          <p className="mt-2 text-slate-300">入力した情報だけがショップカルテに表示されます。</p>
          {hasLiteEnvironment(tank) && (
            <div className="mt-5 text-left">
              <LiteTankEnvironmentDiagram tank={tank} />
            </div>
          )}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href={`/lite/shop-card?tank=${tank.id}`} className="flex min-h-14 items-center justify-center bg-emerald-400 px-5 font-bold text-slate-950">ショップカルテを見る</Link>
            <button type="button" onClick={() => setSaved(false)} className="min-h-14 border border-slate-600 px-5 font-bold text-white">内容を編集</button>
          </div>
        </section>
      </Shell>
    )
  }

  return (
    <Shell>
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-bold text-cyan-300">{tank.display_name || 'わたしの水槽'}</p>
        <h1 className="mt-1 text-3xl font-bold text-white">飼育環境</h1>
        <p className="mt-3 leading-7 text-slate-300">分かる項目だけで大丈夫です。すべて空欄でも保存できます。</p>

        <section className="mt-6 border border-slate-700 bg-slate-900 p-3 sm:p-5">
          <h2 className="text-xl font-bold text-white">水槽図プレビュー</h2>
          {hasLiteEnvironment(previewTank) ? (
            <div className="mt-3">
              <LiteTankEnvironmentDiagram tank={previewTank} />
            </div>
          ) : (
            <p className="mt-3 border border-dashed border-slate-600 p-5 text-base leading-7 text-slate-300">
              下の項目を入力すると、ショップに見せる水槽図がここに表示されます。
            </p>
          )}
        </section>

        <form onSubmit={save} className="mt-6 space-y-6">
          <section className="border border-slate-700 bg-slate-900 p-4 sm:p-5">
            <h2 className="text-lg font-bold text-white">水槽の基本情報</h2>
            <div className="mt-4">
              <p className="text-base font-bold text-white">水槽サイズ（任意）</p>
              <p className="mt-1 text-sm text-slate-400">分かる寸法だけでも保存できます。</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <NumberField label="幅" unit="cm" value={form.tankWidth} onChange={value => setForm(current => ({ ...current, tankWidth: value }))} placeholder="120" />
                <NumberField label="奥行" unit="cm" value={form.tankDepth} onChange={value => setForm(current => ({ ...current, tankDepth: value }))} placeholder="55" />
                <NumberField label="高さ" unit="cm" value={form.tankHeight} onChange={value => setForm(current => ({ ...current, tankHeight: value }))} placeholder="55" />
              </div>
            </div>
            <div className="mt-5 max-w-sm">
              <NumberField label="実水量" unit="L" value={form.tankVolume} onChange={value => setForm(current => ({ ...current, tankVolume: value }))} placeholder="350" />
              <p className="mt-1 text-xs leading-5 text-slate-400">底砂や岩を入れた、おおよその水量で大丈夫です。</p>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="text-sm font-bold text-slate-200">pH（任意）</span>
                <input type="number" inputMode="decimal" min="0" max="14" step="0.01" value={form.ph} onChange={event => setForm(current => ({ ...current, ph: event.target.value }))} placeholder="8.2" className="mt-1 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-2xl font-bold text-white" />
              </label>
              <SelectWithOther
                label="人工海水"
                value={form.saltMix}
                otherValue={form.saltMixOther}
                options={SALT_MIX_OPTIONS}
                onChange={value => setForm(current => ({ ...current, saltMix: value }))}
                onOtherChange={value => setForm(current => ({ ...current, saltMixOther: value }))}
                placeholder="使っている人工海水"
              />
              <SelectWithOther
                label="濾過方式"
                value={form.filtration}
                otherValue={form.filtrationOther}
                options={FILTRATION_OPTIONS}
                onChange={value => setForm(current => ({ ...current, filtration: value }))}
                onOtherChange={value => setForm(current => ({ ...current, filtrationOther: value }))}
                placeholder="濾過方式"
              />
            </div>
          </section>

          <EquipmentEditor
            title="照明"
            help="複数ある場合は1種類ずつ追加してください。"
            options={LIGHTING_OPTIONS}
            items={form.lights}
            onChange={lights => setForm(current => ({ ...current, lights }))}
          />
          <EquipmentEditor
            title="ウェーブポンプ"
            help="分かる範囲で製品名と台数を追加してください。"
            options={WAVE_PUMP_OPTIONS}
            items={form.wavePumps}
            onChange={wavePumps => setForm(current => ({ ...current, wavePumps }))}
          />

          {error && <p className="border border-rose-700 bg-rose-950 p-4 text-rose-100">{error}</p>}
          <div className="sticky bottom-0 grid gap-2 border-t border-slate-700 bg-slate-950/95 py-3 backdrop-blur sm:grid-cols-[1fr_2fr]">
            <Link href="/lite" className="flex min-h-14 items-center justify-center border border-slate-600 px-4 font-bold text-slate-300">今回は入力せず戻る</Link>
            <button disabled={saving} className="min-h-14 bg-cyan-400 px-5 text-lg font-bold text-slate-950 disabled:bg-slate-700">{saving ? '保存しています...' : '飼育環境を保存'}</button>
          </div>
        </form>
      </section>
    </Shell>
  )
}

function SelectWithOther({ label, value, otherValue, options, onChange, onOtherChange, placeholder }) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-200">{label}（任意）</span>
      <select value={value} onChange={event => onChange(event.target.value)} className="mt-1 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-white">
        <option value="">今回は入力しない</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
        <option value={OTHER}>その他</option>
      </select>
      {value === OTHER && <input value={otherValue} onChange={event => onOtherChange(event.target.value)} placeholder={placeholder} className="mt-2 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-white" />}
    </label>
  )
}

function NumberField({ label, unit, value, onChange, placeholder }) {
  return (
    <label>
      <span className="text-sm font-bold text-slate-200">{label} {unit}</span>
      <input
        type="number"
        inputMode="decimal"
        min="0.01"
        step="0.01"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-xl font-bold text-white"
      />
    </label>
  )
}

function EquipmentEditor({ title, help, options, items, onChange }) {
  const [selection, setSelection] = useState('')
  const [other, setOther] = useState('')
  const [quantity, setQuantity] = useState('1')

  function add() {
    const name = selection === OTHER ? other.trim() : selection
    if (!name) return
    onChange(normalizeEquipment([...items, { name, quantity }]))
    setSelection('')
    setOther('')
    setQuantity('1')
  }

  return (
    <section className="border border-slate-700 bg-slate-900 p-4 sm:p-5">
      <h2 className="text-lg font-bold text-white">{title}（任意）</h2>
      <p className="mt-1 text-sm text-slate-400">{help}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_96px_auto]">
        <select value={selection} onChange={event => setSelection(event.target.value)} className="min-h-14 min-w-0 border border-slate-600 bg-slate-950 px-4 text-white">
          <option value="">製品を選ぶ</option>
          {options.map(option => <option key={option} value={option}>{option}</option>)}
          <option value={OTHER}>その他・自由入力</option>
        </select>
        <label className="flex min-h-14 items-center border border-slate-600 bg-slate-950">
          <input type="number" min="1" max="99" inputMode="numeric" value={quantity} onChange={event => setQuantity(event.target.value)} aria-label={`${title}の台数`} className="min-w-0 flex-1 bg-transparent px-3 text-center text-xl font-bold text-white" />
          <span className="pr-3 text-sm text-slate-400">台</span>
        </label>
        <button type="button" onClick={add} disabled={!selection || (selection === OTHER && !other.trim())} className="min-h-14 bg-cyan-400 px-5 font-bold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">追加</button>
      </div>
      {selection === OTHER && <input value={other} onChange={event => setOther(event.target.value)} placeholder={`${title}の製品名`} className="mt-2 min-h-14 w-full border border-slate-600 bg-slate-950 px-4 text-white" />}
      {items.length > 0 && (
        <div className="mt-4 divide-y divide-slate-800 border border-slate-700">
          {items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
              <span className="font-bold text-white">{item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
              <button type="button" onClick={() => onChange(items.filter((_entry, itemIndex) => itemIndex !== index))} className="min-h-11 px-3 text-sm font-bold text-rose-300 underline">削除</button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function selectedText(value, otherValue) {
  if (!value) return null
  const text = value === OTHER ? otherValue : value
  return String(text || '').trim().slice(0, 160) || null
}

function optionalPositiveNumber(value) {
  if (value === '' || value == null) return null
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : Number.NaN
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <LiteBetaBanner />
      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">{children}</main>
    </div>
  )
}
