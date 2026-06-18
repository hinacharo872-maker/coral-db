'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import { buildLiteEnvironmentParts, hasLiteEnvironment } from '@/lib/liteEnvironment'

const PART_ORDER = ['tank', 'lighting', 'wave', 'filtration', 'salt', 'ph']

export default function LiteTankEnvironmentDiagram({ tank }) {
  const detailsId = useId()
  const parts = useMemo(() => buildLiteEnvironmentParts(tank), [tank])
  const partMap = useMemo(() => new Map(parts.map(part => [part.key, part])), [parts])
  const firstKey = PART_ORDER.find(key => partMap.has(key)) || null
  const [activeKey, setActiveKey] = useState(firstKey)

  useEffect(() => {
    if (!activeKey || !partMap.has(activeKey)) setActiveKey(firstKey)
  }, [activeKey, firstKey, partMap])

  if (!hasLiteEnvironment(tank)) return null

  const activePart = partMap.get(activeKey) || partMap.get(firstKey)
  const lighting = partMap.get('lighting')
  const tankPart = partMap.get('tank')
  const wave = partMap.get('wave')
  const filtration = partMap.get('filtration')
  const salt = partMap.get('salt')
  const ph = partMap.get('ph')

  function partButton(part, className, children) {
    if (!part) return null
    return (
      <button
        type="button"
        aria-pressed={activePart?.key === part.key}
        aria-controls={detailsId}
        onClick={() => setActiveKey(part.key)}
        className={`${className} min-h-12 min-w-0 border-2 px-3 py-2 text-left transition focus:outline-none focus:ring-4 focus:ring-cyan-300/60 ${activePart?.key === part.key ? 'border-cyan-300 bg-cyan-950 text-white' : 'border-slate-600 bg-slate-900 text-slate-100'}`}
      >
        {children}
      </button>
    )
  }

  return (
    <div className="min-w-0 overflow-hidden border border-slate-600 bg-slate-950 p-3 sm:p-5">
      <p className="text-base font-bold text-white">水槽図</p>
      <p className="mt-1 text-sm leading-6 text-slate-300">気になる場所をタップすると、詳しい内容が表示されます。</p>

      <div className="mx-auto mt-4 max-w-2xl" aria-label="飼育環境の水槽図">
        {partButton(lighting, 'mx-auto flex w-full max-w-sm items-center justify-center gap-3 text-center', (
          <>
            <PartIcon type="lighting" />
            <span className="min-w-0">
              <span className="block text-sm text-cyan-200">照明</span>
              <span className="block break-words text-base font-bold">{lighting?.value}</span>
            </span>
          </>
        ))}

        {lighting && <div className="mx-auto h-5 w-1 bg-cyan-300/50" aria-hidden="true" />}

        <div className={`grid items-stretch gap-2 ${wave ? 'grid-cols-[56px_minmax(0,1fr)_56px]' : 'grid-cols-1'}`}>
          {wave && partButton(wave, 'flex items-center justify-center !px-1 text-center', (
            <span>
              <PartIcon type="wave" />
              <span className="mt-1 block text-xs font-bold">水流</span>
            </span>
          ))}

          {tankPart ? partButton(tankPart, 'relative min-h-44 overflow-hidden !border-4 !border-slate-400 !bg-cyan-950 !p-0 text-center', (
            <TankBody label={tankPart.value} active={activePart?.key === 'tank'} />
          )) : (
            <div className="relative min-h-44 overflow-hidden border-4 border-slate-500 bg-cyan-950" aria-hidden="true">
              <TankBody />
            </div>
          )}

          {wave && (
            <div className="flex min-h-12 items-center justify-center border-2 border-slate-700 bg-slate-900 text-cyan-200" aria-hidden="true">
              <PartIcon type="wave" mirrored />
            </div>
          )}
        </div>

        {filtration && <div className="mx-auto h-3 w-1 bg-slate-500" aria-hidden="true" />}
        {partButton(filtration, 'mx-auto flex w-full max-w-md items-center justify-center gap-3 text-center', (
          <>
            <PartIcon type="filtration" />
            <span className="min-w-0">
              <span className="block text-sm text-cyan-200">濾過方式</span>
              <span className="block break-words text-base font-bold">{filtration?.value}</span>
            </span>
          </>
        ))}

        {(salt || ph) && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {partButton(salt, 'flex items-center gap-3', (
              <>
                <PartIcon type="salt" />
                <span className="min-w-0">
                  <span className="block text-sm text-cyan-200">人工海水</span>
                  <span className="block break-words text-base font-bold">{salt?.value}</span>
                </span>
              </>
            ))}
            {partButton(ph, 'flex items-center gap-3', (
              <>
                <PartIcon type="ph" />
                <span>
                  <span className="block text-sm text-cyan-200">pH</span>
                  <span className="block text-xl font-bold">{ph?.value}</span>
                </span>
              </>
            ))}
          </div>
        )}
      </div>

      {activePart && (
        <div id={detailsId} aria-live="polite" className="mt-4 border-l-4 border-cyan-300 bg-slate-900 p-4">
          <p className="text-lg font-bold text-white">{activePart.label}</p>
          <div className="mt-2 space-y-1">
            {activePart.details.map(detail => <p key={detail} className="break-words text-base leading-7 text-slate-100">{detail}</p>)}
          </div>
        </div>
      )}
    </div>
  )
}

function TankBody({ label, active = false }) {
  return (
    <span className="absolute inset-0 block">
      <span className="absolute inset-x-0 bottom-0 h-[82%] bg-gradient-to-b from-cyan-700/70 to-blue-950" />
      <span className="absolute bottom-3 left-[17%] h-12 w-20 rounded-t-full bg-stone-700" />
      <span className="absolute bottom-3 right-[18%] h-8 w-14 rounded-t-full bg-stone-600" />
      <span className="absolute left-[24%] top-[38%] h-3 w-3 rounded-full border-2 border-cyan-200/80" />
      <span className="absolute right-[29%] top-[52%] h-2 w-2 rounded-full border border-cyan-200/80" />
      <span className={`absolute inset-x-3 top-3 border px-3 py-2 text-base font-bold ${active ? 'border-cyan-200 bg-cyan-900 text-white' : 'border-slate-400 bg-slate-950/80 text-slate-100'}`}>
        {label || '水槽本体'}
      </span>
    </span>
  )
}

function PartIcon({ type, mirrored = false }) {
  const path = {
    lighting: 'M4 7h16v4H4zM7 14l-2 6m6-6-1 6m4-6 1 6m2-6 2 6',
    wave: 'M4 8h8l-3-3m3 3-3 3m11 5h-8l3-3m-3 3 3 3',
    filtration: 'M5 5h14v14H5zM10 5v14m4-14v14M7 9h2m6 4h2',
    salt: 'M7 4h10l2 16H5L7 4zm2 5h6m-7 4h8',
    ph: 'M12 3c3 4 6 7 6 11a6 6 0 01-12 0c0-4 3-7 6-11z',
  }[type]
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-8 w-8 shrink-0 text-cyan-200 ${mirrored ? '-scale-x-100' : ''}`}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
