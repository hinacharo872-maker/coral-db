export const GUEST_LITE_STORAGE_KEY = 'reefchart_lite_guest_v1'

const GUEST_LITE_VERSION = 1
const MAX_MEASUREMENTS = 500
const MAX_HISTORY_ITEMS = 200
const MAX_GUEST_PHOTOS = 3

const PROFILE_FIELDS = [
  'display_name',
  'tank_width_cm',
  'tank_depth_cm',
  'tank_height_cm',
  'tank_volume_liters',
  'water_change_frequency_days',
  'water_change_volume_liters',
  'last_water_change_at',
  'ph',
  'salt_mix_name',
  'lighting_equipment',
  'wave_pumps',
  'filtration_method',
]

const MEASUREMENT_FIELDS = [
  'kh_dkh',
  'temperature_c',
  'salinity_sg',
  'no3_ppm',
  'po4_ppm',
]

function defaultCreateId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createInitialData(now) {
  return {
    version: GUEST_LITE_VERSION,
    started_at: now,
    updated_at: now,
    tank: {
      id: 'guest-tank-v1',
      display_name: 'わたしの水槽',
      tank_width_cm: null,
      tank_depth_cm: null,
      tank_height_cm: null,
      tank_volume_liters: null,
      water_change_frequency_days: null,
      water_change_volume_liters: null,
      last_water_change_at: null,
      ph: null,
      salt_mix_name: null,
      lighting_equipment: [],
      wave_pumps: [],
      filtration_method: null,
      created_at: now,
      updated_at: now,
    },
    measurements: [],
    water_changes: [],
    additives: [],
    photos: [],
  }
}

function isGuestData(value) {
  return Boolean(
    value
    && value.version === GUEST_LITE_VERSION
    && value.tank?.id
    && Array.isArray(value.measurements)
    && Array.isArray(value.water_changes)
    && Array.isArray(value.additives),
  )
}

function latestValues(measurements) {
  return Object.fromEntries(MEASUREMENT_FIELDS.map(field => {
    const item = measurements.find(measurement => measurement?.[field] != null)
    return [field, item ? { value: item[field], measured_at: item.measured_at } : null]
  }))
}

export class LocalLiteStore {
  constructor(storage, { now = () => new Date().toISOString(), createId = defaultCreateId } = {}) {
    this.storage = storage
    this.now = now
    this.createId = createId
  }

  read() {
    if (!this.storage) return null
    try {
      const raw = this.storage.getItem(GUEST_LITE_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw)
      return isGuestData(parsed)
        ? { ...parsed, photos: Array.isArray(parsed.photos) ? parsed.photos : [] }
        : null
    } catch {
      return null
    }
  }

  hasData() {
    return this.read() != null
  }

  start() {
    const existing = this.read()
    if (existing) return existing
    return this.write(createInitialData(this.now()))
  }

  saveTankProfile(values) {
    const data = this.start()
    for (const field of PROFILE_FIELDS) {
      if (Object.hasOwn(values, field)) {
        data.tank[field] = Array.isArray(values[field]) ? [...values[field]] : values[field]
      }
    }
    data.tank.updated_at = this.now()
    return this.write(data)
  }

  addMeasurement(values) {
    const data = this.start()
    const measuredAt = values.measured_at || this.now()
    const measurement = {
      id: this.createId(),
      tank_id: data.tank.id,
      measured_at: measuredAt,
    }
    for (const field of MEASUREMENT_FIELDS) {
      measurement[field] = values[field] ?? null
    }
    data.measurements = [measurement, ...data.measurements].slice(0, MAX_MEASUREMENTS)
    this.write(data)
    return measurement
  }

  addWaterChange(values) {
    const data = this.start()
    const changedAt = values.changed_at || this.now()
    const item = {
      id: this.createId(),
      tank_id: data.tank.id,
      changed_at: changedAt,
      change_volume_liters: values.change_volume_liters ?? null,
      note: values.note || null,
    }
    data.water_changes = [item, ...data.water_changes].slice(0, MAX_HISTORY_ITEMS)
    data.tank.last_water_change_at = changedAt
    if (Object.hasOwn(values, 'tank_volume_liters')) data.tank.tank_volume_liters = values.tank_volume_liters
    if (Object.hasOwn(values, 'water_change_frequency_days')) data.tank.water_change_frequency_days = values.water_change_frequency_days
    if (Object.hasOwn(values, 'change_volume_liters')) data.tank.water_change_volume_liters = values.change_volume_liters
    data.tank.updated_at = this.now()
    this.write(data)
    return item
  }

  addAdditive(values) {
    const data = this.start()
    const item = {
      id: this.createId(),
      tank_id: data.tank.id,
      brand_snapshot: values.brand_snapshot || null,
      product_name_snapshot: values.product_name_snapshot || null,
      amount_text: values.amount_text || null,
      frequency: values.frequency || 'unknown',
      usage_note: values.usage_note || null,
      is_active: values.is_active !== false,
      created_at: values.created_at || this.now(),
    }
    data.additives = [item, ...data.additives].slice(0, MAX_HISTORY_ITEMS)
    this.write(data)
    return item
  }

  addPhoto(values) {
    const data = this.start()
    const item = {
      id: this.createId(),
      tank_id: data.tank.id,
      photo_url: values.photo_url,
      taken_at: values.taken_at || this.now(),
      note: values.note || null,
      created_at: this.now(),
    }
    data.photos = [item, ...data.photos].slice(0, MAX_GUEST_PHOTOS)
    this.write(data)
    return item
  }

  buildShopRecord() {
    const data = this.read()
    if (!data) return null
    return {
      tank: data.tank,
      parameterLatest: latestValues(data.measurements),
      additives: data.additives.filter(item => item.is_active),
      waterChanges: data.water_changes,
      photo: data.photos[0] ?? null,
      isGuest: true,
    }
  }

  write(data) {
    const next = { ...data, version: GUEST_LITE_VERSION, updated_at: this.now() }
    this.storage.setItem(GUEST_LITE_STORAGE_KEY, JSON.stringify(next))
    return next
  }
}
