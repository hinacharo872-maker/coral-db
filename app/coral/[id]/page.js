'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const DIFFICULTY_CONFIG = {
  beginner:     { label: '初心者向け',  color: 'bg-emerald-900 text-emerald-300' },
  intermediate: { label: '中級者向け',  color: 'bg-amber-900 text-amber-300' },
  advanced:     { label: '上級者向け',  color: 'bg-rose-900 text-rose-300' },
}

const TYPE_CONFIG = {
  SPS:  { color: 'bg-sky-900 text-sky-300' },
  LPS:  { color: 'bg-violet-900 text-violet-300' },
  soft: { label: 'ソフトコーラル', color: 'bg-teal-900 text-teal-300' },
}

const LIGHT_LABELS = {
  low:       '低光量 (low)',
  medium:    '中光量 (medium)',
  high:      '強光量 (high)',
  very_high: '超強光量 (very high)',
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

  const difficulty = DIFFICULTY_CONFIG[coral.difficulty]
  const type = TYPE_CONFIG[coral.coral_type]
  const displayName = coral.common_name_ja || coral.common_name_en || coral.scientific_name

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
                {type && (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${type.color}`}>
                    {type.label ?? coral.coral_type}
                  </span>
                )}
                {difficulty && (
                  <span className={`text-sm px-3 py-1 rounded-full ${difficulty.color}`}>
                    {difficulty.label}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
              {coral.common_name_en && coral.common_name_ja && (
                <p className="text-blue-300 mt-1">{coral.common_name_en}</p>
              )}
              <p className="text-slate-400 italic mt-1">{coral.scientific_name}</p>
              {(coral.family || coral.genus) && (
                <p className="text-slate-500 text-sm mt-1">
                  {[coral.family, coral.genus].filter(Boolean).join(' / ')}
                </p>
              )}
            </div>

            {/* Quick params at a glance */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coral.light_intensity && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">💡 推奨光量</span>
                  <span className="text-white font-bold">{LIGHT_LABELS[coral.light_intensity] ?? coral.light_intensity}</span>
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
              {coral.water_temp_min != null && coral.water_temp_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🌡️ 水温</span>
                  <span className="text-white font-bold">{coral.water_temp_min} – {coral.water_temp_max} °C</span>
                </div>
              )}
              {coral.ph_min != null && coral.ph_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🔬 pH</span>
                  <span className="text-white font-bold">{coral.ph_min} – {coral.ph_max}</span>
                </div>
              )}
              {coral.salinity_min != null && coral.salinity_max != null && (
                <div className="bg-slate-900 rounded-xl p-4 flex flex-col gap-1">
                  <span className="text-xs text-slate-400 font-medium">🧂 塩分濃度</span>
                  <span className="text-white font-bold">{coral.salinity_min} – {coral.salinity_max} ppt</span>
                </div>
              )}
            </div>

            {/* Distribution */}
            {(coral.origin_region || coral.distribution) && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">分布</h2>
                <p className="text-slate-200">{coral.distribution || coral.origin_region}</p>
              </div>
            )}

            {/* Description */}
            {coral.description && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">解説</h2>
                <p className="text-slate-200 leading-relaxed">{coral.description}</p>
              </div>
            )}

            {/* Care notes */}
            {coral.care_notes && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">飼育メモ</h2>
                <p className="text-slate-200 leading-relaxed">{coral.care_notes}</p>
              </div>
            )}

            {/* Meta */}
            {(coral.contributed_by || coral.country) && (
              <div className="pt-4 border-t border-slate-700 text-sm text-slate-500">
                登録: {[coral.contributed_by, coral.country].filter(Boolean).join(' / ')}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
