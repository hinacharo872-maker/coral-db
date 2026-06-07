'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import {
  LITE_PARAMETER_LABELS,
  LITE_TARGETS,
  findMissingKeys,
  judgeAll,
} from '@/lib/liteTargets'

const PARAMETERS = [
  { key: 'kh_dkh', unit: 'dKH' },
  { key: 'temperature_c', unit: '℃' },
  { key: 'salinity_sg', unit: 'SG' },
  { key: 'no3_ppm', unit: 'ppm' },
  { key: 'po4_ppm', unit: 'ppm' },
]

const SEVERITY_STYLE = {
  green: 'border-emerald-500 bg-emerald-950 text-emerald-100',
  yellow: 'border-amber-400 bg-amber-950 text-amber-100',
  red: 'border-rose-500 bg-rose-950 text-rose-100',
  unknown: 'border-slate-600 bg-slate-900 text-slate-300',
}

const SEVERITY_LABEL = {
  green: '緑',
  yellow: '黄',
  red: '赤',
  unknown: '未測定',
}

const FREQUENCY_LABELS = {
  daily: '毎日',
  every_2_days: '2日に1回',
  weekly: '週1回',
  as_needed: '必要なとき',
  unknown: '頻度未登録',
}

const MISSING_OPTIONS = [
  ['kh_dkh', 'KH'],
  ['temperature_c', '水温'],
  ['salinity_sg', '塩分'],
  ['no3_ppm', 'NO3'],
  ['po4_ppm', 'PO4'],
  ['tank_volume', '水量'],
  ['water_change_frequency', '水換え頻度'],
  ['water_change_volume', '換水量'],
  ['additives', '添加剤'],
  ['photo', '写真'],
  ['other', 'その他'],
]

function getVisitorKey() {
  const storageKey = 'lite_shop_visitor_key'
  try {
    let value = window.localStorage.getItem(storageKey)
    if (!value) {
      value = window.crypto.randomUUID()
      window.localStorage.setItem(storageKey, value)
    }
    return value
  } catch {
    return window.crypto.randomUUID()
  }
}

function formatValue(value, key) {
  if (value == null) return '未測定'
  if (key === 'salinity_sg') return Number(value).toFixed(4)
  if (key === 'po4_ppm') return Number(value).toFixed(3)
  return Number(value).toFixed(key === 'temperature_c' || key === 'kh_dkh' ? 1 : 0)
}

function elapsedDays(dateText) {
  if (!dateText) return null
  const measured = new Date(dateText)
  if (Number.isNaN(measured.getTime())) return null
  return Math.max(0, Math.floor((Date.now() - measured.getTime()) / 86400000))
}

function freshnessFor(dateText) {
  const days = elapsedDays(dateText)
  if (days == null) return { days: null, label: '測定日不明', tone: 'border-slate-600 bg-slate-800 text-slate-300' }
  if (days >= 14) return { days, label: `${days}日前`, tone: 'border-rose-500 bg-rose-950 text-rose-200' }
  if (days >= 7) return { days, label: `${days}日前`, tone: 'border-amber-400 bg-amber-950 text-amber-200' }
  return { days, label: days === 0 ? '今日' : `${days}日前`, tone: 'border-emerald-500 bg-emerald-950 text-emerald-200' }
}

function formatDate(dateText) {
  if (!dateText) return '未登録'
  return new Date(dateText).toLocaleDateString('ja-JP')
}

export default function SharedShopRecordPage() {
  const { token } = useParams()
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rating, setRating] = useState('')
  const [missingInfo, setMissingInfo] = useState('')
  const [missingKeys, setMissingKeys] = useState([])
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    async function loadRecord() {
      setLoading(true)
      const { data, error } = await supabase.rpc('get_lite_shared_record', {
        p_token: token,
        p_visitor_key: getVisitorKey(),
      })
      if (error) setError('水槽カルテを読み込めませんでした。')
      else setRecord(data)
      setLoading(false)
    }
    if (token) loadRecord()
  }, [token])

  const checks = useMemo(() => {
    const latestValues = Object.fromEntries(PARAMETERS.map(item => [
      item.key,
      record?.parameter_latest?.[item.key]?.value ?? null,
    ]))
    const missing = findMissingKeys(latestValues).map(key => `${LITE_PARAMETER_LABELS[key]}未測定`)
    const outside = judgeAll(latestValues)
      .filter(item => item.severity === 'yellow' || item.severity === 'red')
      .map(item => `${LITE_PARAMETER_LABELS[item.parameterKey]}${item.severity === 'red' ? 'が大きく範囲外' : 'を確認'}`)
    return [...missing, ...outside]
  }, [record])

  async function submitFeedback() {
    if (!rating || (rating === 'insufficient' && missingKeys.length === 0)) return
    if (rating === 'insufficient' && missingKeys.includes('other') && !missingInfo.trim()) return
    setSending(true)
    setError('')
    const { error } = await supabase.rpc('submit_shop_feedback', {
      p_token: token,
      p_rating: rating,
      p_missing_info: rating === 'insufficient' ? missingInfo : null,
      p_missing_keys: rating === 'insufficient' ? missingKeys : [],
    })
    if (error) setError('評価を保存できませんでした。')
    else setFeedbackSent(true)
    setSending(false)
  }

  if (loading) return <PageShell><p className="text-slate-300">水槽カルテを読み込んでいます...</p></PageShell>
  if (error && !record) return <PageShell><StateMessage title="読み込みエラー" body={error} /></PageShell>
  if (!record || record.status !== 'active') {
    const message = record?.status === 'revoked'
      ? 'この共有は停止されています。'
      : record?.status === 'expired'
        ? 'この共有リンクは期限切れです。'
        : '共有リンクが見つかりません。'
    return <PageShell><StateMessage title="カルテを表示できません" body={message} /></PageShell>
  }

  const photo = record.latest_photo?.photo_url || record.tank?.photo_url
  const latest = record.latest_measurement
  const latestValues = Object.fromEntries(PARAMETERS.map(item => [
    item.key,
    record.parameter_latest?.[item.key]?.value ?? null,
  ]))
  const judgedLatest = new Map(judgeAll(latestValues).map(item => [item.parameterKey, item.severity]))

  return (
    <PageShell>
      <section className="grid gap-5 border-b border-slate-700 pb-6 md:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm font-bold text-cyan-300">SHOP RECORD</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">{record.tank?.display_name || '名称未設定の水槽'}</h1>
          <p className="mt-3 text-2xl font-bold text-white">
            {record.tank?.tank_volume_liters != null ? `${record.tank.tank_volume_liters} L` : '水量未登録'}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            最終測定: {latest?.measured_at ? new Date(latest.measured_at).toLocaleString('ja-JP') : '未測定'}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <TankFact label="水換え頻度" value={record.tank?.water_change_frequency_days ? `${record.tank.water_change_frequency_days}日ごと` : '未登録'} />
            <TankFact label="1回の換水量" value={record.tank?.water_change_volume_liters ? `${record.tank.water_change_volume_liters} L` : '未登録'} />
            <TankFact label="最終換水日" value={formatDate(record.tank?.last_water_change_at)} />
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden border border-slate-700 bg-slate-900">
          {photo
            ? <img src={photo} alt="直近の水槽写真" className="h-full w-full object-cover" />
            : <div className="flex h-full items-center justify-center text-sm text-slate-500">写真未登録</div>}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-white">現在値</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PARAMETERS.map(parameter => {
            const parameterLatest = record.parameter_latest?.[parameter.key]
            const value = parameterLatest?.value
            const severity = judgedLatest.get(parameter.key) || 'unknown'
            const freshness = freshnessFor(parameterLatest?.measured_at)
            return (
              <article key={parameter.key} className={`min-h-36 border-2 p-3 ${SEVERITY_STYLE[severity]}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold">{LITE_PARAMETER_LABELS[parameter.key]}</p>
                  <span className="border border-current px-2 py-0.5 text-xs font-bold">{SEVERITY_LABEL[severity]}</span>
                </div>
                <p className="mt-3 text-2xl font-bold">{formatValue(value, parameter.key)}</p>
                {value != null && <p className="mt-1 text-xs opacity-80">{parameter.unit}</p>}
                <p className={`mt-3 inline-block border px-2 py-1 text-xs font-bold ${freshness.tone}`}>{freshness.label}</p>
                <p className="mt-1 text-[11px] opacity-70">{formatDate(parameterLatest?.measured_at)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-white">直近30日推移</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {PARAMETERS.map(parameter => (
            <LiteTrendChart key={parameter.key} parameter={parameter} measurements={record.measurements || []} />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-bold text-white">使用中添加剤</h2>
          <div className="mt-3 border border-slate-700">
            {record.additives?.length ? record.additives.map((additive, index) => (
              <div key={`${additive.brand}-${additive.product_name}-${index}`} className="border-b border-slate-800 p-4 last:border-b-0">
                <p className="font-bold text-white">{[additive.brand, additive.product_name].filter(Boolean).join(' ') || '名称未登録'}</p>
                <p className="mt-1 text-sm text-slate-300">{[additive.amount, FREQUENCY_LABELS[additive.frequency] || '頻度未登録'].filter(Boolean).join(' / ')}</p>
                {additive.note && <p className="mt-1 text-xs text-slate-400">{additive.note}</p>}
              </div>
            )) : <p className="p-4 text-sm text-slate-400">使用中の添加剤は登録されていません。</p>}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white">アプリの確認ポイント</h2>
          <div className="mt-3 border border-slate-700 bg-slate-900 p-4">
            {checks.length ? (
              <ul className="space-y-3">
                {checks.map(check => <li key={check} className="border-l-4 border-amber-400 pl-3 text-sm text-slate-100">{check}</li>)}
              </ul>
            ) : <p className="border-l-4 border-emerald-400 pl-3 text-sm text-slate-200">大きな確認ポイントはありません。</p>}
            <p className="mt-4 text-xs text-slate-500">この表示は診断ではありません。測定状況を短時間で確認するためのものです。</p>
          </div>
        </section>
      </div>

      <section className="mt-10 border-t border-slate-700 pt-7">
        <h2 className="text-xl font-bold text-white">この情報で判断できましたか？</h2>
        {feedbackSent ? (
          <p className="mt-4 border border-emerald-700 bg-emerald-950 p-4 text-emerald-100">ご協力ありがとうございました。</p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['sufficient', '十分'],
                ['mostly_sufficient', 'ほぼ十分'],
                ['insufficient', '不足'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`min-h-12 border px-2 py-3 text-sm font-bold ${rating === value ? 'border-cyan-300 bg-cyan-400 text-slate-950' : 'border-slate-600 bg-slate-900 text-white'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {rating === 'insufficient' && (
              <div className="mt-4 border border-slate-700 bg-slate-900 p-4">
                <p className="text-sm font-bold text-white">不足していた情報を選択してください（複数可）</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MISSING_OPTIONS.map(([key, label]) => (
                    <label key={key} className="flex min-h-11 items-center gap-2 border border-slate-700 px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={missingKeys.includes(key)}
                        onChange={() => setMissingKeys(current => current.includes(key)
                          ? current.filter(item => item !== key)
                          : [...current, key])}
                        className="h-5 w-5"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {missingKeys.includes('other') && (
                  <textarea
                    value={missingInfo}
                    onChange={event => setMissingInfo(event.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="その他に欲しかった情報"
                    className="mt-3 w-full border border-slate-600 bg-slate-950 p-3 text-white"
                  />
                )}
              </div>
            )}
            <button
              type="button"
              disabled={!rating || sending || (rating === 'insufficient' && (missingKeys.length === 0 || (missingKeys.includes('other') && !missingInfo.trim())))}
              onClick={submitFeedback}
              className="mt-3 min-h-12 w-full bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400 sm:w-auto"
            >
              {sending ? '送信中...' : '評価を送信'}
            </button>
            {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
          </>
        )}
      </section>
    </PageShell>
  )
}

function LiteTrendChart({ parameter, measurements }) {
  const target = LITE_TARGETS[parameter.key]
  const points = measurements
    .filter(item => item[parameter.key] != null && item[parameter.key] !== '')
    .map(item => ({ date: new Date(item.measured_at), value: Number(item[parameter.key]) }))
    .filter(item => !Number.isNaN(item.date.getTime()) && Number.isFinite(item.value))

  const width = 520
  const height = 190
  const pad = { top: 12, right: 16, bottom: 25, left: 42 }
  const range = target.yellow[1] - target.yellow[0] || 1
  const min = target.yellow[0] - range * 0.25
  const max = target.yellow[1] + range * 0.25
  const x = index => pad.left + (index / Math.max(points.length - 1, 1)) * (width - pad.left - pad.right)
  const y = value => pad.top + ((max - value) / (max - min)) * (height - pad.top - pad.bottom)
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(point.value)}`).join(' ')

  return (
    <article className="border border-slate-700 bg-slate-900 p-3">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-bold text-white">{LITE_PARAMETER_LABELS[parameter.key]}</h3>
        <span className="text-xs text-slate-400">{points.length}件 / {parameter.unit}</span>
      </div>
      {points.length === 0 ? (
        <div className="mt-3 flex h-44 items-center justify-center border border-slate-800 text-sm text-slate-500">30日以内の記録なし</div>
      ) : (
        <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full" role="img" aria-label={`${LITE_PARAMETER_LABELS[parameter.key]}の30日推移`}>
          <rect x={pad.left} y={pad.top} width={width - pad.left - pad.right} height={Math.max(0, y(target.yellow[1]) - pad.top)} fill="#4c0519" />
          <rect x={pad.left} y={y(target.yellow[1])} width={width - pad.left - pad.right} height={y(target.green[1]) - y(target.yellow[1])} fill="#451a03" />
          <rect x={pad.left} y={y(target.green[1])} width={width - pad.left - pad.right} height={y(target.green[0]) - y(target.green[1])} fill="#052e16" />
          <rect x={pad.left} y={y(target.green[0])} width={width - pad.left - pad.right} height={y(target.yellow[0]) - y(target.green[0])} fill="#451a03" />
          <rect x={pad.left} y={y(target.yellow[0])} width={width - pad.left - pad.right} height={height - pad.bottom - y(target.yellow[0])} fill="#4c0519" />
          <path d={path} fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          {points.map((point, index) => <circle key={`${point.date.toISOString()}-${index}`} cx={x(index)} cy={y(point.value)} r="4" fill="#22d3ee" />)}
          <text x="4" y={y(target.green[1]) + 4} fill="#94a3b8" fontSize="11">{target.green[1]}</text>
          <text x="4" y={y(target.green[0]) + 4} fill="#94a3b8" fontSize="11">{target.green[0]}</text>
          <text x={pad.left} y={height - 7} fill="#94a3b8" fontSize="10">{points[0].date.toLocaleDateString('ja-JP')}</text>
          <text x={width - pad.right} y={height - 7} textAnchor="end" fill="#94a3b8" fontSize="10">{points.at(-1).date.toLocaleDateString('ja-JP')}</text>
        </svg>
      )}
    </article>
  )
}

function StateMessage({ title, body }) {
  return (
    <section className="mx-auto max-w-lg border border-slate-700 bg-slate-900 p-6 text-center">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-slate-300">{body}</p>
    </section>
  )
}

function TankFact({ label, value }) {
  return (
    <div className="border border-slate-700 bg-slate-900 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
