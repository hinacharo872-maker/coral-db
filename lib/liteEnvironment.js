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

export function hasLiteEnvironment(tank) {
  return Boolean(
    tank?.ph != null
    || tank?.salt_mix_name
    || tank?.filtration_method
    || normalizeEquipment(tank?.lighting_equipment).length
    || normalizeEquipment(tank?.wave_pumps).length
  )
}
