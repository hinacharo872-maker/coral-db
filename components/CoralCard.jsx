import Image from 'next/image'
import Link from 'next/link'

const EVIDENCE_STYLES = {
  high:   'bg-green-900 text-green-300',
  medium: 'bg-yellow-900 text-yellow-300',
  low:    'bg-red-900 text-red-300',
}

export default function CoralCard({ record }) {
  const imageUrl = record.starage_image_url || record.raw_image_url

  return (
    <Link href={`/coral/${record.id}`}>
      <div className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-700 transition-all duration-200 hover:scale-105 cursor-pointer border border-slate-700 hover:border-blue-500 shadow-md h-full flex flex-col">
        {/* Image */}
        <div className="relative h-40 bg-gradient-to-br from-blue-900 to-teal-900 flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={record.title ?? ''}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <span className="text-6xl">🪸</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1 mb-2">
            {record.source_type && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900 text-purple-300">
                {record.source_type}
              </span>
            )}
            {record.language && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900 text-blue-300">
                {record.language}
              </span>
            )}
            {record.evidence_level && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${EVIDENCE_STYLES[record.evidence_level] ?? 'bg-gray-700 text-gray-300'}`}>
                {record.evidence_level}
              </span>
            )}
          </div>

          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">{record.title}</h3>
          {record.authors && (
            <p className="text-blue-400 text-xs mt-1 line-clamp-1">{record.authors}</p>
          )}
          {record.published_date && (
            <p className="text-slate-500 text-xs mt-0.5">
              {record.published_date.slice(0, 4)}
            </p>
          )}
          {record.summary_jp && (
            <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">
              {record.summary_jp}
            </p>
          )}

          <div className="mt-auto pt-2 space-y-1">
            {record.value_category && (
              <p className="text-slate-400 text-xs">📂 {record.value_category}</p>
            )}
            {record.temp_min != null && record.temp_max != null && (
              <p className="text-slate-400 text-xs">🌡️ {record.temp_min}–{record.temp_max}°C</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
