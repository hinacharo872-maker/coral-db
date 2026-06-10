const DAY_MS = 86400000

function atDaysAgo(daysAgo) {
  return new Date(Date.now() - daysAgo * DAY_MS).toISOString()
}

export function createProDemo() {
  const series = [
    [29, 8.5, 455, 1380, 12, 0.09],
    [25, 8.3, 448, 1370, 13, 0.09],
    [21, 8.2, 443, 1362, 15, 0.10],
    [17, 8.0, 438, 1352, 15, 0.09],
    [13, 7.9, 433, 1345, 12, 0.08],
    [9, 7.7, 427, 1337, 10, 0.07],
    [5, 7.6, 422, 1329, 8, 0.06],
    [1, 7.4, 417, 1320, 6, 0.05],
  ]
  const measurements = series.map(([daysAgo, kh, ca, mg, no3, po4], index) => ({
    id: `pro-demo-measurement-${index}`,
    measured_at: atDaysAgo(daysAgo),
    kh_dkh: kh,
    ca_ppm: ca,
    mg_ppm: mg,
    ph: 8.12 + index * 0.01,
    temperature_c: 25.2,
    salinity_sg: 1.025,
    no3_ppm: no3,
    po4_ppm: po4,
    nh3_nh4_ppm: 0,
    no2_ppm: 0,
  }))
  const events = [
    {
      id: 'pro-demo-event-1',
      event_at: atDaysAgo(16),
      event_type: 'water_change',
      title: '水換え 25 L',
      description: '定期水換え',
      related_parameter: 'kh_dkh',
    },
    {
      id: 'pro-demo-event-2',
      event_at: atDaysAgo(14),
      event_type: 'additive_started',
      title: 'Bacto Blend開始',
      description: 'メーカー説明の範囲で開始',
      related_parameter: 'no3_ppm',
    },
    {
      id: 'pro-demo-event-3',
      event_at: atDaysAgo(8),
      event_type: 'lighting_changed',
      title: '照明ピークを5%調整',
      description: '白チャンネルのみ変更',
      related_parameter: null,
    },
  ]
  return {
    isDemo: true,
    tank: {
      id: 'pro-demo-tank',
      display_name: 'SPS Consumption Lab',
      tank_volume_liters: 180,
      target_ranges: {
        kh_dkh: { min: 7, max: 9 },
        ca_ppm: { min: 400, max: 460 },
        mg_ppm: { min: 1250, max: 1400 },
        no3_ppm: { min: 2, max: 15 },
        po4_ppm: { min: 0.02, max: 0.10 },
      },
    },
    measurements,
    events,
  }
}
