export const SALT_MIX_OPTIONS = Object.freeze([
  'Red Sea Blue Bucket',
  'Red Sea Coral Pro',
  'Tropic Marin Pro Reef',
  'Instant Ocean',
  'Reef Crystals',
  'Aquaforest Reef Salt',
])

export const LIGHTING_OPTIONS = Object.freeze([
  'AI Prime',
  'AI Hydra',
  'Radion',
  'Kessil',
  'Spectra SP200',
  'ReefLED',
])

export const WAVE_PUMP_OPTIONS = Object.freeze([
  'MP10',
  'MP40',
  'Nero 3',
  'Nero 5',
  'Jebao',
  'Tunze',
])

export const FILTRATION_OPTIONS = Object.freeze([
  'オーバーフロー',
  '外部濾過',
  'オールインワン',
  '背面濾過',
  '上部濾過',
  '底面濾過',
])

export function normalizeEquipment(items = []) {
  if (!Array.isArray(items)) return []
  return items
    .map(item => ({
      name: String(item?.name || '').trim().slice(0, 120),
      quantity: Math.min(99, Math.max(1, Number.parseInt(item?.quantity, 10) || 1)),
    }))
    .filter(item => item.name)
}

export function formatEquipment(item) {
  if (!item?.name) return ''
  const quantity = Math.max(1, Number.parseInt(item.quantity, 10) || 1)
  return quantity > 1 ? `${item.name} ×${quantity}` : item.name
}

export function formatPh(value) {
  if (value == null || value === '') return ''
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return ''
  return numericValue.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

export function buildLiteEnvironmentParts(tank = {}) {
  const lights = normalizeEquipment(tank.lighting_equipment)
  const wavePumps = normalizeEquipment(tank.wave_pumps)
  const ph = formatPh(tank.ph)
  const volume = Number(tank.tank_volume_liters)
  const hasVolume = tank.tank_volume_liters != null && Number.isFinite(volume)
  const parts = []

  if (hasVolume || tank.filtration_method) {
    parts.push({
      key: 'tank',
      label: '水槽本体',
      value: hasVolume ? `${volume.toLocaleString('ja-JP')} L` : '水槽',
      details: [
        hasVolume && `水量：${volume.toLocaleString('ja-JP')} L`,
        tank.filtration_method && `濾過方式：${tank.filtration_method}`,
      ].filter(Boolean),
    })
  }

  if (lights.length) {
    parts.push({
      key: 'lighting',
      label: '照明',
      value: lights.map(formatEquipment).join(' / '),
      details: lights.map(formatEquipment),
    })
  }

  if (wavePumps.length) {
    parts.push({
      key: 'wave',
      label: 'ウェーブポンプ',
      value: wavePumps.map(formatEquipment).join(' / '),
      details: wavePumps.map(formatEquipment),
    })
  }

  if (tank.filtration_method) {
    parts.push({
      key: 'filtration',
      label: '濾過方式',
      value: tank.filtration_method,
      details: [`濾過方式：${tank.filtration_method}`],
    })
  }

  if (tank.salt_mix_name) {
    parts.push({
      key: 'salt',
      label: '人工海水',
      value: tank.salt_mix_name,
      details: [tank.salt_mix_name],
    })
  }

  if (ph) {
    parts.push({
      key: 'ph',
      label: 'pH',
      value: ph,
      details: [`pH ${ph}`],
    })
  }

  return parts
}

export function hasLiteEnvironment(tank) {
  return Boolean(
    tank?.ph != null
    || tank?.salt_mix_name
    || tank?.filtration_method
    || normalizeEquipment(tank?.lighting_equipment).length
    || normalizeEquipment(tank?.wave_pumps).length
  )
}
