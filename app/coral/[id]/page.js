'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const CATEGORY_COLORS = {
  SPS: 'bg-rose-950 text-rose-200',
  LPS: 'bg-amber-950 text-amber-200',
  Soft: 'bg-emerald-950 text-emerald-200',
  Zoanthid: 'bg-violet-950 text-violet-200',
}

const WATER_FIELDS = [
  { key: 'temperature', label: '水温', unit: '°C' },
  { key: 'salinity', label: '比重', unit: '' },
  { key: 'kh', label: 'KH', unit: 'dKH' },
  { key: 'calcium', label: 'Ca', unit: 'ppm' },
  { key: 'magnesium', label: 'Mg', unit: 'ppm' },
  { key: 'nitrate', label: 'NO3', unit: 'ppm' },
  { key: 'phosphate', label: 'PO4', unit: 'ppm' },
]

function formatValue(value, unit) {
  if (value == null) return null
  return `${value}${unit ? ` ${unit}` : ''}`
}

export default function CoralDetail() {
  const { id } = useParams()
  const [coral, setCoral] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        setError('サンゴデータが見つかりませんでした。')
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
        <div className="text-center py-20 text-cyan-300">
          <div className="text-5xl mb-4 animate-pulse">◇</div>
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
          <div className="text-5xl mb-4 text-rose-300">!</div>
          <p className="text-rose-300">{error ?? 'データが見つかりません。'}</p>
          <Link href="/" className="text-cyan-300 hover:text-cyan-100 mt-4 inline-block">一覧に戻る</Link>
        </div>
      </div>
    )
  }

  const displayName = coral.trade_name || `${coral.genus ?? ''} ${coral.species ?? ''}`.trim()
  const scientificName = coral.genus && coral.species ? `${coral.genus} ${coral.species}` : null
  const categoryColor = CATEGORY_COLORS[coral.coral_category] ?? 'bg-slate-800 text-slate-300'
  const waterValues = WATER_FIELDS
    .map(field => ({ ...field, value: formatValue(coral[field.key], field.unit) }))
    .filter(field => field.value != null)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <div className="bg-slate-900 border-b border-slate-800 py-3 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-cyan-300 hover:text-cyan-100 text-sm transition-colors">
            一覧に戻る
          </Link>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-slate-900 rounded-lg overflow-hidden shadow-xl border border-slate-800">
          <div className="h-48 bg-gradient-to-br from-cyan-950 to-slate-950 flex items-center justify-center">
            <span className="text-8xl opacity-50 text-cyan-200">◇</span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {coral.coral_category && (
                  <span className={`text-sm px-3 py-1 rounded-full ${categoryColor}`}>
                    {coral.coral_category}
                  </span>
                )}
                {coral.brand_prefix && (
                  <span className="text-sm px-3 py-1 rounded-full bg-cyan-950 text-cyan-200">
                    {coral.brand_prefix}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{displayName}</h1>
              {coral.common_name_jp && (
                <p className="text-cyan-300 text-lg mt-1">{coral.common_name_jp}</p>
              )}
              {scientificName && displayName !== scientificName && (
                <p className="text-slate-400 italic mt-0.5">{scientificName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {coral.genus && (
                <div className="bg-slate-950 rounded-md p-4 flex flex-col gap-1 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">属名</span>
                  <span className="text-white font-bold italic">{coral.genus}</span>
                </div>
              )}
              {coral.species && (
                <div className="bg-slate-950 rounded-md p-4 flex flex-col gap-1 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">種小名</span>
                  <span className="text-white font-bold italic">{coral.species}</span>
                </div>
              )}
              {coral.source_shop && (
                <div className="bg-slate-950 rounded-md p-4 flex flex-col gap-1 border border-slate-800">
                  <span className="text-xs text-slate-400 font-medium">入手先</span>
                  <span className="text-white font-bold">{coral.source_shop}</span>
                </div>
              )}
            </div>

            {waterValues.length > 0 && (
              <section>
                <h2 className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-3">推奨・参考水質</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {waterValues.map(field => (
                    <div key={field.key} className="bg-slate-950 rounded-md p-4 flex flex-col gap-1 border border-slate-800">
                      <span className="text-xs text-slate-400 font-medium">{field.label}</span>
                      <span className="text-white font-bold">{field.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </main>
    </div>
  )
}
