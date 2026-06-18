import { formatEquipment, hasLiteEnvironment, normalizeEquipment } from '@/lib/liteEnvironment'

export default function LiteEnvironmentSummary({ tank }) {
  if (!hasLiteEnvironment(tank)) return null

  const facts = [
    tank.filtration_method && { label: '濾過方式', value: tank.filtration_method },
    tank.salt_mix_name && { label: '人工海水', value: tank.salt_mix_name },
    normalizeEquipment(tank.lighting_equipment).length && {
      label: '照明',
      value: normalizeEquipment(tank.lighting_equipment).map(formatEquipment).join(' / '),
    },
    normalizeEquipment(tank.wave_pumps).length && {
      label: 'ウェーブポンプ',
      value: normalizeEquipment(tank.wave_pumps).map(formatEquipment).join(' / '),
    },
    tank.ph != null && { label: 'pH', value: Number(tank.ph).toFixed(2).replace(/0$/, '') },
  ].filter(Boolean)

  return (
    <section className="mt-4 border-y border-slate-700 py-4">
      <h2 className="text-sm font-bold text-white">飼育環境</h2>
      <dl className="mt-2 grid gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-5">
        {facts.map(fact => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-xs text-slate-400">{fact.label}</dt>
            <dd className="mt-1 break-words text-base font-bold text-white">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
