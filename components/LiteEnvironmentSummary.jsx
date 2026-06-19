import LiteTankEnvironmentDiagram from '@/components/LiteTankEnvironmentDiagram'
import {
  formatEquipment,
  formatPh,
  formatTankDimensions,
  formatTankVolume,
  hasLiteEnvironment,
  normalizeEquipment,
} from '@/lib/liteEnvironment'

export default function LiteEnvironmentSummary({ tank }) {
  if (!hasLiteEnvironment(tank)) return null

  const facts = [
    formatTankDimensions(tank) && { label: '水槽サイズ', value: formatTankDimensions(tank) },
    formatTankVolume(tank.tank_volume_liters) && { label: '実水量', value: formatTankVolume(tank.tank_volume_liters) },
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
    formatPh(tank.ph) && { label: 'pH', value: formatPh(tank.ph) },
  ].filter(Boolean)

  return (
    <section className="mt-5 border-y border-slate-700 py-5">
      <h2 className="text-xl font-bold text-white">飼育環境</h2>
      <p className="mt-1 text-sm text-slate-400">水槽図をタップすると、機材や水槽の情報を確認できます。</p>
      <div className="mt-4">
        <LiteTankEnvironmentDiagram tank={tank} />
      </div>
      <h3 className="mt-5 text-base font-bold text-white">登録内容</h3>
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
