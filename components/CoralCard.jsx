import Link from 'next/link'

const CATEGORY_COLORS = {
  SPS: 'bg-rose-950 text-rose-200 border border-rose-700',
  LPS: 'bg-amber-950 text-amber-200 border border-amber-700',
  Soft: 'bg-emerald-950 text-emerald-200 border border-emerald-700',
  Zoanthid: 'bg-violet-950 text-violet-200 border border-violet-700',
}

const ISSUE_LABELS = {
  temperature: '水温',
  salinity: '比重',
  ph: 'pH',
  kh: 'KH',
  calcium: 'Ca',
  magnesium: 'Mg',
  nitrate: 'NO3',
  phosphate: 'PO4',
}

function formatIssue(issue) {
  const label = ISSUE_LABELS[issue.key] ?? issue.label ?? issue.key
  return `${label}${issue.status === 'low' ? '低すぎ' : '高すぎ'}`
}

function MatchBadge({ match }) {
  if (!match) {
    return (
      <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] font-semibold text-slate-400">
        水質未判定
      </span>
    )
  }

  if (match.is_compatible) {
    return (
      <span className="rounded-full border border-emerald-600 bg-emerald-950 px-2 py-1 text-[11px] font-semibold text-emerald-200">
        適合
      </span>
    )
  }

  return (
    <span className="rounded-full border border-rose-600 bg-rose-950 px-2 py-1 text-[11px] font-semibold text-rose-200">
      注意 {match.risk_count}項目
    </span>
  )
}

export default function CoralCard({ coral, match = null }) {
  const displayName = coral.trade_name || `${coral.genus ?? ''} ${coral.species ?? ''}`.trim()
  const scientificName = coral.genus && coral.species ? `${coral.genus} ${coral.species}` : null
  const categoryColor = CATEGORY_COLORS[coral.coral_category] ?? 'bg-slate-800 text-slate-300 border border-slate-600'
  const issues = Array.isArray(match?.issues) ? match.issues.slice(0, 2) : []

  return (
    <Link href={`/coral/${coral.id}`}>
      <div className="bg-slate-900 rounded-lg overflow-hidden hover:bg-slate-800 transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-slate-800 hover:border-cyan-500 shadow-md h-full flex flex-col group">
        <div className="relative h-36 bg-gradient-to-br from-cyan-950 to-slate-950 flex-shrink-0 overflow-hidden">
          <div className="h-full flex items-center justify-center">
            <span className="text-sm font-bold tracking-[0.2em] text-cyan-200/70">CORAL</span>
          </div>
          {coral.coral_category && (
            <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${categoryColor}`}>
              {coral.coral_category}
            </span>
          )}
          {coral.brand_prefix && (
            <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-200 border border-cyan-700">
              {coral.brand_prefix}
            </span>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1 gap-2">
          <div>
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">
              {displayName}
            </h3>
            {coral.common_name_jp && (
              <p className="text-cyan-300 text-xs mt-0.5 line-clamp-1">{coral.common_name_jp}</p>
            )}
            {scientificName && displayName !== scientificName && (
              <p className="text-slate-500 text-xs italic mt-0.5 line-clamp-1">{scientificName}</p>
            )}
          </div>

          {coral.source_shop && (
            <div className="mt-auto pt-2 border-t border-slate-700">
              <div className="flex items-center gap-1">
                <span className="text-slate-500 text-xs">入手元</span>
                <span className="text-slate-400 text-xs line-clamp-1">{coral.source_shop}</span>
              </div>
            </div>
          )}

          <div className="space-y-2 border-t border-slate-800 pt-2">
            <MatchBadge match={match} />
            {issues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {issues.map(issue => (
                  <span key={`${issue.key}-${issue.status}`} className="rounded border border-rose-700/80 bg-rose-950/70 px-1.5 py-0.5 text-[10px] font-semibold text-rose-200">
                    {formatIssue(issue)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
