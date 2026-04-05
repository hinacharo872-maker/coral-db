import Link from 'next/link'

const CATEGORY_COLORS = {
  SPS:      'bg-rose-900 text-rose-300 border border-rose-700',
  LPS:      'bg-amber-900 text-amber-300 border border-amber-700',
  Soft:     'bg-emerald-900 text-emerald-300 border border-emerald-700',
  Zoanthid: 'bg-purple-900 text-purple-300 border border-purple-700',
}

export default function CoralCard({ coral }) {
  const displayName = coral.trade_name || `${coral.genus ?? ''} ${coral.species ?? ''}`.trim()
  const scientificName = coral.genus && coral.species ? `${coral.genus} ${coral.species}` : null
  const categoryColor = CATEGORY_COLORS[coral.coral_category] ?? 'bg-slate-700 text-slate-300 border border-slate-600'

  return (
    <Link href={`/coral/${coral.id}`}>
      <div className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-750 transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-slate-700 hover:border-blue-500 shadow-md h-full flex flex-col group">

        {/* Image placeholder */}
        <div className="relative h-36 bg-gradient-to-br from-blue-950 to-teal-950 flex-shrink-0 overflow-hidden">
          <div className="h-full flex items-center justify-center">
            <span className="text-5xl opacity-60">🪸</span>
          </div>
          {coral.coral_category && (
            <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${categoryColor}`}>
              {coral.coral_category}
            </span>
          )}
          {coral.brand_prefix && (
            <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-900 text-blue-200 border border-blue-700">
              {coral.brand_prefix}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1 gap-2">
          <div>
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
              {displayName}
            </h3>
            {coral.common_name_jp && (
              <p className="text-blue-300 text-xs mt-0.5 line-clamp-1">{coral.common_name_jp}</p>
            )}
            {scientificName && displayName !== scientificName && (
              <p className="text-slate-500 text-xs italic mt-0.5 line-clamp-1">{scientificName}</p>
            )}
          </div>

          {coral.source_shop && (
            <div className="mt-auto pt-2 border-t border-slate-700">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-xs">🏪</span>
                <span className="text-slate-400 text-xs line-clamp-1">{coral.source_shop}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
