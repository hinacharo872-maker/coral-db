'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function CoralIdentityDashboard() {
  const [summary, setSummary] = useState(null)
  const [groups, setGroups] = useState([])
  const [mode, setMode] = useState('all')
  const [session, setSession] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [notes, setNotes] = useState({})
  const [savingId, setSavingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function checkAdmin() {
      if (!session) {
        setIsAdmin(false)
        return
      }
      const { data, error } = await supabase.rpc('is_app_admin')
      setIsAdmin(!error && data === true)
    }
    checkAdmin()
  }, [session])

  useEffect(() => {
    fetchCandidates()
  }, [mode])

  async function fetchCandidates() {
    setLoading(true)
    setError(null)
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

  async function sendMagicLink(event) {
    event.preventDefault()
    setAuthMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setAuthMessage(error ? error.message : 'ログインリンクをメールへ送りました。')
  }

  async function reviewGroup(entityId, action) {
    setSavingId(entityId)
    setError(null)
    const { error } = await supabase.rpc('review_coral_identity', {
      p_entity_id: entityId,
      p_action: action,
      p_notes: notes[entityId] || null,
    })

    if (error) {
      setError(`レビューの保存に失敗しました: ${error.message}`)
    } else {
      setGroups(current => current.map(group => (
        group.entity_id === entityId ? { ...group, review_status: action } : group
      )))
      setNotes(current => ({ ...current, [entityId]: '' }))
    }
    setSavingId(null)
  }

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
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-cyan-300 text-sm font-semibold">Identity resolution</p>
            <h2 className="text-2xl font-bold text-white mt-1">同じサンゴをまとめる</h2>
            <p className="text-slate-400 text-sm mt-2 max-w-3xl">
              ショップ名、ブランド接頭辞、サイズ、ヘッド数、Frag・Colony表記を除いて同一候補を作っています。
              候補を確認してから正式な1件へまとめます。
            </p>
          </div>
          <AuthPanel
            session={session}
            isAdmin={isAdmin}
            email={email}
            message={authMessage}
            setEmail={setEmail}
            sendMagicLink={sendMagicLink}
          />
        </div>
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
                <StatusBadge status={group.review_status} />
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

            {isAdmin && (
              <div className="mt-5 pt-4 border-t border-slate-800">
                <label className="block">
                  <span className="text-xs text-slate-400">レビュー理由・メモ</span>
                  <input
                    value={notes[group.entity_id] || ''}
                    onChange={event => setNotes(current => ({ ...current, [group.entity_id]: event.target.value }))}
                    placeholder="判断理由や分割すべき違いを記録"
                    className="mt-1 w-full px-3 py-2 rounded-md bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 text-sm"
                  />
                </label>
                <div className="flex flex-wrap gap-2 mt-3">
                  <ReviewButton
                    disabled={savingId === group.entity_id}
                    tone="confirm"
                    onClick={() => reviewGroup(group.entity_id, 'confirmed')}
                  >
                    同一サンゴとして確定
                  </ReviewButton>
                  <ReviewButton
                    disabled={savingId === group.entity_id}
                    tone="split"
                    onClick={() => reviewGroup(group.entity_id, 'needs_split')}
                  >
                    別物として要分割
                  </ReviewButton>
                  <ReviewButton
                    disabled={savingId === group.entity_id}
                    tone="reject"
                    onClick={() => reviewGroup(group.entity_id, 'rejected')}
                  >
                    サンゴ候補から除外
                  </ReviewButton>
                  {group.review_status !== 'candidate' && (
                    <ReviewButton
                      disabled={savingId === group.entity_id}
                      onClick={() => reviewGroup(group.entity_id, 'candidate')}
                    >
                      未確認へ戻す
                    </ReviewButton>
                  )}
                </div>
              </div>
            )}
          </article>
        ))}

        {!loading && groups.length === 0 && (
          <div className="py-12 text-center text-slate-500">この条件の候補はありません。</div>
        )}
      </div>
    </section>
  )
}

function AuthPanel({ session, isAdmin, email, message, setEmail, sendMagicLink }) {
  if (session) {
    return (
      <div className="border border-slate-700 bg-slate-950 rounded-lg p-3 min-w-[240px]">
        <p className="text-xs text-slate-500">ログイン中</p>
        <p className="text-sm text-white mt-1 truncate max-w-[260px]">{session.user.email}</p>
        <div className="flex items-center justify-between gap-3 mt-2">
          <span className={`text-xs ${isAdmin ? 'text-emerald-300' : 'text-amber-300'}`}>
            {isAdmin ? '管理者権限あり' : '管理者登録が必要'}
          </span>
          <button type="button" onClick={() => supabase.auth.signOut()} className="text-xs text-slate-400 hover:text-white">
            ログアウト
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={sendMagicLink} className="border border-slate-700 bg-slate-950 rounded-lg p-3 min-w-[280px]">
      <label className="text-xs text-slate-400">管理者メールログイン</label>
      <div className="flex gap-2 mt-1">
        <input
          type="email"
          required
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="email@example.com"
          className="min-w-0 flex-1 px-3 py-2 rounded-md bg-slate-900 border border-slate-700 text-white text-sm"
        />
        <button type="submit" className="px-3 py-2 bg-cyan-500 text-slate-950 rounded-md text-sm font-semibold">
          送信
        </button>
      </div>
      {message && <p className="text-xs text-cyan-300 mt-2">{message}</p>}
    </form>
  )
}

function StatusBadge({ status }) {
  const labels = {
    candidate: '未確認',
    confirmed: '同一確定',
    needs_split: '要分割',
    rejected: '除外',
  }
  return <Badge tone={status === 'confirmed' ? 'emerald' : status === 'needs_split' ? 'amber' : status === 'rejected' ? 'rose' : 'slate'}>{labels[status] ?? status}</Badge>
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
    emerald: 'border-emerald-800 bg-emerald-950 text-emerald-200',
  }

  return <span className={`text-xs border rounded-full px-2.5 py-1 ${colors[tone]}`}>{children}</span>
}

function ReviewButton({ children, onClick, disabled, tone = 'default' }) {
  const colors = {
    default: 'border-slate-700 text-slate-300 hover:border-slate-500',
    confirm: 'border-emerald-700 text-emerald-200 hover:bg-emerald-950',
    split: 'border-amber-700 text-amber-200 hover:bg-amber-950',
    reject: 'border-rose-700 text-rose-200 hover:bg-rose-950',
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`border rounded-md px-3 py-2 text-sm disabled:opacity-40 transition-colors ${colors[tone]}`}
    >
      {children}
    </button>
  )
}
