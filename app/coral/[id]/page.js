'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

function getDifficultyLabel(level) {
  if (level == null) return null
  if (level <= 2) return { label: '初心者向け',  color: 'bg-emerald-900 text-emerald-300' }
  if (level === 3) return { label: '中級者向け',  color: 'bg-amber-900 text-amber-300' }
  return               { label: '上級者向け',  color: 'bg-rose-900 text-rose-300' }
}

const FLOW_LABELS = {
  low:    '弱 (low)',
  medium: '中 (medium)',
  high:   '強 (high)',
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
          .from('coral_encyclopedia')
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

  const difficulty = getDifficultyLabel(coral.difficulty)
  const displayName = coral.species_name || coral.scientific_name

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

          {/* Image */}
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-blue-900 to-teal-900">
            {coral.image_url ? (
              <Image
                src={coral.image_url}
                alt={displayName ?? ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <span className="text-9xl">🪸</span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-6">

            {/* Title & badges */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {coral.source_type && (
                  <span className="text-sm px-3 py-1 rounded-full bg-sky-900 text-sky-300">
                    {coral.source_type}
                  </span>
                )}
                {difficulty && (
                  <span className={`text-sm px-3 py-1 rounded-full ${difficulty.color}`}>
                    {difficulty.label}（Lv.{coral.difficulty}）
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
              {coral.common_name_jp && (
                <p className="text-blue-300 text-lg mt-1">{coral.common_name_jp}</p>
              )}
              {coral.common_name && (
                <p className="text-slate-400 mt-0.5">{coral.common_name}</p>
              )}
              {coral.scientific_name !== displayName && (
                <p className="text-slate-500 italic mt-0.5">{coral.scientific_name}</p>
              )}
            </div>

            {/* Quick params */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coral.light_min != null && coral.light_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">💡 推奨光量</span>
                  <span className="text-white font-bold">{coral.light_min} – {coral.light_max} PAR</span>
                </div>
              )}
              {coral.kh_min != null && coral.kh_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">⚗️ 推奨 KH</span>
                  <span className="text-white font-bold">{coral.kh_min} – {coral.kh_max} dKH</span>
                </div>
              )}
              {coral.flow && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🌊 水流</span>
                  <span className="text-white font-bold">{FLOW_LABELS[coral.flow] ?? coral.flow}</span>
                </div>
              )}
              {coral.temp_min != null && coral.temp_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🌡️ 水温</span>
                  <span className="text-white font-bold">{coral.temp_min} – {coral.temp_max} °C</span>
                </div>
              )}
              {coral.ca_min != null && coral.ca_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🧪 Ca</span>
                  <span className="text-white font-bold">{coral.ca_min} – {coral.ca_max} ppm</span>
                </div>
              )}
              {coral.mg_min != null && coral.mg_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🔬 Mg</span>
                  <span className="text-white font-bold">{coral.mg_min} – {coral.mg_max} ppm</span>
                </div>
              )}
            </div>

            {/* Summary */}
            {coral.summary_jp && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">解説</h2>
                <p className="text-slate-200 leading-relaxed">{coral.summary_jp}</p>
              </div>
            )}

            {/* Additives */}
            {coral.additives && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">添加剤</h2>
                <p className="text-slate-200 leading-relaxed">{coral.additives}</p>
              </div>
            )}

            {/* Source link */}
            {coral.source_url && (
              <div>
                <a href={coral.source_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-white transition-colors inline-block">
                  🔗 ソースを開く
                </a>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
