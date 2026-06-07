export const LITE_MEASUREMENT_STEPS = [
  {
    key: 'kh_dkh',
    label: 'KH',
    unit: 'dKH',
    step: '0.1',
    placeholder: '7.8',
    help: '測定できたときだけ入力してください。',
  },
  {
    key: 'temperature_c',
    label: '水温',
    unit: '℃',
    step: '0.1',
    placeholder: '25.0',
    help: '水槽の温度を入力します。',
  },
  {
    key: 'salinity_sg',
    label: '比重',
    unit: 'SG',
    step: '0.001',
    placeholder: '1.025',
    help: '比重計に表示された値を入力します。',
  },
  {
    key: 'no3_ppm',
    label: 'NO3',
    unit: 'ppm',
    step: '0.1',
    placeholder: '10',
    help: '硝酸塩を測定したときだけ入力してください。',
  },
  {
    key: 'po4_ppm',
    label: 'PO4',
    unit: 'ppm',
    step: '0.01',
    placeholder: '0.05',
    help: 'リン酸塩を測定したときだけ入力してください。',
  },
]

export function parseLiteMeasurementValue(value) {
  if (value == null || String(value).trim() === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export function hasAnyLiteMeasurement(values) {
  return LITE_MEASUREMENT_STEPS.some(step => parseLiteMeasurementValue(values?.[step.key]) != null)
}

export function buildLiteMeasurementPayload(values) {
  return Object.fromEntries(
    LITE_MEASUREMENT_STEPS.map(step => [
      step.key,
      parseLiteMeasurementValue(values?.[step.key]),
    ]),
  )
}

export function findPreviousLiteValues(records = []) {
  return Object.fromEntries(
    LITE_MEASUREMENT_STEPS.map(step => {
      const record = records.find(item => item?.[step.key] != null)
      return [step.key, record?.[step.key] ?? null]
    }),
  )
}
