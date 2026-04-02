import Link from 'next/link'

const DIFFICULTY_STYLES = {
  beginner:     'bg-green-900 text-green-300',
  intermediate: 'bg-yellow-900 text-yellow-300',
  advanced:     'bg-red-900 text-red-300',
}

const DIFFICULTY_LABELS = {
  beginner:     '初心者',
  intermediate: '中級',
  advanced:     '上級',
}

const TYPE_STYLES = {
  SPS:  'bg-purple-900 text-purple-300',
  LPS:  'bg-blue-900 text-blue-300',
  soft: 'bg-teal-900 text-teal-300',
}

const TYPE_LABELS = {
  SPS:  'SPS',
  LPS:  'LPS',
  soft: 'ソフト',
}

export default function CoralCard({ coral }) {
  return (
    <Link href={`/coral/${coral.id}`}>
      <div className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-700 transition-all duration-200 hover:scale-105 cursor-pointer border border-slate-700 hover:border-blue-500 shadow-md h-full flex flex-col">
        {/* Image */}
        <div className="h-40 bg-gradient-to-br from-blue-900 to-teal-900 flex items-center justify-center overflow-hidden flex-shrink-0">
          {coral.image_url ? (
            <img
              src={coral.image_url}
              alt={coral.scientific_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">🪸</span>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1 mb-2">
            {coral.coral_type && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLES[coral.coral_type] ?? 'bg-gray-700 text-gray-300'}`}>
                {TYPE_LABELS[coral.coral_type] ?? coral.coral_type}
              </span>
            )}
            {coral.difficulty && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[coral.difficulty] ?? 'bg-gray-700 text-gray-300'}`}>
                {DIFFICULTY_LABELS[coral.difficulty] ?? coral.difficulty}
              </span>
            )}
          </div>

          <h3 className="text-white font-semibold text-sm italic leading-tight">{coral.scientific_name}</h3>
          {coral.common_name_en && <p className="text-blue-300 text-sm mt-0.5">{coral.common_name_en}</p>}
          {coral.common_name_ja && <p className="text-blue-400 text-xs mt-0.5">{coral.common_name_ja}</p>}

          <div className="mt-auto pt-2 space-y-1">
            {coral.origin_region && (
              <p className="text-slate-400 text-xs flex items-center gap-1">
                📍 {coral.origin_region}
              </p>
            )}
            {coral.water_temp_min != null && coral.water_temp_max != null && (
              <p className="text-slate-400 text-xs flex items-center gap-1">
                🌡️ {coral.water_temp_min}–{coral.water_temp_max}°C
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
