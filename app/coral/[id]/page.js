'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Header from '@/components/Header'

const EVIDENCE_STYLES = {
  high:   'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  low:    'bg-red-900 text-red-300',
}

export default function CoralDetail() {
  const { id } = useParams()
  const [record, setRecord]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    async function fetchRecord() {
      try {
        const { data, error } = await supabase
          .from('coral_database')
          .select('*')
          .eq('id', id)
          .single()
        if (error) throw error
        setRecord(data)
      } catch (err) {
        setError('データが見つかりませんでした')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchRecord()
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

  if (error || !record) {
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

  const imageUrl = record.starage_image_url || record.raw_image_url

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
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={record.title ?? ''}
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

            {/* Title & Tags */}
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">{record.title}</h1>
              {record.authors && <p className="text-blue-300 mt-2">{record.authors}</p>}
              {record.published_date && (
                <p className="text-slate-400 text-sm mt-1">{record.published_date}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {record.source_type && (
                  <span className="text-sm px-3 py-1 rounded-full bg-purple-900 text-purple-300">
                    {record.source_type}
                  </span>
                )}
                {record.language && (
                  <span className="text-sm px-3 py-1 rounded-full bg-blue-900 text-blue-300">
                    {record.language}
                  </span>
                )}
                {record.evidence_level && (
                  <span className={`text-sm px-3 py-1 rounded-full ${EVIDENCE_STYLES[record.evidence_level] ?? 'bg-gray-700 text-gray-300'}`}>
                    証拠レベル: {record.evidence_level}
                  </span>
                )}
                {record.value_category && (
                  <span className="text-sm px-3 py-1 rounded-full bg-teal-900 text-teal-300">
                    {record.value_category}
                  </span>
                )}
              </div>
            </div>

            {/* Links */}
            {(record.source_url || record.pdf_url) && (
              <div className="flex flex-wrap gap-3">
                {record.source_url && (
                  <a href={record.source_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-white transition-colors">
                    🔗 ソースを開く
                  </a>
                )}
                {record.pdf_url && (
                  <a href={record.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="text-sm px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                    📄 PDF
                  </a>
                )}
              </div>
            )}

            {/* Water parameters */}
            {(record.temp_min != null || record.kh_min != null || record.ca_min != null || record.mg_min != null || record.par_min != null) && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-3">水質パラメータ</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {record.temp_min != null && record.temp_max != null && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">🌡️ 水温</div>
                      <div className="text-white font-semibold">{record.temp_min}–{record.temp_max}°C</div>
                    </div>
                  )}
                  {record.kh_min != null && record.kh_max != null && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">⚗️ KH</div>
                      <div className="text-white font-semibold">{record.kh_min}–{record.kh_max} dKH</div>
                    </div>
                  )}
                  {record.ca_min != null && record.ca_max != null && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">🧪 Ca</div>
                      <div className="text-white font-semibold">{record.ca_min}–{record.ca_max} ppm</div>
                    </div>
                  )}
                  {record.mg_min != null && record.mg_max != null && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">🔬 Mg</div>
                      <div className="text-white font-semibold">{record.mg_min}–{record.mg_max} ppm</div>
                    </div>
                  )}
                  {record.par_min != null && record.par_max != null && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">💡 PAR</div>
                      <div className="text-white font-semibold">{record.par_min}–{record.par_max}</div>
                    </div>
                  )}
                  {record.mention_counts != null && (
                    <div className="bg-slate-900 rounded-lg p-3">
                      <div className="text-slate-400 text-xs mb-1">📊 言及数</div>
                      <div className="text-white font-semibold">{record.mention_counts}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trace elements */}
            {record.trace_elements && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">微量元素</h2>
                <p className="text-slate-200 leading-relaxed">{record.trace_elements}</p>
              </div>
            )}

            {/* Abstract */}
            {record.adstract && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">アブストラクト</h2>
                <p className="text-slate-200 leading-relaxed">{record.adstract}</p>
              </div>
            )}

            {/* Summaries */}
            {record.summary_jp && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">要約（日本語）</h2>
                <p className="text-slate-200 leading-relaxed">{record.summary_jp}</p>
              </div>
            )}
            {record.summary_en && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">Summary (English)</h2>
                <p className="text-slate-200 leading-relaxed">{record.summary_en}</p>
              </div>
            )}
            {record.summary_de && (
              <div>
                <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-2">Zusammenfassung (Deutsch)</h2>
                <p className="text-slate-200 leading-relaxed">{record.summary_de}</p>
              </div>
            )}

            {/* Metrics */}
            {(record.sentiment != null || record.trend_score != null) && (
              <div className="pt-4 border-t border-slate-700">
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {record.sentiment != null && <span>センチメント: {record.sentiment}</span>}
                  {record.trend_score != null && <span>トレンドスコア: {record.trend_score}</span>}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
