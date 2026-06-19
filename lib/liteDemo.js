const DAY_MS = 86400000

function dateDaysAgo(daysAgo, hour = 10) {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString()
}

export const NAGAREHANA_DEMO_ID = 'nagarehana'

export function createNagarehanaDemo() {
  const measurements = [
    { daysAgo: 13, kh_dkh: 8.2, temperature_c: 25.1, salinity_sg: 1.025, no3_ppm: 8, po4_ppm: 0.05 },
    { daysAgo: 10, kh_dkh: 8.0, temperature_c: 25.4, salinity_sg: 1.025, no3_ppm: 10, po4_ppm: 0.06 },
    { daysAgo: 7, kh_dkh: 7.8, temperature_c: 25.2, salinity_sg: 1.024, no3_ppm: 12, po4_ppm: 0.08 },
    { daysAgo: 4, kh_dkh: 7.5, temperature_c: 25.6, salinity_sg: 1.025, no3_ppm: 15, po4_ppm: 0.11 },
    { daysAgo: 1, kh_dkh: 7.2, temperature_c: 25.3, salinity_sg: 1.025, no3_ppm: 18, po4_ppm: 0.14 },
  ].map((measurement, index) => ({
    id: `nagarehana-demo-${index + 1}`,
    measured_at: dateDaysAgo(measurement.daysAgo),
    ...measurement,
  }))

  const latest = measurements.at(-1)

  return {
    isDemo: true,
    demoName: 'ナガレハナ不調デモ',
    tank: {
      id: 'nagarehana-demo-tank',
      display_name: '120L LPS水槽',
      tank_width_cm: 60,
      tank_depth_cm: 45,
      tank_height_cm: 45,
      tank_volume_liters: 120,
      water_change_frequency_days: 14,
      water_change_volume_liters: 20,
      last_water_change_at: dateDaysAgo(8),
      ph: 8.2,
      salt_mix_name: 'Red Sea Blue Bucket',
      lighting_equipment: [{ name: 'Spectra SP200', quantity: 2 }],
      wave_pumps: [{ name: 'MP40', quantity: 2 }],
      filtration_method: 'オーバーフロー',
      note: 'ナガレハナサンゴの開きが悪くなってきたため相談予定',
    },
    measurements,
    parameterLatest: {
      kh_dkh: { value: latest.kh_dkh, measured_at: latest.measured_at },
      temperature_c: { value: latest.temperature_c, measured_at: latest.measured_at },
      salinity_sg: { value: latest.salinity_sg, measured_at: latest.measured_at },
      no3_ppm: { value: latest.no3_ppm, measured_at: latest.measured_at },
      po4_ppm: { value: latest.po4_ppm, measured_at: latest.measured_at },
    },
    additives: [
      {
        additive_id: '3c610650-b4ef-45f2-95ff-b11a543bcc97',
        brand_snapshot: 'Red Sea',
        product_name_snapshot: 'Reef Foundation B',
        amount_text: '6 ml',
        frequency: 'daily',
      },
      {
        additive_id: null,
        brand_snapshot: 'Fauna Marin',
        product_name_snapshot: 'Ultra Min S',
        amount_text: '2 ml',
        frequency: 'three_times_weekly',
      },
      {
        additive_id: null,
        brand_snapshot: '',
        product_name_snapshot: 'ReBiotic 100%',
        amount_text: '',
        frequency: 'weekly',
      },
    ],
    photos: [
      {
        photo_url: '/demo/nagarehana/healthy.jpg',
        taken_at: dateDaysAgo(13, 16),
        note: '元気だった頃。ポリプがよく開いていました。',
      },
      {
        photo_url: '/demo/nagarehana/declining.jpg',
        taken_at: dateDaysAgo(5, 16),
        note: '開きが悪くなった日。以前より縮んで見えます。',
      },
      {
        photo_url: '/demo/nagarehana/today.jpg',
        taken_at: dateDaysAgo(0, 16),
        note: '今日の状態。さらに開きが悪く、ショップへ相談予定です。',
      },
    ],
    checks: [
      'KH（炭酸塩硬度）が下がり気味です',
      '硝酸塩（NO3）が上がり気味です',
      'リン酸塩（PO4）が高めの状態が続いています',
      '水換え頻度・給餌量・添加剤の使い方をショップと確認してください',
    ],
  }
}

export function daysBetween(first, second) {
  return Math.round((new Date(second).getTime() - new Date(first).getTime()) / DAY_MS)
}
