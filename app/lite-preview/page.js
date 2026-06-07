'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import Header from '@/components/Header'
import { LITE_PARAMETER_LABELS, LITE_TARGETS, judgeAll } from '@/lib/liteTargets'
import { LITE_MEASUREMENT_STEPS, hasAnyLiteMeasurement } from '@/lib/liteMeasurement'

const SAMPLE_LATEST = {
  measured_at: '2026-06-06T10:30:00+09:00',
  temperature_c: 25.2,
  salinity_sg: 1.025,
  kh_dkh: 7.8,
  no3_ppm: 18,
  po4_ppm: 0.14,
}

const SAMPLE_MEASURED_AT = {
  kh_dkh: '2026-06-04T10:30:00+09:00',
  temperature_c: '2026-06-06T10:30:00+09:00',
  salinity_sg: '2026-06-05T10:30:00+09:00',
  no3_ppm: '2026-05-26T10:30:00+09:00',
  po4_ppm: '2026-05-22T10:30:00+09:00',
}

const REVIEW_NOW = new Date('2026-06-07T12:00:00+09:00')

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

const SEVERITY_LABEL = { green: '緑', yellow: '黄', red: '赤', unknown: '未測定' }

const MISSING_OPTIONS = [
  ['kh_dkh', 'KH（炭酸塩硬度）'],
  ['temperature_c', '水温'],
  ['salinity_sg', '塩分濃度'],
  ['no3_ppm', '硝酸塩（NO3）'],
  ['po4_ppm', 'リン酸塩（PO4）'],
  ['tank_volume', '水量'],
  ['water_change_frequency', '水換え頻度'],
  ['water_change_volume', '換水量'],
  ['additives', '添加剤'],
  ['photo', '写真'],
  ['other', 'その他'],
]

function makeMeasurements() {
  const values = [
    [8.1, 25.0, 1.025, 7, 0.06],
    [8.0, 25.2, 1.025, 8, 0.07],
    [7.9, 25.1, 1.025, 9, 0.08],
    [7.8, 25.3, 1.024, 11, 0.08],
    [7.7, 25.4, 1.025, 12, 0.09],
    [7.6, 25.2, 1.025, 14, 0.11],
    [7.8, 25.2, 1.025, 16, 0.13],
    [7.8, 25.2, 1.025, 18, 0.14],
  ]
  return values.map((row, index) => ({
    measured_at: new Date(Date.UTC(2026, 4, 9 + index * 4)).toISOString(),
    kh_dkh: row[0],
    temperature_c: row[1],
    salinity_sg: row[2],
    no3_ppm: row[3],
    po4_ppm: row[4],
  }))
}

function formatValue(value, key) {
  if (key === 'salinity_sg') return value.toFixed(4)
  if (key === 'po4_ppm') return value.toFixed(3)
  return value.toFixed(key === 'temperature_c' || key === 'kh_dkh' ? 1 : 0)
}

function previewFreshness(dateText) {
  const days = Math.max(0, Math.floor((REVIEW_NOW - new Date(dateText)) / 86400000))
  if (days >= 14) return { label: `${days}日前`, tone: 'border-rose-500 bg-rose-950 text-rose-200' }
  if (days >= 7) return { label: `${days}日前`, tone: 'border-amber-400 bg-amber-950 text-amber-200' }
  return { label: days === 0 ? '今日' : `${days}日前`, tone: 'border-emerald-500 bg-emerald-950 text-emerald-200' }
}

export default function LitePreviewPage() {
  const [mode, setMode] = useState('shop')
  const [rating, setRating] = useState('')
  const [missingKeys, setMissingKeys] = useState([])
  const [stopped, setStopped] = useState(false)
  const measurements = useMemo(makeMeasurements, [])
  const judged = useMemo(
    () => new Map(judgeAll(SAMPLE_LATEST).map(item => [item.parameterKey, item.severity])),
    [],
  )
  const previewUrl = 'https://coral-db.vercel.app/lite-preview'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <div className="border-b border-cyan-900 bg-cyan-950/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-cyan-200">レビュー用サンプル</p>
            <p className="mt-1 text-xs text-slate-300">表示データ・写真・操作結果はすべて架空です。</p>
          </div>
          <div className="grid grid-cols-2 border border-cyan-700 sm:grid-cols-4">
            <ModeButton active={mode === 'owner'} onClick={() => setMode('owner')}>ユーザー側</ModeButton>
            <ModeButton active={mode === 'shop'} onClick={() => setMode('shop')}>ショップ側</ModeButton>
            <ModeButton active={mode === 'measure'} onClick={() => setMode('measure')}>測定入力</ModeButton>
            <ModeButton active={mode === 'analysis'} onClick={() => setMode('analysis')}>分析側</ModeButton>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {mode === 'owner' ? (
          <OwnerPreview stopped={stopped} setStopped={setStopped} previewUrl={previewUrl} />
        ) : mode === 'measure' ? (
          <MeasurePreview />
        ) : mode === 'analysis' ? (
          <AnalysisPreview />
        ) : (
          <ShopPreview
            measurements={measurements}
            judged={judged}
            rating={rating}
            setRating={setRating}
            missingKeys={missingKeys}
            setMissingKeys={setMissingKeys}
          />
        )}

        <section className="mt-8 border-t border-slate-800 pt-5 text-sm text-slate-400">
          <p>確認後の実運用では、共有リンクを発行した本人だけが停止でき、ショップはログインせずカルテを閲覧できます。</p>
          <Link href="/share/create" className="mt-3 inline-block font-bold text-cyan-300 underline underline-offset-4">
            実際の共有管理画面へ
          </Link>
        </section>
      </main>
    </div>
  )
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 px-4 py-2 text-sm font-bold ${active ? 'bg-cyan-400 text-slate-950' : 'bg-slate-950 text-cyan-100'}`}
    >
      {children}
    </button>
  )
}

function OwnerPreview({ stopped, setStopped, previewUrl }) {
  return (
    <section>
      <p className="text-sm font-bold text-cyan-300">USER SHARE VIEW</p>
      <h1 className="mt-1 text-3xl font-bold text-white">ショップ共有</h1>
      <p className="mt-2 text-sm text-slate-300">URLまたはQRコードを店員へ見せます。</p>

      <article className="mt-6 max-w-2xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">リビング SPS Reef</h2>
            <p className="mt-1 text-xs text-slate-400">期限: 2026年6月14日 23:59</p>
          </div>
          <span className={`px-3 py-1 text-xs font-bold ${stopped ? 'bg-slate-700 text-slate-200' : 'bg-emerald-400 text-slate-950'}`}>
            {stopped ? '停止済み' : '有効'}
          </span>
        </div>

        {!stopped ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-[164px_1fr]">
            <div className="w-fit bg-white p-2">
              <QRCodeSVG value={previewUrl} size={148} level="M" marginSize={1} title="レビュー用QRコード" />
            </div>
            <div className="min-w-0">
              <p className="break-all border border-slate-700 bg-slate-950 p-3 text-xs text-cyan-200">{previewUrl}</p>
              <button type="button" className="mt-3 min-h-12 w-full bg-cyan-400 px-4 py-3 font-bold text-slate-950">URLを共有</button>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button type="button" className="min-h-11 border border-cyan-600 px-3 py-2 text-sm font-bold text-cyan-100">URLをコピー</button>
                <button type="button" onClick={() => setStopped(true)} className="min-h-11 border border-rose-700 px-3 py-2 text-sm font-bold text-rose-200">共有を停止</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
            このリンクではカルテを表示できません。
            <button type="button" onClick={() => setStopped(false)} className="ml-2 font-bold text-cyan-300 underline">レビュー状態を戻す</button>
          </div>
        )}
      </article>
    </section>
  )
}

function ShopPreview({ measurements, judged, rating, setRating, missingKeys, setMissingKeys }) {
  return (
    <>
      <section className="grid gap-5 border-b border-slate-700 pb-6 md:grid-cols-[1fr_360px]">
        <div>
          <p className="text-sm font-bold text-cyan-300">SHOP RECORD</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">リビング SPS Reef</h1>
          <p className="mt-3 text-2xl font-bold text-white">180 L</p>
          <p className="mt-2 text-sm text-slate-400">最終測定: 2026年6月6日 10:30</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <PreviewFact label="水換え頻度" value="14日ごと" />
            <PreviewFact label="1回の換水量" value="30 L" />
            <PreviewFact label="最終換水日" value="2026/6/2" />
          </div>
        </div>
        <div className="aspect-[4/3] overflow-hidden border border-slate-700 bg-slate-900">
          <img src="/lite-review-tank.webp" alt="レビュー用の架空のリーフ水槽" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-white">現在値</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PARAMETERS.map(parameter => {
            const severity = judged.get(parameter.key)
            const freshness = previewFreshness(SAMPLE_MEASURED_AT[parameter.key])
            return (
            <article key={parameter.key} className={`min-h-36 border-2 p-3 ${SEVERITY_STYLE[severity]}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{LITE_PARAMETER_LABELS[parameter.key]}</p>
                <span className="border border-current px-2 py-0.5 text-xs font-bold">{SEVERITY_LABEL[severity]}</span>
              </div>
              <p className="mt-3 text-2xl font-bold">{formatValue(SAMPLE_LATEST[parameter.key], parameter.key)}</p>
              <p className="mt-1 text-xs opacity-80">{parameter.unit}</p>
              <p className={`mt-3 inline-block border px-2 py-1 text-xs font-bold ${freshness.tone}`}>{freshness.label}</p>
              <p className="mt-1 text-[11px] opacity-70">{new Date(SAMPLE_MEASURED_AT[parameter.key]).toLocaleDateString('ja-JP')}</p>
            </article>
            )
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-white">直近30日推移</h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {PARAMETERS.map(parameter => (
            <PreviewChart key={parameter.key} parameter={parameter} measurements={measurements} />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-lg font-bold text-white">使用中添加剤</h2>
          <div className="mt-3 divide-y divide-slate-800 border border-slate-700">
            <Additive name="Red Sea Reef Foundation B" detail="毎日 6 ml" />
            <Additive name="Fauna Marin Ultra Min S" detail="週3回 2 ml" />
          </div>
        </section>
        <section>
          <h2 className="text-lg font-bold text-white">アプリの確認ポイント</h2>
          <div className="mt-3 space-y-3 border border-slate-700 bg-slate-900 p-4">
            <p className="border-l-4 border-amber-400 pl-3 text-sm">PO4を確認</p>
            <p className="border-l-4 border-amber-400 pl-3 text-sm">NO3が上昇傾向</p>
            <p className="text-xs text-slate-500">診断ではなく、店員が確認する入口だけを表示します。</p>
          </div>
        </section>
      </div>

      <section className="mt-10 border-t border-slate-700 pt-7">
        <h2 className="text-xl font-bold text-white">この情報で判断できましたか？</h2>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[['sufficient', '十分'], ['mostly', 'ほぼ十分'], ['insufficient', '不足']].map(([value, label]) => (
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
              <textarea rows={3} placeholder="その他に欲しかった情報" className="mt-3 w-full border border-slate-600 bg-slate-950 p-3 text-white" />
            )}
          </div>
        )}
        {rating && <p className="mt-3 text-sm text-cyan-200">レビュー用のため、回答は保存されません。</p>}
      </section>
    </>
  )
}

function Additive({ name, detail }) {
  return (
    <div className="p-4">
      <p className="font-bold text-white">{name}</p>
      <p className="mt-1 text-sm text-slate-300">{detail}</p>
    </div>
  )
}

function MeasurePreview() {
  const [stepIndex, setStepIndex] = useState(0)
  const [values, setValues] = useState({})
  const [done, setDone] = useState(false)
  const previous = { kh_dkh: 8.0, temperature_c: 25.1, salinity_sg: 1.025, no3_ppm: 14, po4_ppm: 0.09 }
  const current = LITE_MEASUREMENT_STEPS[stepIndex]
  const review = stepIndex === LITE_MEASUREMENT_STEPS.length

  if (done) {
    return (
      <section className="mx-auto max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-3xl font-bold text-slate-950">✓</div>
        <h1 className="mt-5 text-3xl font-bold text-white">記録できました</h1>
        <p className="mt-3 text-slate-300">レビュー用のため、実際のデータは保存されません。</p>
        <button type="button" onClick={() => { setDone(false); setStepIndex(0); setValues({}) }} className="mt-6 min-h-12 bg-cyan-400 px-5 py-3 font-bold text-slate-950">もう一度試す</button>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl">
      <p className="text-sm font-bold text-cyan-300">MEASUREMENT PREVIEW</p>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">リビング SPS Reef</h1>
        <span className="text-sm font-bold">{Math.min(stepIndex + 1, 6)} / 6</span>
      </div>
      <div className="mt-3 grid grid-cols-6 gap-1">
        {Array.from({ length: 6 }, (_, index) => <div key={index} className={`h-2 ${index <= stepIndex ? 'bg-cyan-400' : 'bg-slate-800'}`} />)}
      </div>

      {!review ? (
        <div className="mt-8">
          <p className="text-center text-sm font-bold text-cyan-300">今回測った値</p>
          <h2 className="mt-2 text-center text-4xl font-bold text-white">{current.label}</h2>
          <div className="mt-8 flex items-end gap-3">
            <input
              type="number"
              inputMode="decimal"
              step={current.step}
              value={values[current.key] ?? ''}
              onChange={event => setValues(state => ({ ...state, [current.key]: event.target.value }))}
              placeholder={current.placeholder}
              className="min-w-0 flex-1 border-2 border-cyan-700 bg-slate-950 px-4 py-5 text-center text-5xl font-bold text-white"
            />
            <span className="pb-5 text-lg font-bold text-slate-300">{current.unit}</span>
          </div>
          <div className="mt-5 border border-slate-700 bg-slate-900 p-4">
            <p className="text-xs text-slate-400">前回の値</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-2xl font-bold">{previous[current.key]} {current.unit}</p>
              <button type="button" onClick={() => setValues(state => ({ ...state, [current.key]: String(previous[current.key]) }))} className="min-h-11 border border-cyan-600 px-3 py-2 text-sm font-bold text-cyan-100">前回値をコピー</button>
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => { setValues(state => ({ ...state, [current.key]: '' })); setStepIndex(index => index + 1) }} className="min-h-14 border border-slate-600 px-3 py-3 font-bold">今回は測らない</button>
            <button type="button" onClick={() => setStepIndex(index => index + 1)} className="min-h-14 bg-cyan-400 px-3 py-3 text-lg font-bold text-slate-950">次へ</button>
          </div>
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="text-center text-3xl font-bold text-white">この内容で記録します</h2>
          <div className="mt-6 divide-y divide-slate-800 border border-slate-700 bg-slate-900">
            {LITE_MEASUREMENT_STEPS.map(step => (
              <div key={step.key} className="flex items-center justify-between p-4">
                <strong>{step.label}</strong>
                <span className={values[step.key] ? 'font-bold text-cyan-200' : 'text-sm text-slate-500'}>
                  {values[step.key] ? `${values[step.key]} ${step.unit}` : '今回は測らない'}
                </span>
              </div>
            ))}
          </div>
          {!hasAnyLiteMeasurement(values) && <p className="mt-4 border border-amber-700 bg-amber-950 p-4 text-sm text-amber-100">保存するには、測れた項目を1つだけ入力してください。</p>}
          <button type="button" disabled={!hasAnyLiteMeasurement(values)} onClick={() => setDone(true)} className="mt-6 min-h-16 w-full bg-cyan-400 text-xl font-bold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400">記録を保存</button>
        </div>
      )}

      {stepIndex > 0 && !done && (
        <button type="button" onClick={() => setStepIndex(index => index - 1)} className="mt-4 min-h-11 w-full text-sm font-bold text-slate-400 underline">ひとつ前へ戻る</button>
      )}
    </section>
  )
}

function AnalysisPreview() {
  const ranking = [
    ['water_change_frequency', '水換え頻度', 8],
    ['po4_ppm', 'PO4', 6],
    ['photo', '写真', 5],
    ['water_change_volume', '換水量', 4],
    ['no3_ppm', 'NO3', 3],
  ]

  return (
    <section>
      <p className="text-sm font-bold text-cyan-300">LITE EXPERIMENT</p>
      <h1 className="mt-1 text-3xl font-bold text-white">実証実験レポート</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <PreviewMetric label="共有回数" value="32" />
        <PreviewMetric label="現在有効" value="11" />
        <PreviewMetric label="閲覧回数" value="47" />
        <PreviewMetric label="ショップ評価" value="19" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-bold text-white">ショップ評価</h2>
          {[['十分', 7], ['ほぼ十分', 8], ['不足', 4]].map(([label, count]) => (
            <div key={label} className="mt-3 flex items-center justify-between border-b border-slate-800 pb-3">
              <span>{label}</span><strong className="text-2xl">{count}</strong>
            </div>
          ))}
        </article>
        <article className="border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-lg font-bold text-white">不足項目ランキング</h2>
          <ol className="mt-4 space-y-3">
            {ranking.map(([key, label, count], index) => (
              <li key={key} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-b border-slate-800 pb-3">
                <span className="font-bold text-cyan-300">{index + 1}</span>
                <span>{label}</span>
                <strong className="text-xl">{count}</strong>
              </li>
            ))}
          </ol>
        </article>
      </div>
      <p className="mt-4 text-xs text-slate-500">レビュー用の架空集計です。本番ではショップ回答から自動集計します。</p>
    </section>
  )
}

function PreviewMetric({ label, value }) {
  return (
    <div className="border border-slate-700 bg-slate-900 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function PreviewFact({ label, value }) {
  return (
    <div className="border border-slate-700 bg-slate-900 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function PreviewChart({ parameter, measurements }) {
  const target = LITE_TARGETS[parameter.key]
  const points = measurements.map(item => Number(item[parameter.key]))
  const width = 520
  const height = 180
  const pad = { top: 10, right: 15, bottom: 22, left: 42 }
  const range = target.yellow[1] - target.yellow[0] || 1
  const min = target.yellow[0] - range * 0.25
  const max = target.yellow[1] + range * 0.25
  const x = index => pad.left + (index / Math.max(points.length - 1, 1)) * (width - pad.left - pad.right)
  const y = value => pad.top + ((max - value) / (max - min)) * (height - pad.top - pad.bottom)
  const path = points.map((value, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(value)}`).join(' ')

  return (
    <article className="border border-slate-700 bg-slate-900 p-3">
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold text-white">{LITE_PARAMETER_LABELS[parameter.key]}</h3>
        <span className="text-xs text-slate-400">{parameter.unit}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full" role="img" aria-label={`${LITE_PARAMETER_LABELS[parameter.key]}のサンプル推移`}>
        <rect x={pad.left} y={pad.top} width={width - pad.left - pad.right} height={Math.max(0, y(target.yellow[1]) - pad.top)} fill="#4c0519" />
        <rect x={pad.left} y={y(target.yellow[1])} width={width - pad.left - pad.right} height={y(target.green[1]) - y(target.yellow[1])} fill="#451a03" />
        <rect x={pad.left} y={y(target.green[1])} width={width - pad.left - pad.right} height={y(target.green[0]) - y(target.green[1])} fill="#052e16" />
        <rect x={pad.left} y={y(target.green[0])} width={width - pad.left - pad.right} height={y(target.yellow[0]) - y(target.green[0])} fill="#451a03" />
        <rect x={pad.left} y={y(target.yellow[0])} width={width - pad.left - pad.right} height={height - pad.bottom - y(target.yellow[0])} fill="#4c0519" />
        <path d={path} fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((value, index) => <circle key={`${parameter.key}-${index}`} cx={x(index)} cy={y(value)} r="4" fill="#22d3ee" />)}
        <text x="3" y={y(target.green[1]) + 4} fill="#94a3b8" fontSize="11">{target.green[1]}</text>
        <text x="3" y={y(target.green[0]) + 4} fill="#94a3b8" fontSize="11">{target.green[0]}</text>
        <text x={pad.left} y={height - 5} fill="#94a3b8" fontSize="10">5/9</text>
        <text x={width - pad.right} y={height - 5} textAnchor="end" fill="#94a3b8" fontSize="10">6/6</text>
      </svg>
    </article>
  )
}
