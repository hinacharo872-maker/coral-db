'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CoralIdentityDashboard() {
  const [summary, setSummary] = useState(null)
  const [groups, setGroups] = useState([])
  const [mode, setMode] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchCandidates() {
      try {
        let query = supabase
          .from('coral_identity_candidates')
          .select('*')
          .order('listing_count', { ascending: false })
          .limit(50)

        if (mode === 'shops') query = query.gt('shop_count', 1)
        if (mode === 'sizes') query = query.gt('sized_listing_count', 0)
        if (mode === 'conflicts') query = query.or('genus_conflict.eq.true,category_conflict.eq.true')

        const [summaryResult, groupResult] = await Promise.all([
          supabase.from('coral_identity_summary').select('*').single(),
          query,
        ])

        if (summaryResult.error) throw summaryResult.error
        if (groupResult.error) throw groupResult.error
        setSummary(summaryResult.data)
        setGroups(groupResult.data ?? [])
      } catch (err) {
        setError('同一候補データを読み込めませんでした。migrationの完了を確認してください。')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchCandidates()
  }, [mode])

  if (loading && !summary) return <div className="py-16 text-center text-cyan-300">同一候補を整理中...</div>
  if (error || !summary) return <div className="border border-rose-800 bg-rose-950/50 rounded-lg p-4 text-rose-100">{error}</div>

  const metrics = [
    { label: '元の商品掲載', value: summary.total_listings },
    { label: 'サンゴ実体候補', value: summary.candidate_entities },
    { label: '重複候補グループ', value: summary.duplicate_candidate_groups },
    { label: '複数ショップ掲載', value: summary.cross_shop_groups },
    { label: 'サイズ違い掲載', value: summary.size_variant_groups },
    { label: 'サンゴ以外の疑い', value: summary.non_coral_candidates },
  ]

  return (
    <section className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <p className="text-cyan-300 text-sm font-semibold">Identity resolution</p>
        <h2 className="text-2xl font-bold text-white mt-1">同じサンゴをまとめる</h2>
        <p className="text-slate-400 text-sm mt-2 max-w-3xl">
          ショップ名、ブランド接頭辞、サイズ、ヘッド数、Frag・Colony表記を除いて同一候補を作っています。
          まだ自動確定はせず、候補を確認してから正式な1件へまとめます。
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {metrics.map(metric => (
          <div key={metric.label} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className="text-2xl font-bold text-white mt-1">{metric.value.toLocaleString('ja-JP')}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        <ModeButton active={mode === 'all'} onClick={() => setMode('all')}>すべて</ModeButton>
        <ModeButton active={mode === 'shops'} onClick={() => setMode('shops')}>複数ショップ</ModeButton>
        <ModeButton active={mode === 'sizes'} onClick={() => setMode('sizes')}>サイズ違い</ModeButton>
        <ModeButton active={mode === 'conflicts'} onClick={() => setMode('conflicts')}>分類矛盾</ModeButton>
      </div>

      <div className="space-y-3">
        {groups.map(group => (
          <article key={group.entity_id} className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{group.canonical_name}</h3>
                  {group.genus && <span className="text-xs text-cyan-300 italic">{group.genus} {group.species}</span>}
                </div>
                <p className="text-xs text-slate-500 mt-1">{group.coral_category || 'カテゴリ未確定'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{group.listing_count} 掲載</Badge>
                <Badge>{group.shop_count} ショップ</Badge>
                {group.sized_listing_count > 0 && <Badge tone="amber">{group.sized_listing_count} サイズ表記</Badge>}
                {(group.genus_conflict || group.category_conflict) && <Badge tone="rose">分類矛盾</Badge>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">ショップ</p>
                <div className="flex flex-wrap gap-1.5">
                  {(group.shops ?? []).map(shop => <Badge key={shop}>{shop}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">販売名・サイズ違い</p>
                <div className="space-y-1">
                  {(group.listing_names ?? []).slice(0, 6).map(name => (
                    <p key={name} className="text-sm text-slate-300">{name}</p>
                  ))}
                  {(group.listing_names ?? []).length > 6 && (
                    <p className="text-xs text-slate-500">ほか {(group.listing_names ?? []).length - 6} 件</p>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}

        {!loading && groups.length === 0 && (
          <div className="py-12 text-center text-slate-500">この条件の候補はありません。</div>
        )}
      </div>
    </section>
  )
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-sm border px-3 py-2 rounded-md transition-colors ${
        active
          ? 'bg-cyan-950 border-cyan-600 text-cyan-200'
          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}

function Badge({ children, tone = 'slate' }) {
  const colors = {
    slate: 'border-slate-700 bg-slate-950 text-slate-300',
    amber: 'border-amber-800 bg-amber-950 text-amber-200',
    rose: 'border-rose-800 bg-rose-950 text-rose-200',
  }

  return <span className={`text-xs border rounded-full px-2.5 py-1 ${colors[tone]}`}>{children}</span>
}
