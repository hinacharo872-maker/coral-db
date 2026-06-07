'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'

const RATING_LABELS = {
  sufficient: '十分',
  mostly_sufficient: 'ほぼ十分',
  insufficient: '不足',
}

const MISSING_LABELS = {
  kh_dkh: 'KH（炭酸塩硬度）',
  temperature_c: '水温',
  salinity_sg: '塩分濃度',
  no3_ppm: '硝酸塩（NO3）',
  po4_ppm: 'リン酸塩（PO4）',
  tank_volume: '水量',
  water_change_frequency: '水換え頻度',
  water_change_volume: '換水量',
  additives: '添加剤',
  photo: '写真',
  other: 'その他',
}

export default function LiteExperimentAdminPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [effectsCount, setEffectsCount] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMetrics() {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        setError('管理者としてログインしてください。')
        setLoading(false)
        return
      }
      const [metricsResult, effectsResult] = await Promise.all([
        supabase.rpc('get_lite_experiment_metrics'),
        supabase.from('additive_effects').select('id', { count: 'exact', head: true }).eq('verified', true),
      ])
      if (metricsResult.error) setError('管理者権限がないか、集計データを読み込めませんでした。')
      else setMetrics(metricsResult.data)
      setEffectsCount(effectsResult.error ? null : effectsResult.count)
      setLoading(false)
    }
    loadMetrics()
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-7">
        <p className="text-sm font-bold text-cyan-300">LITE EXPERIMENT</p>
        <h1 className="mt-1 text-3xl font-bold text-white">実証実験レポート</h1>
        <p className="mt-2 text-sm text-slate-400">ショップ共有が実際に使われ、判断材料として十分だったかを確認します。</p>

        {loading && <p className="mt-8 text-slate-300">集計中...</p>}
        {error && <p className="mt-8 border border-rose-700 bg-rose-950 p-4 text-rose-100">{error}</p>}
        {effectsCount === 0 && (
          <p className="mt-5 border-2 border-rose-500 bg-rose-950 p-4 font-bold text-rose-100">
            添加剤の判定情報がまだ準備できていません。手持ち製品との照合と商品案内は、安全のため停止しています。
          </p>
        )}

        {metrics && (
          <>
            <section className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Metric label="共有回数" value={metrics.share_count} />
              <Metric label="現在有効" value={metrics.active_share_count} />
              <Metric label="閲覧回数" value={metrics.view_count} />
              <Metric label="ショップ評価" value={metrics.feedback_count} />
            </section>

            <section className="mt-7 grid gap-6 lg:grid-cols-2">
              <div className="border border-slate-700 bg-slate-900 p-5">
                <h2 className="text-lg font-bold text-white">ショップ評価</h2>
                <div className="mt-4 space-y-3">
                  {Object.entries(RATING_LABELS).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="text-slate-300">{label}</span>
                      <strong className="text-2xl text-white">{metrics.ratings?.[key] || 0}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-slate-700 bg-slate-900 p-5">
                <h2 className="text-lg font-bold text-white">不足項目ランキング</h2>
                {metrics.missing_key_ranking?.length ? (
                  <ol className="mt-4 space-y-3">
                    {metrics.missing_key_ranking.map((item, index) => (
                      <li key={`${item.key}-${index}`} className="grid grid-cols-[32px_1fr_auto] gap-2 border-b border-slate-800 pb-3">
                        <span className="font-bold text-cyan-300">{index + 1}</span>
                        <span className="text-sm text-slate-200">{MISSING_LABELS[item.key] || 'その他の情報'}</span>
                        <span className="font-bold text-white">{item.count}</span>
                      </li>
                    ))}
                  </ol>
                ) : <p className="mt-4 text-sm text-slate-400">不足項目の回答はまだありません。</p>}
              </div>
            </section>

            <section className="mt-6 border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-lg font-bold text-white">その他の自由回答</h2>
              {metrics.common_missing_info?.length ? (
                <ol className="mt-4 space-y-3">
                  {metrics.common_missing_info.map((item, index) => (
                    <li key={`${item.text}-${index}`} className="grid grid-cols-[32px_1fr_auto] gap-2 border-b border-slate-800 pb-3">
                      <span className="font-bold text-cyan-300">{index + 1}</span>
                      <span className="text-sm text-slate-200">{item.text}</span>
                      <span className="font-bold text-white">{item.count}</span>
                    </li>
                  ))}
                </ol>
              ) : <p className="mt-4 text-sm text-slate-400">自由回答はまだありません。</p>}
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <article className="border border-slate-700 bg-slate-900 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{Number(value || 0).toLocaleString('ja-JP')}</p>
    </article>
  )
}
