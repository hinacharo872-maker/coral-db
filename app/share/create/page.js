'use client'

import { useEffect, useMemo, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import Header from '@/components/Header'
import { trackLiteEvent } from '@/lib/liteAnalytics'
import { supabase } from '@/lib/supabase'
import { browserSiteUrl } from '@/lib/siteUrl'

const EXPIRY_OPTIONS = [
  { value: '24h', label: '24時間' },
  { value: '7d', label: '7日' },
]

function createToken() {
  const bytes = new Uint8Array(24)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')
}

function expiresAtFor(value) {
  const hours = value === '24h' ? 24 : 24 * 7
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

function displayStatus(link) {
  if (link.status === 'revoked') return { label: '停止済み', tone: 'bg-slate-700 text-slate-200' }
  if (link.status === 'expired' || (link.expires_at && new Date(link.expires_at) <= new Date())) {
    return { label: '期限切れ', tone: 'bg-amber-400 text-slate-950' }
  }
  return { label: '有効', tone: 'bg-emerald-400 text-slate-950' }
}

export default function CreateSharePage() {
  const [session, setSession] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [tanks, setTanks] = useState([])
  const [sourceAquariums, setSourceAquariums] = useState([])
  const [links, setLinks] = useState([])
  const [tankId, setTankId] = useState('')
  const [expiry, setExpiry] = useState('24h')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthChecked(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthChecked(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    loadData()
  }, [session])

  async function loadData() {
    setLoading(true)
    setError('')
    const [tankResult, linkResult, aquariumResult] = await Promise.all([
      supabase.from('lite_tank_profiles').select('id, display_name, tank_volume_liters').order('created_at'),
      supabase.from('lite_shop_share_links').select('*').order('created_at', { ascending: false }),
      supabase.from('aquariums').select('id, name, volume_liters').order('created_at'),
    ])
    if (tankResult.error || linkResult.error || aquariumResult.error) {
      setError('共有情報を読み込めませんでした。時間をおいて再度お試しください。')
    } else {
      setTanks(tankResult.data ?? [])
      setLinks(linkResult.data ?? [])
      setSourceAquariums(aquariumResult.data ?? [])
      setTankId(current => current || tankResult.data?.[0]?.id || '')
    }
    setLoading(false)
  }

  async function importAquarium(aquariumId) {
    setSaving(true)
    setError('')
    const { error } = await supabase.rpc('create_lite_profile_from_aquarium', {
      p_aquarium_id: aquariumId,
    })
    if (error) setError('既存の水槽データを取り込めませんでした。')
    else await loadData()
    setSaving(false)
  }

  async function sendMagicLink(event) {
    event.preventDefault()
    setAuthMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${browserSiteUrl()}/share/create` },
    })
    setAuthMessage(error ? 'ログインメールを送信できませんでした。' : 'ログインリンクをメールへ送りました。')
  }

  async function createShare() {
    if (!tankId || !session?.user?.id) return
    setSaving(true)
    setError('')
    const { error } = await supabase.from('lite_shop_share_links').insert({
      tank_id: tankId,
      user_id: session.user.id,
      token: createToken(),
      expires_at: expiresAtFor(expiry),
    })
    if (error) setError('共有リンクを作成できませんでした。')
    else {
      trackLiteEvent('share_link_created')
      await loadData()
    }
    setSaving(false)
  }

  async function revokeShare(linkId) {
    setError('')
    const revokedAt = new Date().toISOString()
    const { error } = await supabase
      .from('lite_shop_share_links')
      .update({ status: 'revoked', revoked_at: revokedAt })
      .eq('id', linkId)
    if (error) setError('共有を停止できませんでした。')
    else setLinks(current => current.map(link => (
      link.id === linkId ? { ...link, status: 'revoked', revoked_at: revokedAt } : link
    )))
  }

  async function copyUrl(link) {
    const url = `${browserSiteUrl()}/share/${link.token}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(link.id)
      window.setTimeout(() => setCopiedId(null), 1800)
    } catch {
      setError('URLをコピーできませんでした。URLを長押ししてコピーしてください。')
    }
  }

  async function shareUrl(link) {
    const url = `${browserSiteUrl()}/share/${link.token}`
    if (!navigator.share) {
      await copyUrl(link)
      return
    }
    try {
      await navigator.share({
        title: `${tankNames.get(link.tank_id) || '水槽'}のショップ用カルテ`,
        text: 'ReefChart Liteのショップ用水槽カルテです。',
        url,
      })
    } catch (error) {
      if (error?.name !== 'AbortError') setError('共有メニューを開けませんでした。')
    }
  }

  const tankNames = useMemo(
    () => new Map(tanks.map(tank => [tank.id, tank.display_name || '名称未設定の水槽'])),
    [tanks],
  )

  if (!authChecked || loading) {
    return <PageShell><p className="text-slate-300">共有情報を読み込んでいます...</p></PageShell>
  }

  if (!session) {
    return (
      <PageShell>
        <section className="max-w-md border border-slate-700 bg-slate-900 p-5">
          <h1 className="text-2xl font-bold text-white">ショップ共有</h1>
          <p className="mt-2 text-sm text-slate-300">共有リンクの作成にはログインが必要です。</p>
          <form onSubmit={sendMagicLink} className="mt-5 space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="メールアドレス"
              className="w-full border border-slate-600 bg-slate-950 px-4 py-3 text-white"
            />
            <button className="w-full bg-cyan-400 px-4 py-3 font-bold text-slate-950">ログインリンクを送る</button>
          </form>
          {authMessage && <p className="mt-3 text-sm text-cyan-200">{authMessage}</p>}
        </section>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div>
        <p className="text-sm font-semibold text-cyan-300">ReefChart Lite</p>
        <h1 className="mt-1 text-3xl font-bold text-white">ショップ共有</h1>
        <p className="mt-2 text-sm text-slate-300">水槽カルテをURLまたはQRコードで店員へ見せられます。新しく作る共有は24時間または7日で自動的に期限切れになります。</p>
      </div>

      {error && <p className="mt-5 border border-rose-700 bg-rose-950 p-3 text-rose-100">{error}</p>}

      <section className="mt-6 border border-slate-700 bg-slate-900 p-4">
        <h2 className="text-lg font-bold text-white">新しい共有リンク</h2>
        {tanks.length === 0 ? (
          <div className="mt-3">
            <p className="text-sm text-amber-200">共有できるLite水槽がありません。既存の水槽から30日分の記録を取り込めます。</p>
            {sourceAquariums.length > 0 ? (
              <div className="mt-3 space-y-2">
                {sourceAquariums.map(aquarium => (
                  <button
                    key={aquarium.id}
                    type="button"
                    disabled={saving}
                    onClick={() => importAquarium(aquarium.id)}
                    className="flex min-h-12 w-full items-center justify-between gap-3 border border-cyan-800 px-4 py-3 text-left text-sm text-cyan-100 disabled:opacity-50"
                  >
                    <span>{aquarium.name}</span>
                    <span className="shrink-0">{aquarium.volume_liters ? `${aquarium.volume_liters} L` : '水量未登録'}を取り込む</span>
                  </button>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-slate-400">既存の水槽もまだ登録されていません。</p>}
          </div>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <label className="text-sm text-slate-300">
              水槽
              <select value={tankId} onChange={event => setTankId(event.target.value)} className="mt-1 w-full border border-slate-600 bg-slate-950 px-3 py-3 text-white">
                {tanks.map(tank => <option key={tank.id} value={tank.id}>{tank.display_name || '名称未設定の水槽'}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-300">
              有効期限
              <select value={expiry} onChange={event => setExpiry(event.target.value)} className="mt-1 w-full border border-slate-600 bg-slate-950 px-3 py-3 text-white">
                {EXPIRY_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <button type="button" disabled={saving} onClick={createShare} className="min-h-12 self-end bg-cyan-400 px-5 py-3 font-bold text-slate-950 disabled:bg-slate-600">
              {saving ? '作成中...' : '共有を作成'}
            </button>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-white">共有リンク一覧</h2>
        {links.length === 0 ? (
          <p className="mt-3 border border-slate-800 p-5 text-slate-400">まだ共有リンクはありません。</p>
        ) : (
          <div className="mt-3 grid gap-4 lg:grid-cols-2">
            {links.map(link => {
              const status = displayStatus(link)
              const url = `${browserSiteUrl()}/share/${link.token}`
              const active = status.label === '有効'
              return (
                <article key={link.id} className="border border-slate-700 bg-slate-900 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-white">{tankNames.get(link.tank_id) || '水槽カルテ'}</h3>
                      <p className="mt-1 text-xs text-slate-400">
                        期限: {link.expires_at ? new Date(link.expires_at).toLocaleString('ja-JP') : '期限なし（旧リンク）'}
                      </p>
                    </div>
                    <span className={`shrink-0 px-3 py-1 text-xs font-bold ${status.tone}`}>{status.label}</span>
                  </div>
                  {active && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-[148px_1fr]">
                      <div className="w-fit bg-white p-2">
                        <QRCodeSVG value={url} size={132} level="M" marginSize={1} title="ショップ共有QRコード" />
                      </div>
                      <div className="min-w-0">
                        <p className="break-all border border-slate-700 bg-slate-950 p-3 text-xs text-cyan-200">{url}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => shareUrl(link)} className="col-span-2 min-h-11 bg-cyan-400 px-3 py-2 text-sm font-bold text-slate-950">
                            URLを共有
                          </button>
                          <button type="button" onClick={() => copyUrl(link)} className="min-h-11 border border-cyan-500 px-3 py-2 text-sm font-bold text-cyan-100">
                            {copiedId === link.id ? 'コピーしました' : 'URLをコピー'}
                          </button>
                          <button type="button" onClick={() => revokeShare(link.id)} className="min-h-11 border border-rose-700 px-3 py-2 text-sm font-bold text-rose-200">
                            共有を停止
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </PageShell>
  )
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-7">{children}</main>
    </div>
  )
}
