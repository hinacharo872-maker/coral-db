export const PRO_PARAMETERS = Object.freeze([
  { key: 'kh_dkh', label: 'KH（炭酸塩硬度）', shortLabel: 'KH', unit: 'dKH', step: '0.1', core: true, target: [7, 9] },
  { key: 'ca_ppm', label: 'Ca（カルシウム）', shortLabel: 'Ca', unit: 'ppm', step: '1', core: true, target: [400, 460] },
  { key: 'mg_ppm', label: 'Mg（マグネシウム）', shortLabel: 'Mg', unit: 'ppm', step: '1', core: true, target: [1250, 1400] },
  { key: 'ph', label: 'pH', shortLabel: 'pH', unit: '', step: '0.01', target: [7.8, 8.5] },
  { key: 'temperature_c', label: '水温', shortLabel: '水温', unit: '℃', step: '0.1', target: [24, 27] },
  { key: 'salinity_sg', label: '塩分濃度', shortLabel: '塩分', unit: 'SG', step: '0.001', target: [1.023, 1.027] },
  { key: 'no3_ppm', label: '硝酸塩（NO3）', shortLabel: 'NO3', unit: 'ppm', step: '0.1', target: [1, 20] },
  { key: 'po4_ppm', label: 'リン酸塩（PO4）', shortLabel: 'PO4', unit: 'ppm', step: '0.01', target: [0.02, 0.12] },
  { key: 'nh3_nh4_ppm', label: 'アンモニア（NH3/NH4）', shortLabel: 'NH3/NH4', unit: 'ppm', step: '0.01', target: [0, 0.02] },
  { key: 'no2_ppm', label: '亜硝酸塩（NO2）', shortLabel: 'NO2', unit: 'ppm', step: '0.01', target: [0, 0.05] },
])

export const PRO_CORE_PARAMETERS = PRO_PARAMETERS.filter(parameter => parameter.core)
export const PRO_PARAMETER_BY_KEY = new Map(PRO_PARAMETERS.map(parameter => [parameter.key, parameter]))

export const PRO_EVENT_TYPES = Object.freeze([
  ['water_change', '水換え'],
  ['additive_started', '添加剤開始'],
  ['additive_stopped', '添加剤停止'],
  ['additive_amount_changed', '添加量変更'],
  ['lighting_changed', '照明変更'],
  ['feeding_changed', '給餌変更'],
  ['livestock_added', '生体追加'],
  ['coral_added', 'サンゴ追加'],
  ['maintenance', '掃除・メンテナンス'],
  ['trouble', 'トラブル'],
  ['other', 'その他'],
])

export const PRO_EVENT_LABELS = Object.freeze(Object.fromEntries(PRO_EVENT_TYPES))

export function parseNullableNumber(value) {
  if (value == null || String(value).trim() === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function hasAnyProMeasurement(values) {
  return PRO_PARAMETERS.some(parameter => parseNullableNumber(values?.[parameter.key]) != null)
}
