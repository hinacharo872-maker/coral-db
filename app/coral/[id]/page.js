'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const DIFFICULTY_LABELS = {
  beginner:     '初心者向け ★☆☆',
  intermediate: '中級者向け ★★☆',
  advanced:     '上級者向け ★★★',
}

const LIGHT_LABELS = {
  low:      '弱光 (Low)',
  medium:   '中光 (Medium)',
  high:     '強光 (High)',
  very_high:'超強光 (Very High)',
}

const FLOW_LABELS = {
  low:    '弱水流',
  medium: '中水流',
  high:   '強水流',
}

const TYPE_LABELS = {
  SPS:  'SPS (小ポリプ型)',
  LPS:  'LPS (大ポリプ型)',
  soft: 'ソフトコーラル',
}

export default function CoralDetail() {
  const { id } = useParams()
  const [coral, setCoral]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    async function fetchCoral() {
      try {
        const { data, error } = await supabase
          .from('coral_database')
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

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Back link */}
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
                alt={coral.scientific_name}
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

            {/* Name */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white italic">{coral.scientific_name}</h1>
              {coral.common_name_en && <p className="text-blue-300 text-lg mt-1">{coral.common_name_en}</p>}
              {coral.common_name_ja && <p className="text-blue-400 mt-0.5 text-lg">{coral.common_name_ja}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {coral.coral_type && (
                  <span className="text-sm px-3 py-1 rounded-full bg-purple-900 text-purple-300">
                    {TYPE_LABELS[coral.coral_type] ?? coral.coral_type}
                  </span>
                )}
                {coral.difficulty && (
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-900 text-blue-300">
                    {DIFFICULTY_LABELS[coral.difficulty] ?? coral.difficulty}
                  </span>
                )}
              </div>
            </div>

            {/* Classification */}
            {(coral.family || coral.genus) && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">分類</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {coral.family && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">科</div>
                      <div className="text-white">{coral.family}</div>
                    </div>
                  )}
                  {coral.genus && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">属</div>
                      <div className="text-white">{coral.genus}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Distribution */}
            {(coral.origin_region || coral.distribution) && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">分布・産地</h2>
                <p className="text-white">{coral.distribution ?? coral.origin_region}</p>
              </div>
            )}

            {/* Water parameters */}
            <div>
              <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">飼育環境</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {coral.water_temp_min != null && coral.water_temp_max != null && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">🌡️ 水温</div>
                    <div className="text-white font-semibold">{coral.water_temp_min}–{coral.water_temp_max}°C</div>
                  </div>
                )}
                {coral.salinity_min != null && coral.salinity_max != null && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">🧂 塩分濃度</div>
                    <div className="text-white font-semibold">{coral.salinity_min}–{coral.salinity_max} ppt</div>
                  </div>
                )}
                {coral.ph_min != null && coral.ph_max != null && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">⚗️ pH</div>
                    <div className="text-white font-semibold">{coral.ph_min}–{coral.ph_max}</div>
                  </div>
                )}
                {coral.light_intensity && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">💡 照明</div>
                    <div className="text-white font-semibold">{LIGHT_LABELS[coral.light_intensity] ?? coral.light_intensity}</div>
                  </div>
                )}
                {coral.flow && (
                  <div className="bg-slate-900 rounded-lg p-3">
                    <div className="text-slate-400 text-xs mb-1">🌊 水流</div>
                    <div className="text-white font-semibold">{FLOW_LABELS[coral.flow] ?? coral.flow}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {coral.summary && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">概要</h2>
                <p className="text-slate-200 leading-relaxed">{coral.summary}</p>
              </div>
            )}

            {/* Description */}
            {coral.description && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">説明</h2>
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
              <div className="pt-4 border-t border-slate-700 text-xs text-slate-500">
                登録: {coral.contributed_by}{coral.country && ` (${coral.country})`}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
