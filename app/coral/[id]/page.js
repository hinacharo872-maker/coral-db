'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const CATEGORY_COLORS = {
  SPS:  'bg-rose-900 text-rose-300',
  LPS:  'bg-amber-900 text-amber-300',
  Soft: 'bg-emerald-900 text-emerald-300',
}

export default function CoralDetail() {
  const { id } = useParams()
  const [coral, setCoral]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchCoral() {
      try {
        const { data, error } = await supabase
          .from('coral_master_list')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setCoral(data)
      } catch (err) {
        setError('データが見つかりませんでした')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCoral()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="text-center py-20 text-blue-300">
          <div className="text-5xl mb-4 animate-pulse">🪸</div>
          <p>読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !coral) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header />
        <div className="text-center py-20">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-rose-300">{error ?? 'データが見つかりません'}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-200 mt-4 inline-block">← 一覧に戻る</Link>
        </div>
      </div>
    )
  }

  const displayName = coral.trade_name || `${coral.genus ?? ''} ${coral.species ?? ''}`.trim()
  const scientificName = coral.genus && coral.species ? `${coral.genus} ${coral.species}` : null
  const categoryColor = CATEGORY_COLORS[coral.coral_category] ?? 'bg-slate-700 text-slate-300'

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <div className="bg-blue-950 border-b border-blue-900 py-3 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-blue-400 hover:text-blue-200 text-sm transition-colors">
            ← 一覧に戻る
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl border border-slate-700">

          {/* Image placeholder */}
          <div className="h-48 bg-gradient-to-br from-blue-900 to-teal-900 flex items-center justify-center">
            <span className="text-9xl opacity-50">🪸</span>
          </div>

          <div className="p-6 md:p-8 space-y-6">

            {/* Title & badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {coral.coral_category && (
                  <span className={`text-sm px-3 py-1 rounded-full ${categoryColor}`}>
                    {coral.coral_category}
                  </span>
                )}
                {coral.brand_prefix && (
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-900 text-blue-200">
                    {coral.brand_prefix}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
              {coral.common_name_jp && (
                <p className="text-blue-300 text-lg mt-1">{coral.common_name_jp}</p>
              )}
              {scientificName && displayName !== scientificName && (
                <p className="text-slate-400 italic mt-0.5">{scientificName}</p>
              )}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coral.genus && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">属 (Genus)</span>
                  <span className="text-white font-bold italic">{coral.genus}</span>
                </div>
              )}
              {coral.species && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">種 (Species)</span>
                  <span className="text-white font-bold italic">{coral.species}</span>
                </div>
              )}
              {coral.coral_category && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">カテゴリ</span>
                  <span className="text-white font-bold">{coral.coral_category}</span>
                </div>
              )}
              {coral.source_shop && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🏪 入手元ショップ</span>
                  <span className="text-white font-bold">{coral.source_shop}</span>
                </div>
              )}
              {coral.brand_prefix && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">ブランド</span>
                  <span className="text-white font-bold">{coral.brand_prefix}</span>
                </div>
              )}
              {coral.created_at && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">登録日</span>
                  <span className="text-white font-bold">
                    {new Date(coral.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
