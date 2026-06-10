'use client'

import { calculateSlope, predictValue, selectPeriodMeasurements } from '@/lib/proAnalytics'
import { PRO_EVENT_LABELS } from '@/lib/proParameters'

const DAY_MS = 86400000

export default function ProChart({ measurements, events, parameter, periodDays, target }) {
  const selected = selectPeriodMeasurements(measurements, periodDays)
    .filter(measurement => measurement[parameter.key] != null)
    .sort((a, b) => new Date(a.measured_at) - new Date(b.measured_at))
  if (!selected.length) {
    return (
      <article className="border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="font-bold text-white">{parameter.label}</h3>
        <p className="mt-5 text-sm text-zinc-500">この期間の測定値はありません。</p>
      </article>
    )
  }

  const width = 640
  const height = 250
  const pad = { top: 18, right: 24, bottom: 38, left: 52 }
  const firstTime = new Date(selected[0].measured_at).getTime()
  const lastTime = new Date(selected.at(-1).measured_at).getTime()
  const forecastEnd = lastTime + 14 * DAY_MS
  const startTime = periodDays === 'all'
    ? firstTime
    : Math.min(firstTime, Date.now() - Number(periodDays) * DAY_MS)
  const endTime = Math.max(forecastEnd, startTime + DAY_MS)
  const slope = calculateSlope(selected.map(item => ({ date: item.measured_at, value: item[parameter.key] })))
  const current = Number(selected.at(-1)[parameter.key])
  const predicted14 = slope == null ? null : predictValue(current, slope, 14)
  const allValues = [
    ...selected.map(item => Number(item[parameter.key])),
    target?.min,
    target?.max,
    predicted14,
  ].filter(Number.isFinite)
  const rawMin = Math.min(...allValues)
  const rawMax = Math.max(...allValues)
  const margin = Math.max((rawMax - rawMin) * 0.18, parameter.key === 'salinity_sg' ? 0.001 : 0.1)
  const min = rawMin - margin
  const max = rawMax + margin
  const x = time => pad.left + ((time - startTime) / (endTime - startTime)) * (width - pad.left - pad.right)
  const y = value => pad.top + ((max - value) / Math.max(max - min, 0.0001)) * (height - pad.top - pad.bottom)
  const path = selected.map((item, index) => `${index ? 'L' : 'M'} ${x(new Date(item.measured_at).getTime())} ${y(Number(item[parameter.key]))}`).join(' ')
  const visibleEvents = events.filter(event => {
    const time = new Date(event.event_at).getTime()
    return time >= startTime && time <= lastTime
  })

  return (
    <article className="min-w-0 border border-zinc-800 bg-zinc-950 p-3 sm:p-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-bold text-white">{parameter.label}</h3>
        <span className="text-xs text-zinc-400">{parameter.unit}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-3 h-auto w-full" role="img" aria-label={`${parameter.label}の推移と予測`}>
        {target?.min != null && target?.max != null && (
          <rect
            x={pad.left}
            y={y(target.max)}
            width={width - pad.left - pad.right}
            height={Math.max(0, y(target.min) - y(target.max))}
            fill="#052e16"
            opacity="0.75"
          />
        )}
        <line x1={pad.left} y1={height - pad.bottom} x2={width - pad.right} y2={height - pad.bottom} stroke="#3f3f46" />
        {visibleEvents.map(event => {
          const markerX = x(new Date(event.event_at).getTime())
          return (
            <g key={event.id}>
              <line x1={markerX} y1={pad.top} x2={markerX} y2={height - pad.bottom} stroke="#f59e0b" strokeDasharray="4 5" opacity="0.8" />
              <circle cx={markerX} cy={pad.top + 5} r="6" fill="#f59e0b">
                <title>{`${PRO_EVENT_LABELS[event.event_type] || 'イベント'}: ${event.title}`}</title>
              </circle>
            </g>
          )
        })}
        <path d={path} fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {selected.map(item => (
          <circle
            key={`${item.id}-${parameter.key}`}
            cx={x(new Date(item.measured_at).getTime())}
            cy={y(Number(item[parameter.key]))}
            r="5"
            fill="#ecfdf5"
          />
        ))}
        {predicted14 != null && (
          <>
            <line
              x1={x(lastTime)}
              y1={y(current)}
              x2={x(forecastEnd)}
              y2={y(predicted14)}
              stroke="#67e8f9"
              strokeWidth="3"
              strokeDasharray="8 6"
            />
            <circle cx={x(forecastEnd)} cy={y(predicted14)} r="5" fill="#67e8f9" />
          </>
        )}
        <text x={pad.left} y={height - 12} fill="#a1a1aa" fontSize="12">
          {new Date(startTime).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
        </text>
        <text x={width - pad.right} y={height - 12} textAnchor="end" fill="#67e8f9" fontSize="12">14日後予測</text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <span className="text-emerald-300">実測値</span>
        <span className="text-cyan-300">予測線</span>
        <span className="text-amber-300">イベント</span>
        <span className="text-zinc-400">緑帯: 目標範囲</span>
      </div>
    </article>
  )
}
