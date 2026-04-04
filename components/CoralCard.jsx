import Image from 'next/image'
import Link from 'next/link'

// difficulty は数値 (1〜5)
function getDifficultyLabel(level) {
  if (level == null) return null
  if (level <= 2) return { label: '初心者',  color: 'bg-emerald-900 text-emerald-300 border border-emerald-700' }
  if (level === 3) return { label: '中級者',  color: 'bg-amber-900 text-amber-300 border border-amber-700' }
  return               { label: '上級者',  color: 'bg-rose-900 text-rose-300 border border-rose-700' }
}

const SOURCE_COLORS = {
  Scholar:  'bg-sky-900 text-sky-300 border border-sky-700',
  Book:     'bg-violet-900 text-violet-300 border border-violet-700',
  Forum:    'bg-teal-900 text-teal-300 border border-teal-700',
}

export default function CoralCard({ coral }) {
  const imageUrl = coral.image_url
  const difficulty = getDifficultyLabel(coral.difficulty)
  const displayName = coral.species_name || coral.scientific_name
  const sourceColor = SOURCE_COLORS[coral.source_type] ?? 'bg-slate-700 text-slate-300 border border-slate-600'

  return (
    <Link href={`/coral/${coral.id}`}>
      <div className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-750 transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-slate-700 hover:border-blue-500 shadow-md h-full flex flex-col group">

        {/* Image */}
        <div className="relative h-36 bg-gradient-to-br from-blue-950 to-teal-950 flex-shrink-0 overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayName ?? ''}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-5xl opacity-60">🪸</span>
            </div>
          )}
          {/* Source type badge */}
          {coral.source_type && (
            <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${sourceColor}`}>
              {coral.source_type}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-2">

          {/* Names */}
          <div>
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
              {displayName}
            </h3>
            {coral.common_name_jp && (
              <p className="text-blue-300 text-xs mt-0.5 line-clamp-1">{coral.common_name_jp}</p>
            )}
            {coral.common_name && (
              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{coral.common_name}</p>
            )}
            {coral.scientific_name !== displayName && (
              <p className="text-slate-500 text-xs italic mt-0.5 line-clamp-1">{coral.scientific_name}</p>
            )}
          </div>

          {/* Difficulty */}
          {difficulty && (
            <div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficulty.color}`}>
                {difficulty.label}（Lv.{coral.difficulty}）
              </span>
            </div>
          )}

          {/* Key params */}
          <div className="mt-auto pt-2 border-t border-slate-700 space-y-1">
            {/* Light */}
            {coral.light_min != null && coral.light_max != null ? (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs">💡</span>
                <span className="text-slate-300 text-xs">光量</span>
                <span className="text-yellow-300 text-xs font-bold ml-auto">{coral.light_min}–{coral.light_max} PAR</span>
              </div>
            ) : null}
            {/* KH */}
            {coral.kh_min != null && coral.kh_max != null ? (
              <div className="flex items-center gap-1">
                <span className="text-blue-400 text-xs">⚗️</span>
                <span className="text-slate-300 text-xs">KH</span>
                <span className="text-blue-300 text-xs font-bold ml-auto">{coral.kh_min}–{coral.kh_max} dKH</span>
              </div>
            ) : null}
            {/* Water flow */}
            {coral.flow && (
              <div className="flex items-center gap-1">
                <span className="text-cyan-400 text-xs">🌊</span>
                <span className="text-slate-300 text-xs">水流</span>
                <span className="text-cyan-300 text-xs font-bold ml-auto">
                  {{ low: '弱', medium: '中', high: '強' }[coral.flow] ?? coral.flow}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
