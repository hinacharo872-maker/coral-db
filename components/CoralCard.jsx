import Image from 'next/image'
import Link from 'next/link'

const DIFFICULTY_CONFIG = {
  beginner:     { label: '初心者',  color: 'bg-emerald-900 text-emerald-300 border border-emerald-700' },
  intermediate: { label: '中級者',  color: 'bg-amber-900 text-amber-300 border border-amber-700' },
  advanced:     { label: '上級者',  color: 'bg-rose-900 text-rose-300 border border-rose-700' },
}

const TYPE_CONFIG = {
  SPS:  { color: 'bg-sky-900 text-sky-300 border border-sky-700' },
  LPS:  { color: 'bg-violet-900 text-violet-300 border border-violet-700' },
  soft: { label: 'ソフト', color: 'bg-teal-900 text-teal-300 border border-teal-700' },
}

const LIGHT_LABELS = {
  low:       { label: '低',   icon: '○' },
  medium:    { label: '中',   icon: '◑' },
  high:      { label: '強',   icon: '●' },
  very_high: { label: '超強', icon: '★' },
}

export default function CoralCard({ coral }) {
  const imageUrl = coral.image_url
  const difficulty = DIFFICULTY_CONFIG[coral.difficulty]
  const type = TYPE_CONFIG[coral.coral_type]
  const light = LIGHT_LABELS[coral.light_intensity]
  const displayName = coral.common_name_ja || coral.common_name_en || coral.scientific_name

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
          {/* Type badge over image */}
          {type && (
            <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${type.color}`}>
              {type.label ?? coral.coral_type}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-2">

          {/* Names */}
          <div>
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">
              {displayName}
            </h3>
            {coral.common_name_ja && coral.common_name_en && (
              <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{coral.common_name_en}</p>
            )}
            <p className="text-slate-500 text-xs italic mt-0.5 line-clamp-1">{coral.scientific_name}</p>
          </div>

          {/* Difficulty */}
          {difficulty && (
            <div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficulty.color}`}>
                {difficulty.label}
              </span>
            </div>
          )}

          {/* Key params */}
          <div className="mt-auto pt-2 border-t border-slate-700 grid grid-cols-2 gap-x-2 gap-y-1">
            {/* Light */}
            {light && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-xs">💡</span>
                <span className="text-slate-300 text-xs font-medium">光量</span>
                <span className="text-yellow-300 text-xs font-bold ml-auto">{light.label}</span>
              </div>
            )}
            {/* KH */}
            {coral.kh_min != null && coral.kh_max != null ? (
              <div className="flex items-center gap-1">
                <span className="text-blue-400 text-xs">⚗️</span>
                <span className="text-slate-300 text-xs font-medium">KH</span>
                <span className="text-blue-300 text-xs font-bold ml-auto">{coral.kh_min}–{coral.kh_max}</span>
              </div>
            ) : coral.ph_min != null && coral.ph_max != null ? (
              <div className="flex items-center gap-1">
                <span className="text-blue-400 text-xs">🔬</span>
                <span className="text-slate-300 text-xs font-medium">pH</span>
                <span className="text-blue-300 text-xs font-bold ml-auto">{coral.ph_min}–{coral.ph_max}</span>
              </div>
            ) : null}
            {/* Water flow */}
            {coral.flow && (
              <div className="flex items-center gap-1 col-span-2">
                <span className="text-cyan-400 text-xs">🌊</span>
                <span className="text-slate-300 text-xs font-medium">水流</span>
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
