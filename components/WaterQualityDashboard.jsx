'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const TEXT = {
  ja: {
    privateLog: 'PRIVATE REEF LOG',
    loginTitle: '水質記録へログイン',
    loginHelp: '水質、添加剤、水換え履歴をアカウントごとに保存します。',
    email: 'メールアドレス',
    sendLogin: 'ログインリンクを送る',
    loginSent: 'ログインリンクをメールへ送りました。',
    logout: '退出',
    tankFallback: '水質管理',
    loadTankError: '水槽データを読み込めませんでした。',
    loadWaterError: '水質ログを読み込めませんでした。',
    loadInventoryError: '添加剤の在庫を読み込めませんでした。',
    loadDoseError: '添加ログを読み込めませんでした。',
    loadWaterChangeError: '水換え履歴を読み込めませんでした。',
    saveTankError: '水槽データを保存できませんでした。',
    saveWaterError: '水質ログを保存できませんでした。',
    saveInventoryError: '持っている添加剤を登録できませんでした。',
    archiveInventoryError: '添加剤を一覧から外せませんでした。',
    saveDoseError: '添加ログを保存できませんでした。',
    saveDosePartialError: '添加ログは保存しましたが、残量の更新に失敗しました。',
    saveWaterChangeError: '水換え履歴を保存できませんでした。',
    lowStockTitle: '添加剤の残量が少なくなっています',
    otherItems: count => `ほか${count}件`,
    tankData: 'Tankデータ',
    tankSub: '水量と直近の水換え',
    volume: '水量',
    save: '保存',
    recentWaterChange: '直近の水換え',
    notRegistered: '未登録',
    todayWater: '今日の水質',
    waterNotes: '換水、添加剤、生体の様子など',
    saving: '保存中...',
    saveWater: '水質を記録',
    inventoryTitle: '持っている添加剤',
    additive: '添加剤',
    capacity: '容量',
    remaining: '残量',
    unit: '単位',
    alertRemaining: 'アラート残量',
    memo: 'メモ',
    registering: '登録中...',
    registerAdditive: '添加剤を登録',
    noInventory: '手持ちの添加剤を登録してください。',
    hide: '非表示',
    waterChangeHistory: '水換え履歴',
    date: '日付',
    waterChangeLiters: '水換え量 L',
    saveWaterChange: '水換えを記録',
    noWaterChanges: '水換え履歴はまだありません。',
    doseTitle: '添加剤の記録',
    fromInventory: '手持ちから選択',
    noInventoryUse: '在庫を使わない',
    masterAdditive: '添加剤マスタ',
    amount: '添加量',
    saveDose: '添加量を記録',
    waterChart: '水質グラフ',
    week: '週間',
    month: '月間',
    average: '平均',
    minimum: '最小',
    maximum: '最大',
    points: count => `${count}点`,
    noRecords: '記録なし',
    latest: '直近',
    recentWaterRecords: '最近の水質記録',
    loading: '読み込み中...',
    noWaterRecords: 'まだ水質記録がありません。',
    recentDoseRecords: '最近の添加記録',
    noDoseRecords: 'まだ添加記録がありません。',
    remainingPrefix: '残',
    parameters: { temperature: '水温', salinity: '比重', ph: 'pH', kh: 'KH', calcium: 'Ca', magnesium: 'Mg', nitrate: 'NO3', phosphate: 'PO4' },
  },
  en: {
    privateLog: 'PRIVATE REEF LOG',
    loginTitle: 'Log in to water records',
    loginHelp: 'Save water quality, dosing, and water-change history to your account.',
    email: 'Email address',
    sendLogin: 'Send login link',
    loginSent: 'Login link sent to your email.',
    logout: 'Sign out',
    tankFallback: 'Water management',
    loadTankError: 'Could not load aquarium data.',
    loadWaterError: 'Could not load water logs.',
    loadInventoryError: 'Could not load additive inventory.',
    loadDoseError: 'Could not load dosing logs.',
    loadWaterChangeError: 'Could not load water-change history.',
    saveTankError: 'Could not save aquarium data.',
    saveWaterError: 'Could not save water log.',
    saveInventoryError: 'Could not register your additive.',
    archiveInventoryError: 'Could not hide this additive.',
    saveDoseError: 'Could not save dosing log.',
    saveDosePartialError: 'Dosing log was saved, but remaining amount could not be updated.',
    saveWaterChangeError: 'Could not save water-change history.',
    lowStockTitle: 'Some additives are running low',
    otherItems: count => `${count} more`,
    tankData: 'Tank Data',
    tankSub: 'Water volume and latest water change',
    volume: 'Volume',
    save: 'Save',
    recentWaterChange: 'Latest water change',
    notRegistered: 'Not registered',
    todayWater: "Today's Water",
    waterNotes: 'Water change, dosing, livestock notes',
    saving: 'Saving...',
    saveWater: 'Save water log',
    inventoryTitle: 'My Additives',
    additive: 'Additive',
    capacity: 'Capacity',
    remaining: 'Remaining',
    unit: 'Unit',
    alertRemaining: 'Low-stock alert',
    memo: 'Memo',
    registering: 'Registering...',
    registerAdditive: 'Register additive',
    noInventory: 'Register additives you own.',
    hide: 'Hide',
    waterChangeHistory: 'Water Changes',
    date: 'Date',
    waterChangeLiters: 'Changed volume L',
    saveWaterChange: 'Save water change',
    noWaterChanges: 'No water changes yet.',
    doseTitle: 'Dosing Log',
    fromInventory: 'Use owned additive',
    noInventoryUse: 'Do not use inventory',
    masterAdditive: 'Additive master',
    amount: 'Dose amount',
    saveDose: 'Save dose',
    waterChart: 'Water Charts',
    week: 'Week',
    month: 'Month',
    average: 'Average',
    minimum: 'Min',
    maximum: 'Max',
    points: count => `${count} pts`,
    noRecords: 'No records',
    latest: 'Latest',
    recentWaterRecords: 'Recent Water Records',
    loading: 'Loading...',
    noWaterRecords: 'No water records yet.',
    recentDoseRecords: 'Recent Dosing Records',
    noDoseRecords: 'No dosing records yet.',
    remainingPrefix: 'Left',
    parameters: { temperature: 'Temp', salinity: 'Salinity', ph: 'pH', kh: 'KH', calcium: 'Ca', magnesium: 'Mg', nitrate: 'NO3', phosphate: 'PO4' },
  },
  de: {
    privateLog: 'PRIVATE REEF LOG',
    loginTitle: 'Bei Wasserwerten anmelden',
    loginHelp: 'Speichere Wasserwerte, Dosierungen und Wasserwechsel in deinem Konto.',
    email: 'E-Mail-Adresse',
    sendLogin: 'Login-Link senden',
    loginSent: 'Login-Link wurde per E-Mail gesendet.',
    logout: 'Abmelden',
    tankFallback: 'Wasserpflege',
    loadTankError: 'Aquariumdaten konnten nicht geladen werden.',
    loadWaterError: 'Wasserprotokolle konnten nicht geladen werden.',
    loadInventoryError: 'Additivbestand konnte nicht geladen werden.',
    loadDoseError: 'Dosierprotokolle konnten nicht geladen werden.',
    loadWaterChangeError: 'Wasserwechselverlauf konnte nicht geladen werden.',
    saveTankError: 'Aquariumdaten konnten nicht gespeichert werden.',
    saveWaterError: 'Wasserprotokoll konnte nicht gespeichert werden.',
    saveInventoryError: 'Additiv konnte nicht registriert werden.',
    archiveInventoryError: 'Additiv konnte nicht ausgeblendet werden.',
    saveDoseError: 'Dosierprotokoll konnte nicht gespeichert werden.',
    saveDosePartialError: 'Dosierung gespeichert, aber Restmenge konnte nicht aktualisiert werden.',
    saveWaterChangeError: 'Wasserwechsel konnte nicht gespeichert werden.',
    lowStockTitle: 'Einige Additive gehen zur Neige',
    otherItems: count => `${count} weitere`,
    tankData: 'Tankdaten',
    tankSub: 'Wasservolumen und letzter Wasserwechsel',
    volume: 'Volumen',
    save: 'Speichern',
    recentWaterChange: 'Letzter Wasserwechsel',
    notRegistered: 'Nicht registriert',
    todayWater: 'Heutige Wasserwerte',
    waterNotes: 'Wasserwechsel, Dosierung, Beobachtungen',
    saving: 'Speichert...',
    saveWater: 'Wasserwerte speichern',
    inventoryTitle: 'Meine Additive',
    additive: 'Additiv',
    capacity: 'Inhalt',
    remaining: 'Restmenge',
    unit: 'Einheit',
    alertRemaining: 'Warnschwelle',
    memo: 'Notiz',
    registering: 'Registriert...',
    registerAdditive: 'Additiv registrieren',
    noInventory: 'Registriere deine vorhandenen Additive.',
    hide: 'Ausblenden',
    waterChangeHistory: 'Wasserwechsel',
    date: 'Datum',
    waterChangeLiters: 'Wechselmenge L',
    saveWaterChange: 'Wasserwechsel speichern',
    noWaterChanges: 'Noch keine Wasserwechsel.',
    doseTitle: 'Dosierprotokoll',
    fromInventory: 'Aus Bestand wählen',
    noInventoryUse: 'Bestand nicht verwenden',
    masterAdditive: 'Additivliste',
    amount: 'Dosiermenge',
    saveDose: 'Dosierung speichern',
    waterChart: 'Wasserwert-Grafiken',
    week: 'Woche',
    month: 'Monat',
    average: 'Durchschnitt',
    minimum: 'Minimum',
    maximum: 'Maximum',
    points: count => `${count} Punkte`,
    noRecords: 'Keine Daten',
    latest: 'Aktuell',
    recentWaterRecords: 'Letzte Wasserwerte',
    loading: 'Lädt...',
    noWaterRecords: 'Noch keine Wasserwerte.',
    recentDoseRecords: 'Letzte Dosierungen',
    noDoseRecords: 'Noch keine Dosierungen.',
    remainingPrefix: 'Rest',
    parameters: { temperature: 'Temp.', salinity: 'Dichte', ph: 'pH', kh: 'KH', calcium: 'Ca', magnesium: 'Mg', nitrate: 'NO3', phosphate: 'PO4' },
  },
  zh: {
    privateLog: 'PRIVATE REEF LOG',
    loginTitle: '登录水质记录',
    loginHelp: '将水质、添加剂和换水记录保存到你的账号。',
    email: '邮箱地址',
    sendLogin: '发送登录链接',
    loginSent: '登录链接已发送到邮箱。',
    logout: '退出',
    tankFallback: '水质管理',
    loadTankError: '无法读取水槽数据。',
    loadWaterError: '无法读取水质记录。',
    loadInventoryError: '无法读取添加剂库存。',
    loadDoseError: '无法读取添加记录。',
    loadWaterChangeError: '无法读取换水记录。',
    saveTankError: '无法保存水槽数据。',
    saveWaterError: '无法保存水质记录。',
    saveInventoryError: '无法登记持有的添加剂。',
    archiveInventoryError: '无法隐藏该添加剂。',
    saveDoseError: '无法保存添加记录。',
    saveDosePartialError: '添加记录已保存，但剩余量更新失败。',
    saveWaterChangeError: '无法保存换水记录。',
    lowStockTitle: '部分添加剂剩余量偏低',
    otherItems: count => `另有${count}项`,
    tankData: '水槽数据',
    tankSub: '水量与最近换水',
    volume: '水量',
    save: '保存',
    recentWaterChange: '最近换水',
    notRegistered: '未登记',
    todayWater: '今日水质',
    waterNotes: '换水、添加剂、生物状态等',
    saving: '保存中...',
    saveWater: '记录水质',
    inventoryTitle: '我的添加剂',
    additive: '添加剂',
    capacity: '容量',
    remaining: '剩余量',
    unit: '单位',
    alertRemaining: '低库存提醒',
    memo: '备注',
    registering: '登记中...',
    registerAdditive: '登记添加剂',
    noInventory: '请登记你持有的添加剂。',
    hide: '隐藏',
    waterChangeHistory: '换水记录',
    date: '日期',
    waterChangeLiters: '换水量 L',
    saveWaterChange: '记录换水',
    noWaterChanges: '还没有换水记录。',
    doseTitle: '添加剂记录',
    fromInventory: '从持有库存选择',
    noInventoryUse: '不使用库存',
    masterAdditive: '添加剂主列表',
    amount: '添加量',
    saveDose: '记录添加量',
    waterChart: '水质图表',
    week: '周',
    month: '月',
    average: '平均',
    minimum: '最小',
    maximum: '最大',
    points: count => `${count}点`,
    noRecords: '无记录',
    latest: '最近',
    recentWaterRecords: '最近水质记录',
    loading: '读取中...',
    noWaterRecords: '还没有水质记录。',
    recentDoseRecords: '最近添加记录',
    noDoseRecords: '还没有添加记录。',
    remainingPrefix: '剩余',
    parameters: { temperature: '水温', salinity: '比重', ph: 'pH', kh: 'KH', calcium: 'Ca', magnesium: 'Mg', nitrate: 'NO3', phosphate: 'PO4' },
  },
}

const NUMBER_LOCALE = { ja: 'ja-JP', en: 'en-US', de: 'de-DE', zh: 'zh-CN' }

const PARAMETERS = [
  { key: 'temperature', unit: '°C', min: 24, max: 26.5, step: '0.1', defaultValue: 25.0, color: '#22d3ee' },
  { key: 'salinity', unit: '', min: 1.024, max: 1.026, step: '0.001', defaultValue: 1.025, color: '#38bdf8' },
  { key: 'ph', unit: '', min: 8.0, max: 8.4, step: '0.1', defaultValue: 8.2, color: '#a78bfa' },
  { key: 'kh', unit: 'dKH', min: 7.0, max: 9.0, step: '0.1', defaultValue: 8.0, color: '#f59e0b' },
  { key: 'calcium', unit: 'ppm', min: 400, max: 450, step: '5', defaultValue: 430, color: '#f472b6' },
  { key: 'magnesium', unit: 'ppm', min: 1250, max: 1400, step: '10', defaultValue: 1320, color: '#818cf8' },
  { key: 'nitrate', unit: 'ppm', min: 0.2, max: 10, step: '0.1', defaultValue: 2.0, color: '#34d399' },
  { key: 'phosphate', unit: 'ppm', min: 0.02, max: 0.08, step: '0.01', defaultValue: 0.04, color: '#fb7185' },
]

const TARGET_PRESETS = {
  sps: {
    label: 'SPSメイン',
    targets: {
      temperature: { min: 24.5, max: 26.5 },
      salinity: { min: 1.024, max: 1.026 },
      ph: { min: 8.0, max: 8.4 },
      kh: { min: 7.5, max: 8.8 },
      calcium: { min: 400, max: 450 },
      magnesium: { min: 1280, max: 1400 },
      nitrate: { min: 0.5, max: 10 },
      phosphate: { min: 0.02, max: 0.08 },
    },
  },
  lps: {
    label: 'LPS混泳',
    targets: {
      temperature: { min: 24, max: 27 },
      salinity: { min: 1.023, max: 1.026 },
      ph: { min: 7.9, max: 8.4 },
      kh: { min: 7.5, max: 9.5 },
      calcium: { min: 390, max: 460 },
      magnesium: { min: 1250, max: 1400 },
      nitrate: { min: 2, max: 15 },
      phosphate: { min: 0.03, max: 0.1 },
    },
  },
  soft: {
    label: 'ソフトコーラル',
    targets: {
      temperature: { min: 24, max: 27 },
      salinity: { min: 1.023, max: 1.026 },
      ph: { min: 7.9, max: 8.4 },
      kh: { min: 7, max: 10 },
      calcium: { min: 380, max: 460 },
      magnesium: { min: 1200, max: 1400 },
      nitrate: { min: 2, max: 20 },
      phosphate: { min: 0.03, max: 0.12 },
    },
  },
  fish: {
    label: '魚多め',
    targets: {
      temperature: { min: 24, max: 27 },
      salinity: { min: 1.021, max: 1.026 },
      ph: { min: 7.8, max: 8.4 },
      kh: { min: 7, max: 10 },
      calcium: { min: 360, max: 460 },
      magnesium: { min: 1150, max: 1450 },
      nitrate: { min: 0, max: 25 },
      phosphate: { min: 0, max: 0.15 },
    },
  },
}

const ANALYSIS_RULES = {
  temperature: { cautionDelta: 1.0, dangerDelta: 2.0 },
  salinity: { cautionDelta: 0.001, dangerDelta: 0.002 },
  ph: { cautionLow: 7.9, dangerLow: 7.8, cautionHigh: 8.45, dangerHigh: 8.5, cautionDelta: 0.2, dangerDelta: 0.35 },
  kh: { cautionDelta: 0.5, dangerDelta: 1.0 },
  calcium: { cautionDelta: 25, dangerDelta: 50 },
  magnesium: { cautionDelta: 50, dangerDelta: 100 },
  nitrate: { cautionHigh: 15, dangerHigh: 25 },
  phosphate: { cautionHigh: 0.08, dangerHigh: 0.1 },
}

const ACTION_SUGGESTIONS = {
  temperature: 'ヒーター、クーラー、室温、センサー位置を確認してください。',
  salinity: '比重計の校正、足し水、塩だれ、換水時の比重を確認してください。',
  ph: '測定時間、換気、KH、CO2、校正液を確認してください。',
  kh: '添加量、測定ミス、サンゴの消費量増加、換水直後かどうかを確認してください。',
  calcium: 'Ca添加量、KHとのバランス、試薬の期限を確認してください。',
  magnesium: 'Mg添加量、塩のロット、測定手順を確認してください。',
  nitrate: '給餌量、濾過、換水頻度、掃除のタイミングを確認してください。',
  phosphate: '給餌量、吸着剤、スキマー、換水、冷凍餌のすすぎを確認してください。',
}

const EVENT_TYPES = [
  { value: 'dosing', label: '添加' },
  { value: 'water_change', label: '水換え' },
  { value: 'feeding_change', label: '給餌変更' },
  { value: 'lighting_change', label: '照明変更' },
  { value: 'livestock_added', label: '生体追加' },
  { value: 'maintenance', label: '掃除・メンテナンス' },
  { value: 'other', label: 'その他' },
]

const initialWaterForm = {
  measured_at: todayIso(),
  temperature: '25.0',
  salinity: '1.025',
  ph: '8.2',
  kh: '8.0',
  calcium: '430',
  magnesium: '1320',
  nitrate: '2.0',
  phosphate: '0.04',
  notes: '',
}

const initialEventForm = {
  event_at: todayIso(),
  event_type: 'maintenance',
  title: '',
  notes: '',
}

const initialDoseForm = {
  dosed_at: todayIso(),
  additive_inventory_id: '',
  additive_product_id: '',
  amount: '',
  unit: 'ml',
  notes: '',
}

const initialInventoryForm = {
  additive_product_id: '',
  initial_amount: '',
  remaining_amount: '',
  unit: 'ml',
  low_stock_threshold: '50',
  notes: '',
}

const initialWaterChangeForm = {
  changed_at: todayIso(),
  amount_liters: '',
  notes: '',
}

const DEMO_WATER_LOGS_KEY = 'demo_water_logs'
const DEMO_WATER_LOGS_BACKUP_KEY = 'demo_water_logs_backup'
const DEMO_CUSTOM_PARAMETERS_KEY = 'demo_custom_parameters'
const DEMO_EVENT_LOGS_KEY = 'demo_aquarium_event_logs'
const DEMO_TARGET_SETTINGS_KEY = 'demo_target_settings'
const DEMO_SAMPLE_SEEDED_KEY = 'demo_sample_seeded'
const DEMO_SAMPLE_DISABLED_KEY = 'demo_sample_disabled'
const BUILTIN_PARAMETER_KEYS = new Set(PARAMETERS.map(parameter => parameter.key))

function todayIso() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function parseNumber(value) {
  if (value === '' || value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function formatValue(value, unit, locale = 'ja') {
  if (value == null) return '-'
  return `${Number(value).toLocaleString(NUMBER_LOCALE[locale] || 'ja-JP', { maximumFractionDigits: 3 })}${unit ? ` ${unit}` : ''}`
}

function productLabel(product) {
  if (!product) return ''
  return `${product.brand} ${product.name}`
}

function labelFor(parameter, text) {
  return parameter.label || text.parameters[parameter.key] || parameter.key
}

function normalizeParameter(parameter, text) {
  return {
    id: parameter.id ?? parameter.key,
    key: parameter.key,
    label: parameter.label || text.parameters[parameter.key] || parameter.key,
    unit: parameter.unit || '',
    step: Number(parameter.step || 1),
    min: parameter.min_value ?? parameter.min ?? null,
    max: parameter.max_value ?? parameter.max ?? null,
    defaultValue: parameter.default_value ?? parameter.defaultValue ?? '',
    displayOrder: parameter.display_order ?? parameter.displayOrder ?? 100,
    isBuiltin: parameter.is_builtin ?? BUILTIN_PARAMETER_KEYS.has(parameter.key),
    isActive: parameter.is_active ?? true,
    color: parameter.color || '#34d399',
  }
}

function buildInitialWaterForm(parameters, keepDate) {
  const form = { measured_at: keepDate || todayIso(), notes: '' }
  parameters.forEach(parameter => {
    const value = parameter.defaultValue !== '' && parameter.defaultValue != null ? parameter.defaultValue : ''
    form[parameter.key] = value === '' ? '' : String(value)
  })
  return form
}

function defaultTargets() {
  return TARGET_PRESETS.sps.targets
}

function getTargetSettings(aquarium) {
  const preset = aquarium?.target_preset || 'sps'
  const presetTargets = TARGET_PRESETS[preset]?.targets || defaultTargets()
  if (preset !== 'custom') return { preset, targets: presetTargets }
  return { preset, targets: { ...presetTargets, ...(aquarium?.custom_targets || {}) } }
}

function getRecordValue(record, key) {
  if (!record) return null
  const value = record[key] ?? record.custom_values?.[key]
  return parseNumber(value)
}

function targetRangeFor(parameter, targets) {
  const presetRange = targets?.[parameter.key]
  return {
    min: presetRange?.min ?? parameter.min ?? null,
    max: presetRange?.max ?? parameter.max ?? null,
  }
}

function buildWaterAnalysis(records, parameters, targets, text) {
  const latest = records[0] || null
  const previous = records[1] || null
  const items = parameters.map(parameter => {
    const current = getRecordValue(latest, parameter.key)
    const previousValue = getRecordValue(previous, parameter.key)
    const delta = current != null && previousValue != null ? current - previousValue : null
    const rule = ANALYSIS_RULES[parameter.key] || {}
    const target = targetRangeFor(parameter, targets)
    let severity = 'normal'
    const reasons = []

    if (current != null) {
      if (target.min != null && current < target.min) reasons.push('目標下限未満')
      if (target.max != null && current > target.max) reasons.push('目標上限超過')
      if (rule.dangerLow != null && current < rule.dangerLow) reasons.push('危険域の低値')
      else if (rule.cautionLow != null && current < rule.cautionLow) reasons.push('低め')
      if (rule.dangerHigh != null && current > rule.dangerHigh) reasons.push('危険域の高値')
      else if (rule.cautionHigh != null && current > rule.cautionHigh) reasons.push('高め')
    }

    if (delta != null) {
      const absDelta = Math.abs(delta)
      if (rule.dangerDelta != null && absDelta >= rule.dangerDelta) reasons.push('前回から急変')
      else if (rule.cautionDelta != null && absDelta >= rule.cautionDelta) reasons.push('前回から変動')
    }

    if (reasons.some(reason => reason.includes('危険') || reason.includes('急変') || reason.includes('上限超過'))) severity = 'danger'
    else if (reasons.length) severity = 'caution'

    return {
      key: parameter.key,
      label: labelFor(parameter, text),
      unit: parameter.unit,
      current,
      previous: previousValue,
      delta,
      target,
      severity,
      reasons,
      suggestion: severity === 'normal' ? '現在は大きな異常は見えません。通常の観察を続けてください。' : ACTION_SUGGESTIONS[parameter.key],
    }
  })

  const dangerCount = items.filter(item => item.severity === 'danger').length
  const cautionCount = items.filter(item => item.severity === 'caution').length
  const topActions = items.filter(item => item.severity !== 'normal').slice(0, 4)

  return { latest, previous, items, dangerCount, cautionCount, topActions }
}

function readStorageArray(key) {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStorageArray(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function dateDaysAgo(daysAgo) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - daysAgo)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function createDemoWaterSamples() {
  const rows = [
    { daysAgo: 11, temperature: 25.1, salinity: 1.025, ph: 8.18, kh: 8.2, calcium: 430, magnesium: 1320, nitrate: 4.0, phosphate: 0.04, notes: 'デモ: 通常測定' },
    { daysAgo: 10, temperature: 25.0, salinity: 1.025, ph: 8.15, kh: 8.1, calcium: 428, magnesium: 1320, nitrate: 4.5, phosphate: 0.04, notes: 'デモ: 通常測定' },
    { daysAgo: 9, temperature: 25.2, salinity: 1.025, ph: 8.12, kh: 8.0, calcium: 426, magnesium: 1310, nitrate: 5.2, phosphate: 0.05, notes: 'デモ: 給餌量を少し増やした想定' },
    { daysAgo: 8, temperature: 25.3, salinity: 1.026, ph: 8.08, kh: 7.9, calcium: 425, magnesium: 1310, nitrate: 6.8, phosphate: 0.07, notes: 'デモ: NO3がゆっくり上昇' },
    { daysAgo: 7, temperature: 25.2, salinity: 1.025, ph: 8.10, kh: 8.0, calcium: 430, magnesium: 1320, nitrate: 7.5, phosphate: 0.09, notes: 'デモ: PO4がやや高め' },
    { daysAgo: 6, temperature: 25.1, salinity: 1.025, ph: 8.14, kh: 8.2, calcium: 435, magnesium: 1325, nitrate: 8.0, phosphate: 0.06, notes: 'デモ: 水換え後にPO4が低下' },
    { daysAgo: 5, temperature: 25.0, salinity: 1.025, ph: 8.16, kh: 8.1, calcium: 432, magnesium: 1320, nitrate: 9.4, phosphate: 0.07, notes: 'デモ: 通常測定' },
    { daysAgo: 4, temperature: 25.2, salinity: 1.025, ph: 8.05, kh: 7.8, calcium: 426, magnesium: 1315, nitrate: 12.2, phosphate: 0.08, notes: 'デモ: NO3上昇傾向' },
    { daysAgo: 3, temperature: 25.4, salinity: 1.025, ph: 8.00, kh: 7.7, calcium: 420, magnesium: 1310, nitrate: 16.0, phosphate: 0.09, notes: 'デモ: 給餌変更の影響を観察' },
    { daysAgo: 2, temperature: 25.2, salinity: 1.025, ph: 7.95, kh: 8.1, calcium: 425, magnesium: 1320, nitrate: 21.5, phosphate: 0.08, notes: 'デモ: KH添加後に回復' },
    { daysAgo: 1, temperature: 25.2, salinity: 1.025, ph: 7.90, kh: 8.2, calcium: 430, magnesium: 1320, nitrate: 24.0, phosphate: 0.09, notes: 'デモ: NO3が高め' },
    { daysAgo: 0, temperature: 25.3, salinity: 1.025, ph: 7.78, kh: 6.9, calcium: 418, magnesium: 1310, nitrate: 26.5, phosphate: 0.12, notes: 'デモ: KH急低下、PO4/NO3高めの例' },
  ]

  return rows
    .map(row => ({
      ...row,
      id: `demo-sample-water-${row.daysAgo}`,
      aquarium_id: 'demo-aquarium',
      user_id: null,
      measured_at: dateDaysAgo(row.daysAgo),
      custom_values: {},
      created_at: new Date(`${dateDaysAgo(row.daysAgo)}T12:00:00`).toISOString(),
    }))
    .sort((a, b) => b.measured_at.localeCompare(a.measured_at))
}

function createDemoEventSamples() {
  return [
    { daysAgo: 10, event_type: 'lighting_change', title: '照明ピークを30分延長', notes: 'デモ: 色揚がり観察のため少し変更' },
    { daysAgo: 8, event_type: 'feeding_change', title: '冷凍餌を少し増量', notes: 'デモ: NO3/PO4上昇との関係を見る例' },
    { daysAgo: 6, event_type: 'water_change', title: '水換え 20L', notes: 'デモ: PO4が一度下がるイベント' },
    { daysAgo: 2, event_type: 'dosing', title: 'KH添加量を調整', notes: 'デモ: KH変動を確認するイベント' },
  ].map(event => ({
    ...event,
    id: `demo-sample-event-${event.daysAgo}`,
    aquarium_id: 'demo-aquarium',
    user_id: null,
    event_at: dateDaysAgo(event.daysAgo),
    metadata: { demo: true },
    created_at: new Date(`${dateDaysAgo(event.daysAgo)}T13:00:00`).toISOString(),
  }))
}

function ensureDemoSamples() {
  if (typeof window === 'undefined') return { records: [], events: [], seeded: false }
  const disabled = window.localStorage.getItem(DEMO_SAMPLE_DISABLED_KEY) === 'true'
  const currentLogs = readStorageArray(DEMO_WATER_LOGS_KEY)
  const currentEvents = readStorageArray(DEMO_EVENT_LOGS_KEY)
  if (currentLogs.length || disabled) {
    return {
      records: currentLogs,
      events: currentEvents,
      seeded: window.localStorage.getItem(DEMO_SAMPLE_SEEDED_KEY) === 'true' && currentLogs.some(record => String(record.id).startsWith('demo-sample-water-')),
    }
  }

  const records = createDemoWaterSamples()
  const events = currentEvents.length ? currentEvents : createDemoEventSamples()
  writeStorageArray(DEMO_WATER_LOGS_KEY, records)
  writeStorageArray(DEMO_EVENT_LOGS_KEY, events)
  window.localStorage.setItem(DEMO_SAMPLE_SEEDED_KEY, 'true')
  return { records, events, seeded: true }
}

function demoAquarium() {
  let settings = null
  try {
    settings = typeof window === 'undefined' ? null : JSON.parse(window.localStorage.getItem(DEMO_TARGET_SETTINGS_KEY) || 'null')
  } catch {
    settings = null
  }
  return { id: 'demo-aquarium', name: 'Demo Reef Tank', volume_liters: 100, target_preset: settings?.preset || 'sps', custom_targets: settings?.targets || {} }
}

function createLocalId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function WaterQualityDashboard({ locale = 'ja' }) {
  const text = TEXT[locale] || TEXT.ja
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [demoMessage, setDemoMessage] = useState('')
  const [demoSampleActive, setDemoSampleActive] = useState(false)
  const [aquariums, setAquariums] = useState([])
  const [selectedAquariumId, setSelectedAquariumId] = useState('')
  const [records, setRecords] = useState([])
  const [waterParameters, setWaterParameters] = useState(() => PARAMETERS.map(parameter => normalizeParameter(parameter, text)))
  const [additives, setAdditives] = useState([])
  const [inventory, setInventory] = useState([])
  const [doseLogs, setDoseLogs] = useState([])
  const [waterChanges, setWaterChanges] = useState([])
  const [eventLogs, setEventLogs] = useState([])
  const [waterForm, setWaterForm] = useState(initialWaterForm)
  const [doseForm, setDoseForm] = useState(initialDoseForm)
  const [inventoryForm, setInventoryForm] = useState(initialInventoryForm)
  const [waterChangeForm, setWaterChangeForm] = useState(initialWaterChangeForm)
  const [eventForm, setEventForm] = useState(initialEventForm)
  const [periodDays, setPeriodDays] = useState(7)
  const [savingWater, setSavingWater] = useState(false)
  const [savingDose, setSavingDose] = useState(false)
  const [savingInventory, setSavingInventory] = useState(false)
  const [savingTank, setSavingTank] = useState(false)
  const [savingWaterChange, setSavingWaterChange] = useState(false)
  const [savingEvent, setSavingEvent] = useState(false)
  const [savingTargets, setSavingTargets] = useState(false)
  const [syncingDemo, setSyncingDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isDemoMode = !session

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchAdditives()
    if (session) {
      bootstrap(session.user.id)
    } else {
      bootstrapDemo()
      setInventory([])
      setDoseLogs([])
      setWaterChanges([])
    }
  }, [session])

  useEffect(() => {
    if (selectedAquariumId && session) {
      fetchWaterLogs(selectedAquariumId)
      fetchInventory(selectedAquariumId)
      fetchDoseLogs(selectedAquariumId)
      fetchWaterChanges(selectedAquariumId)
      fetchEventLogs(selectedAquariumId)
    }
  }, [selectedAquariumId])

  useEffect(() => {
    setWaterForm(current => {
      const next = buildInitialWaterForm(waterParameters, current.measured_at)
      Object.keys(current).forEach(key => {
        if (key in next && current[key] !== '') next[key] = current[key]
      })
      next.notes = current.notes || ''
      return next
    })
  }, [waterParameters])

  function bootstrapDemo() {
    setLoading(true)
    setError(null)
    const demoParameters = readStorageArray(DEMO_CUSTOM_PARAMETERS_KEY).map(parameter => normalizeParameter(parameter, text))
    const activeParameters = [...PARAMETERS.map(parameter => normalizeParameter(parameter, text)), ...demoParameters]
    const demoSamples = ensureDemoSamples()
    setWaterParameters(activeParameters)
    setAquariums([demoAquarium()])
    setSelectedAquariumId('demo-aquarium')
    setRecords(demoSamples.records)
    setEventLogs(demoSamples.events)
    setDemoSampleActive(demoSamples.seeded)
    setLoading(false)
  }

  function deleteDemoSamples() {
    const nextRecords = records.filter(record => !String(record.id).startsWith('demo-sample-water-'))
    const nextEvents = eventLogs.filter(event => !String(event.id).startsWith('demo-sample-event-'))
    writeStorageArray(DEMO_WATER_LOGS_KEY, nextRecords)
    writeStorageArray(DEMO_EVENT_LOGS_KEY, nextEvents)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DEMO_SAMPLE_DISABLED_KEY, 'true')
      window.localStorage.removeItem(DEMO_SAMPLE_SEEDED_KEY)
    }
    setRecords(nextRecords)
    setEventLogs(nextEvents)
    setDemoSampleActive(false)
    setDemoMessage('デモデータを削除しました。まずはKHだけでも記録してみましょう。')
  }

  async function fetchAdditives() {
    const { data, error } = await supabase.from('additive_products').select('*').order('sort_order')
    if (error) return
    setAdditives(data ?? [])
    if (data?.length) {
      setDoseForm(current => current.additive_product_id ? current : { ...current, additive_product_id: data[0].id, unit: data[0].default_unit })
      setInventoryForm(current => current.additive_product_id ? current : { ...current, additive_product_id: data[0].id, unit: data[0].default_unit })
    }
  }

  async function bootstrap(userId) {
    setLoading(true)
    setError(null)
    try {
      await syncDemoCustomParameters(userId)
      const parameters = await fetchWaterParameters(userId)
      setWaterParameters(parameters)
      const { data, error } = await supabase.from('aquariums').select('*').order('created_at')
      if (error) throw error
      let activeAquarium
      if (data?.length) {
        setAquariums(data)
        setSelectedAquariumId(data[0].id)
        activeAquarium = data[0]
      } else {
        const { data: created, error: createError } = await supabase
          .from('aquariums')
          .insert({ name: 'Main Reef Tank', user_id: userId, volume_liters: 100 })
          .select('*')
          .single()
        if (createError) throw createError
        setAquariums([created])
        setSelectedAquariumId(created.id)
        activeAquarium = created
      }
      if (activeAquarium) {
        await syncDemoWaterLogs(userId, activeAquarium.id)
        await syncDemoEventLogs(userId, activeAquarium.id)
      }
    } catch (err) {
      setError(text.loadTankError)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function syncDemoCustomParameters(userId) {
    const demoParameters = readStorageArray(DEMO_CUSTOM_PARAMETERS_KEY)
    if (!demoParameters.length) return
    const payload = demoParameters.map((parameter, index) => ({
      user_id: userId,
      key: parameter.key,
      label: parameter.label,
      unit: parameter.unit || null,
      step: parseNumber(parameter.step) || 1,
      default_value: parseNumber(parameter.defaultValue),
      display_order: parameter.displayOrder ?? 200 + index,
      is_builtin: false,
      is_active: true,
    }))
    const { error } = await supabase.from('water_parameters').upsert(payload, { onConflict: 'user_id,key' })
    if (!error) writeStorageArray(DEMO_CUSTOM_PARAMETERS_KEY, [])
  }

  async function fetchWaterParameters(userId) {
    const fallback = PARAMETERS.map(parameter => normalizeParameter(parameter, text))
    const { data, error } = await supabase
      .from('water_parameters')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${userId}`)
      .order('display_order')
    if (error) return fallback
    const normalized = (data ?? [])
      .filter(parameter => parameter.is_active)
      .map(parameter => normalizeParameter(parameter, text))
    return normalized.length ? normalized : fallback
  }

  async function fetchWaterLogs(aquariumId) {
    const { data, error } = await supabase.from('water_quality_logs').select('*').eq('aquarium_id', aquariumId).order('measured_at', { ascending: false }).order('created_at', { ascending: false }).limit(365)
    if (error) setError(text.loadWaterError)
    else setRecords(data ?? [])
  }

  async function fetchInventory(aquariumId) {
    const { data, error } = await supabase.from('additive_inventory').select('*, additive_products(*)').eq('aquarium_id', aquariumId).is('archived_at', null).order('created_at', { ascending: false })
    if (error) setError(text.loadInventoryError)
    else setInventory(data ?? [])
  }

  async function fetchDoseLogs(aquariumId) {
    const { data, error } = await supabase.from('additive_dose_logs').select('*, additive_products(*), additive_inventory(*)').eq('aquarium_id', aquariumId).order('dosed_at', { ascending: false }).order('created_at', { ascending: false }).limit(365)
    if (error) setError(text.loadDoseError)
    else setDoseLogs(data ?? [])
  }

  async function fetchWaterChanges(aquariumId) {
    const { data, error } = await supabase.from('water_change_logs').select('*').eq('aquarium_id', aquariumId).order('changed_at', { ascending: false }).order('created_at', { ascending: false }).limit(100)
    if (error) setError(text.loadWaterChangeError)
    else setWaterChanges(data ?? [])
  }

  async function fetchEventLogs(aquariumId) {
    const { data, error } = await supabase.from('aquarium_event_logs').select('*').eq('aquarium_id', aquariumId).order('event_at', { ascending: false }).order('created_at', { ascending: false }).limit(100)
    if (!error) setEventLogs(data ?? [])
  }

  async function sendMagicLink(event) {
    event.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    setAuthMessage(error ? error.message : text.loginSent)
  }

  async function syncDemoWaterLogs(userId, aquariumId) {
    const demoLogs = readStorageArray(DEMO_WATER_LOGS_KEY)
    if (!demoLogs.length || syncingDemo) return
    setSyncingDemo(true)
    const payload = demoLogs.map(record => {
      const row = {
        aquarium_id: aquariumId,
        user_id: userId,
        measured_at: record.measured_at,
        notes: record.notes || null,
        custom_values: record.custom_values || {},
      }
      PARAMETERS.forEach(parameter => {
        row[parameter.key] = parseNumber(record[parameter.key])
      })
      return row
    })
    const { error } = await supabase.from('water_quality_logs').insert(payload)
    if (error) {
      setError(`デモデータの同期に失敗しました: ${error.message}`)
    } else {
      writeStorageArray(DEMO_WATER_LOGS_BACKUP_KEY, demoLogs)
      writeStorageArray(DEMO_WATER_LOGS_KEY, [])
      setDemoMessage(`デモデータ ${demoLogs.length}件をアカウントへ同期しました。`)
      await fetchWaterLogs(aquariumId)
    }
    setSyncingDemo(false)
  }

  async function syncDemoEventLogs(userId, aquariumId) {
    const demoEvents = readStorageArray(DEMO_EVENT_LOGS_KEY)
    if (!demoEvents.length) return
    const payload = demoEvents.map(event => ({
      aquarium_id: aquariumId,
      user_id: userId,
      event_at: event.event_at,
      event_type: event.event_type,
      title: event.title,
      notes: event.notes || null,
      metadata: event.metadata || {},
    }))
    const { error } = await supabase.from('aquarium_event_logs').insert(payload)
    if (!error) writeStorageArray(DEMO_EVENT_LOGS_KEY, [])
  }

  async function saveTankVolume(volumeLiters) {
    if (isDemoMode) {
      setAquariums([{ ...demoAquarium(), volume_liters: parseNumber(volumeLiters) }])
      return
    }
    setSavingTank(true)
    setError(null)
    const { data, error } = await supabase.from('aquariums').update({ volume_liters: parseNumber(volumeLiters) }).eq('id', selectedAquariumId).select('*').single()
    if (error) setError(text.saveTankError)
    else setAquariums(current => current.map(item => item.id === data.id ? data : item))
    setSavingTank(false)
  }

  async function saveTargetSettings(preset, targets) {
    setSavingTargets(true)
    if (isDemoMode) {
      if (typeof window !== 'undefined') window.localStorage.setItem(DEMO_TARGET_SETTINGS_KEY, JSON.stringify({ preset, targets }))
      const nextAquarium = { ...demoAquarium(), target_preset: preset, custom_targets: targets }
      setAquariums([nextAquarium])
      setSavingTargets(false)
      return
    }
    const payload = { target_preset: preset, custom_targets: preset === 'custom' ? targets : {} }
    const { data, error } = await supabase.from('aquariums').update(payload).eq('id', selectedAquariumId).select('*').single()
    if (error) setError(text.saveTankError)
    else setAquariums(current => current.map(item => item.id === data.id ? data : item))
    setSavingTargets(false)
  }

  async function saveWaterLog(event) {
    event.preventDefault()
    setSavingWater(true)
    setError(null)
    const customValues = {}
    const payload = { aquarium_id: selectedAquariumId, user_id: session?.user?.id, measured_at: waterForm.measured_at, notes: waterForm.notes.trim() || null, custom_values: customValues }
    waterParameters.forEach(parameter => {
      const value = parseNumber(waterForm[parameter.key])
      if (parameter.isBuiltin && BUILTIN_PARAMETER_KEYS.has(parameter.key)) payload[parameter.key] = value
      else if (value != null) customValues[parameter.key] = value
    })
    if (isDemoMode) {
      const data = { ...payload, id: createLocalId(), created_at: new Date().toISOString(), aquarium_id: 'demo-aquarium', user_id: null }
      const baseRecords = demoSampleActive ? [] : records
      const nextRecords = [data, ...baseRecords].slice(0, 365)
      setRecords(nextRecords)
      writeStorageArray(DEMO_WATER_LOGS_KEY, nextRecords)
      if (demoSampleActive) {
        writeStorageArray(DEMO_EVENT_LOGS_KEY, [])
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(DEMO_SAMPLE_DISABLED_KEY, 'true')
          window.localStorage.removeItem(DEMO_SAMPLE_SEEDED_KEY)
        }
        setEventLogs([])
        setDemoSampleActive(false)
        setDemoMessage('記録を開始したため、サンプルデータを自分のデータに置き換えました。')
      }
      setWaterForm(current => buildInitialWaterForm(waterParameters, current.measured_at))
      setSavingWater(false)
      return
    }
    const { data, error } = await supabase.from('water_quality_logs').insert(payload).select('*').single()
    if (error) setError(text.saveWaterError)
    else {
      setRecords(current => [data, ...current].slice(0, 365))
      setWaterForm(current => buildInitialWaterForm(waterParameters, current.measured_at))
    }
    setSavingWater(false)
  }

  async function addCustomParameter(parameter) {
    const key = parameter.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '')
    if (!key) return
    const nextParameter = normalizeParameter({
      ...parameter,
      key,
      display_order: 200 + waterParameters.length,
      is_builtin: false,
      is_active: true,
    }, text)

    if (isDemoMode) {
      const current = readStorageArray(DEMO_CUSTOM_PARAMETERS_KEY)
      const next = [...current.filter(item => item.key !== key), nextParameter]
      writeStorageArray(DEMO_CUSTOM_PARAMETERS_KEY, next)
      setWaterParameters(currentParameters => [...currentParameters.filter(item => item.key !== key), nextParameter])
      return
    }

    const { data, error } = await supabase
      .from('water_parameters')
      .insert({
        user_id: session.user.id,
        key,
        label: parameter.label,
        unit: parameter.unit || null,
        step: parseNumber(parameter.step) || 1,
        default_value: parseNumber(parameter.defaultValue),
        display_order: 200 + waterParameters.length,
        is_builtin: false,
        is_active: true,
      })
      .select('*')
      .single()
    if (error) setError(`カスタム項目を追加できませんでした: ${error.message}`)
    else setWaterParameters(current => [...current, normalizeParameter(data, text)])
  }

  async function hideCustomParameter(parameterKey) {
    const parameter = waterParameters.find(item => item.key === parameterKey)
    if (!parameter || parameter.isBuiltin) return
    if (isDemoMode) {
      const next = readStorageArray(DEMO_CUSTOM_PARAMETERS_KEY).filter(item => item.key !== parameterKey)
      writeStorageArray(DEMO_CUSTOM_PARAMETERS_KEY, next)
      setWaterParameters(current => current.filter(item => item.key !== parameterKey))
      return
    }
    const { error } = await supabase
      .from('water_parameters')
      .update({ is_active: false })
      .eq('key', parameterKey)
      .eq('user_id', session.user.id)
    if (error) setError(`カスタム項目を非表示にできませんでした: ${error.message}`)
    else setWaterParameters(current => current.filter(item => item.key !== parameterKey))
  }

  async function saveInventory(event) {
    event.preventDefault()
    setSavingInventory(true)
    setError(null)
    const product = additives.find(item => item.id === inventoryForm.additive_product_id)
    const initialAmount = parseNumber(inventoryForm.initial_amount)
    const remainingAmount = parseNumber(inventoryForm.remaining_amount) ?? initialAmount
    const payload = {
      aquarium_id: selectedAquariumId,
      user_id: session.user.id,
      additive_product_id: inventoryForm.additive_product_id,
      initial_amount: initialAmount,
      remaining_amount: remainingAmount,
      unit: inventoryForm.unit || product?.default_unit || 'ml',
      low_stock_threshold: parseNumber(inventoryForm.low_stock_threshold) ?? 0,
      notes: inventoryForm.notes.trim() || null,
    }
    const { data, error } = await supabase.from('additive_inventory').insert(payload).select('*, additive_products(*)').single()
    if (error) setError(text.saveInventoryError)
    else {
      setInventory(current => [data, ...current])
      setInventoryForm(current => ({ ...initialInventoryForm, additive_product_id: current.additive_product_id, unit: current.unit, low_stock_threshold: current.low_stock_threshold }))
    }
    setSavingInventory(false)
  }

  async function archiveInventory(id) {
    const { data, error } = await supabase.from('additive_inventory').update({ archived_at: new Date().toISOString() }).eq('id', id).select('id').single()
    if (error) setError(text.archiveInventoryError)
    else setInventory(current => current.filter(item => item.id !== data.id))
  }

  async function saveDoseLog(event) {
    event.preventDefault()
    setSavingDose(true)
    setError(null)
    const selectedInventory = inventory.find(item => item.id === doseForm.additive_inventory_id)
    const productId = selectedInventory?.additive_product_id || doseForm.additive_product_id
    const product = additives.find(item => item.id === productId)
    const amount = parseNumber(doseForm.amount)
    const unit = selectedInventory?.unit || doseForm.unit || product?.default_unit || 'ml'
    const payload = { aquarium_id: selectedAquariumId, user_id: session.user.id, additive_product_id: productId, additive_inventory_id: selectedInventory?.id || null, dosed_at: doseForm.dosed_at, amount, unit, notes: doseForm.notes.trim() || null }
    const { data, error } = await supabase.from('additive_dose_logs').insert(payload).select('*, additive_products(*), additive_inventory(*)').single()
    if (error) {
      setError(text.saveDoseError)
      setSavingDose(false)
      return
    }

    setDoseLogs(current => [data, ...current].slice(0, 365))
    if (selectedInventory && amount != null) {
      const nextRemaining = Math.max(0, Number(selectedInventory.remaining_amount) - amount)
      const { error: updateError } = await supabase.from('additive_inventory').update({ remaining_amount: nextRemaining }).eq('id', selectedInventory.id)
      if (updateError) setError(text.saveDosePartialError)
      else setInventory(current => current.map(item => item.id === selectedInventory.id ? { ...item, remaining_amount: nextRemaining } : item))
    }

    setDoseForm(current => ({ ...initialDoseForm, dosed_at: current.dosed_at, additive_inventory_id: current.additive_inventory_id, additive_product_id: current.additive_product_id, unit }))
    setSavingDose(false)
  }

  async function saveWaterChange(event) {
    event.preventDefault()
    setSavingWaterChange(true)
    setError(null)
    const payload = { aquarium_id: selectedAquariumId, user_id: session.user.id, changed_at: waterChangeForm.changed_at, amount_liters: parseNumber(waterChangeForm.amount_liters), notes: waterChangeForm.notes.trim() || null }
    const { data, error } = await supabase.from('water_change_logs').insert(payload).select('*').single()
    if (error) setError(text.saveWaterChangeError)
    else {
      setWaterChanges(current => [data, ...current].slice(0, 100))
      setWaterChangeForm(current => ({ ...initialWaterChangeForm, changed_at: current.changed_at }))
    }
    setSavingWaterChange(false)
  }

  async function saveEventLog(event) {
    event.preventDefault()
    const title = eventForm.title.trim()
    if (!title) return
    setSavingEvent(true)
    setError(null)
    const payload = {
      aquarium_id: selectedAquariumId,
      user_id: session?.user?.id,
      event_at: eventForm.event_at,
      event_type: eventForm.event_type,
      title,
      notes: eventForm.notes.trim() || null,
      metadata: {},
    }
    if (isDemoMode) {
      const data = { ...payload, id: createLocalId(), aquarium_id: 'demo-aquarium', user_id: null, created_at: new Date().toISOString() }
      const nextEvents = [data, ...eventLogs].slice(0, 100)
      setEventLogs(nextEvents)
      writeStorageArray(DEMO_EVENT_LOGS_KEY, nextEvents)
      setEventForm(current => ({ ...initialEventForm, event_at: current.event_at, event_type: current.event_type }))
      setSavingEvent(false)
      return
    }
    const { data, error } = await supabase.from('aquarium_event_logs').insert(payload).select('*').single()
    if (error) setError('イベントログを保存できませんでした。')
    else {
      setEventLogs(current => [data, ...current].slice(0, 100))
      setEventForm(current => ({ ...initialEventForm, event_at: current.event_at, event_type: current.event_type }))
    }
    setSavingEvent(false)
  }

  const selectedAquarium = aquariums.find(item => item.id === selectedAquariumId)
  const lowStockItems = inventory.filter(item => Number(item.remaining_amount) <= Number(item.low_stock_threshold))
  const lastWaterChange = waterChanges[0]
  const targetSettings = getTargetSettings(selectedAquarium)
  const waterAnalysis = buildWaterAnalysis(records, waterParameters, targetSettings.targets, text)

  return (
    <section className="space-y-5 pb-10">
      {isDemoMode && <DemoModePanel text={text} email={email} authMessage={authMessage} demoSampleActive={demoSampleActive} setEmail={setEmail} sendMagicLink={sendMagicLink} onDeleteDemoSamples={deleteDemoSamples} />}
      {error && <div className="border border-rose-800 bg-rose-950/50 rounded-lg p-4 text-rose-100 text-sm">{error}</div>}
      {demoMessage && <div className="border border-emerald-800 bg-emerald-950/50 rounded-lg p-4 text-emerald-100 text-sm">{demoMessage}</div>}
      {lowStockItems.length > 0 && <LowStockAlert text={text} locale={locale} items={lowStockItems} />}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-cyan-300 font-semibold">{text.privateLog}</p>
          <h2 className="text-2xl font-bold text-white">{selectedAquarium?.name || text.tankFallback}</h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedAquariumId} onChange={event => setSelectedAquariumId(event.target.value)} className="max-w-[140px] bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white">
            {aquariums.map(aquarium => <option key={aquarium.id} value={aquarium.id}>{aquarium.name}</option>)}
          </select>
          {!isDemoMode && <button type="button" onClick={() => supabase.auth.signOut()} className="text-xs text-slate-500 hover:text-white">{text.logout}</button>}
        </div>
      </div>

      <TankDataPanel text={text} locale={locale} aquarium={selectedAquarium} lastWaterChange={lastWaterChange} saving={savingTank} savingTargets={savingTargets} targetSettings={targetSettings} parameters={waterParameters} onSaveVolume={saveTankVolume} onSaveTargets={saveTargetSettings} />
      <WaterInsightPanel text={text} locale={locale} analysis={waterAnalysis} />
      <WaterLogForm text={text} parameters={waterParameters} form={waterForm} setForm={setWaterForm} saving={savingWater} latestRecord={records[0]} onSubmit={saveWaterLog} onAddCustomParameter={addCustomParameter} onHideCustomParameter={hideCustomParameter} />

      {!isDemoMode && (
        <>
          <div className="grid xl:grid-cols-2 gap-4">
            <InventoryPanel text={text} locale={locale} additives={additives} inventory={inventory} form={inventoryForm} setForm={setInventoryForm} saving={savingInventory} onSubmit={saveInventory} onArchive={archiveInventory} />
            <WaterChangePanel text={text} locale={locale} form={waterChangeForm} setForm={setWaterChangeForm} saving={savingWaterChange} waterChanges={waterChanges} onSubmit={saveWaterChange} />
          </div>

          <AdditiveDoseForm text={text} locale={locale} additives={additives} inventory={inventory} form={doseForm} setForm={setDoseForm} saving={savingDose} onSubmit={saveDoseLog} />
        </>
      )}

      <EventLogPanel form={eventForm} setForm={setEventForm} events={eventLogs} saving={savingEvent} onSubmit={saveEventLog} />

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{text.waterChart}</h3>
        <PeriodSwitch text={text} value={periodDays} onChange={setPeriodDays} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {waterParameters.map(parameter => <TrendCard key={parameter.key} text={text} locale={locale} records={records} parameter={parameter} periodDays={periodDays} target={targetRangeFor(parameter, targetSettings.targets)} />)}
      </div>

      {!isDemoMode && <div className="grid lg:grid-cols-2 gap-4">
        {additives.filter(product => doseLogs.some(log => log.additive_product_id === product.id)).map(product => (
          <AdditiveTrendCard key={product.id} text={text} locale={locale} product={product} logs={doseLogs} periodDays={periodDays} />
        ))}
      </div>}

      <RecentLists text={text} locale={locale} records={records} doseLogs={doseLogs} loading={loading} error={error} />
    </section>
  )
}

function LoginPanel({ text, email, authMessage, setEmail, sendMagicLink }) {
  return (
    <section className="max-w-md mx-auto py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <p className="text-cyan-300 text-sm font-semibold">{text.privateLog}</p>
        <h2 className="text-2xl font-bold text-white mt-1">{text.loginTitle}</h2>
        <p className="text-sm text-slate-400 mt-2">{text.loginHelp}</p>
        <form onSubmit={sendMagicLink} className="mt-5">
          <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder={text.email} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          <button type="submit" className="w-full bg-cyan-400 text-slate-950 font-bold rounded-md py-3 mt-3">{text.sendLogin}</button>
          {authMessage && <p className="text-xs text-cyan-300 mt-3">{authMessage}</p>}
        </form>
      </div>
    </section>
  )
}

function DemoModePanel({ text, email, authMessage, demoSampleActive, setEmail, sendMagicLink, onDeleteDemoSamples }) {
  return (
    <div className="border border-cyan-800 bg-cyan-950/40 rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-cyan-200 font-bold">デモモード</p>
          <p className="text-sm text-cyan-100/90 mt-1">※現在デモモードです。データはブラウザに一時保存されます。</p>
          {demoSampleActive && (
            <div className="mt-3 rounded-md border border-cyan-700 bg-slate-950/50 p-3">
              <p className="text-sm font-semibold text-cyan-100">これはデモデータです。</p>
              <p className="text-xs text-cyan-100/80 mt-1">ログイン、または水質記録を開始すると自分のデータに置き換わります。KH急低下、PO4高め、NO3上昇傾向のサンプルを入れています。</p>
              <button type="button" onClick={onDeleteDemoSamples} className="mt-2 rounded-md border border-cyan-700 px-3 py-2 text-xs font-semibold text-cyan-100 hover:bg-cyan-900">
                デモデータを削除
              </button>
            </div>
          )}
        </div>
        <form onSubmit={sendMagicLink} className="flex flex-col sm:flex-row gap-2 min-w-full sm:min-w-[420px]">
          <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder={text.email} className="min-w-0 flex-1 bg-slate-950 border border-cyan-800 rounded-md px-3 py-3 text-white" />
          <button type="submit" className="bg-cyan-400 text-slate-950 font-bold rounded-md px-4 py-3">アカウントを作成してデータを保存・同期する</button>
        </form>
      </div>
      {authMessage && <p className="text-xs text-cyan-200 mt-3">{authMessage}</p>}
    </div>
  )
}

function LowStockAlert({ text, locale, items }) {
  return (
    <div className="border border-amber-700 bg-amber-950/50 rounded-lg p-4">
      <p className="font-bold text-amber-100">{text.lowStockTitle}</p>
      <p className="text-sm text-amber-200 mt-1">
        {items.slice(0, 3).map(item => `${productLabel(item.additive_products)} ${formatValue(item.remaining_amount, item.unit, locale)}`).join(' / ')}
        {items.length > 3 ? ` ${text.otherItems(items.length - 3)}` : ''}
      </p>
    </div>
  )
}

function SeverityPill({ severity }) {
  const style = severity === 'danger'
    ? 'border-rose-600 bg-rose-950 text-rose-100'
    : severity === 'caution'
      ? 'border-amber-500 bg-amber-950 text-amber-100'
      : 'border-emerald-600 bg-emerald-950 text-emerald-100'
  const label = severity === 'danger' ? '危険' : severity === 'caution' ? '注意' : '正常'
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${style}`}>{label}</span>
}

function WaterInsightPanel({ text, locale, analysis }) {
  if (!analysis.latest) {
    return (
      <div className="border border-slate-800 bg-slate-900 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white">今日の判断</h3>
        <p className="text-sm text-slate-400 mt-2">まずはKHだけでも記録してみましょう。次回からは前回値コピーで入力が楽になり、差分・警告・確認すべきことがここに表示されます。</p>
      </div>
    )
  }

  const headline = analysis.dangerCount
    ? `${analysis.dangerCount}項目に危険サインがあります`
    : analysis.cautionCount
      ? `${analysis.cautionCount}項目に注意サインがあります`
      : '大きな異常は見えていません'

  return (
    <div className="border border-slate-800 bg-slate-900 rounded-lg p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">今日の判断</h3>
          <p className="text-sm text-slate-400 mt-1">{analysis.latest.measured_at} の最新ログを前回値と比較しています。</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${analysis.dangerCount ? 'bg-rose-500 text-white' : analysis.cautionCount ? 'bg-amber-400 text-slate-950' : 'bg-emerald-400 text-slate-950'}`}>
          {headline}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {analysis.items.map(item => (
          <div key={item.key} className="rounded-md border border-slate-800 bg-slate-950 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-white">{item.label}</p>
              <SeverityPill severity={item.severity} />
            </div>
            <p className="text-xl font-bold text-white mt-2">{formatValue(item.current, item.unit, locale)}</p>
            <p className={`text-xs mt-1 ${item.delta == null ? 'text-slate-500' : Math.abs(item.delta) > 0 ? 'text-cyan-200' : 'text-slate-500'}`}>
              前回差分: {item.delta == null ? '-' : `${item.delta > 0 ? '+' : ''}${formatValue(Number(item.delta.toFixed(3)), item.unit, locale)}`}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">目標: {formatValue(item.target.min, item.unit, locale)} - {formatValue(item.target.max, item.unit, locale)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950 p-3">
        <p className="text-sm font-bold text-white">次に確認すること</p>
        {analysis.topActions.length ? (
          <div className="mt-2 space-y-2">
            {analysis.topActions.map(item => (
              <div key={item.key} className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
                <p className="text-sm font-semibold text-white">{item.label}: {item.reasons.join(' / ')}</p>
                <p className="text-xs text-slate-400 mt-1">{item.suggestion}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 mt-2">大きな変動はありません。生体の様子、ポリプの開き、機材の動作を通常通り観察してください。</p>
        )}
      </div>
    </div>
  )
}

function TankDataPanel({ text, locale, aquarium, lastWaterChange, saving, savingTargets, targetSettings, parameters, onSaveVolume, onSaveTargets }) {
  const [volume, setVolume] = useState('')
  const [preset, setPreset] = useState('sps')
  const [targets, setTargets] = useState(defaultTargets())

  useEffect(() => {
    setVolume(aquarium?.volume_liters ?? '')
  }, [aquarium?.id, aquarium?.volume_liters])

  useEffect(() => {
    setPreset(targetSettings.preset)
    setTargets(targetSettings.targets)
  }, [aquarium?.id, targetSettings.preset])

  function changePreset(nextPreset) {
    setPreset(nextPreset)
    setTargets(nextPreset === 'custom' ? targetSettings.targets : TARGET_PRESETS[nextPreset].targets)
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white">{text.tankData}</h3>
        <p className="text-xs text-slate-500">{text.tankSub}</p>
      </div>
      <div className="grid md:grid-cols-[1fr_1fr] gap-3">
        <form onSubmit={event => { event.preventDefault(); onSaveVolume(volume) }} className="bg-slate-950 border border-slate-800 rounded-md p-3">
          <label>
            <span className="text-xs text-slate-400">{text.volume}</span>
            <div className="flex gap-2 mt-1">
              <input type="number" inputMode="decimal" step="0.1" value={volume} onChange={event => setVolume(event.target.value)} placeholder="120" className="min-w-0 flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white" />
              <button type="submit" disabled={saving} className="bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md px-4 py-2 text-sm">{text.save}</button>
            </div>
          </label>
        </form>
        <div className="bg-slate-950 border border-slate-800 rounded-md p-3">
          <p className="text-xs text-slate-400">{text.recentWaterChange}</p>
          <p className="text-lg font-bold text-white mt-1">{lastWaterChange ? `${lastWaterChange.changed_at} / ${formatValue(lastWaterChange.amount_liters, 'L', locale)}` : text.notRegistered}</p>
        </div>
      </div>
      <div className="mt-4 rounded-md border border-slate-800 bg-slate-950 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <label className="flex-1">
            <span className="text-xs text-slate-400">目標プリセット</span>
            <select value={preset} onChange={event => changePreset(event.target.value)} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-3 text-white">
              {Object.entries(TARGET_PRESETS).map(([key, presetItem]) => <option key={key} value={key}>{presetItem.label}</option>)}
              <option value="custom">カスタム</option>
            </select>
          </label>
          <button type="button" disabled={savingTargets} onClick={() => onSaveTargets(preset, targets)} className="bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md px-4 py-3">
            {savingTargets ? text.saving : '目標を保存'}
          </button>
        </div>
        {preset === 'custom' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
            {parameters.filter(parameter => BUILTIN_PARAMETER_KEYS.has(parameter.key)).map(parameter => {
              const range = targets[parameter.key] || targetRangeFor(parameter, targets)
              return (
                <div key={parameter.key} className="rounded-md border border-slate-800 bg-slate-900 p-2">
                  <p className="text-xs text-slate-400">{labelFor(parameter, text)}</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <input type="number" inputMode="decimal" value={range.min ?? ''} onChange={event => setTargets(current => ({ ...current, [parameter.key]: { ...(current[parameter.key] || {}), min: parseNumber(event.target.value) } }))} className="min-w-0 bg-slate-950 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
                    <input type="number" inputMode="decimal" value={range.max ?? ''} onChange={event => setTargets(current => ({ ...current, [parameter.key]: { ...(current[parameter.key] || {}), max: parseNumber(event.target.value) } }))} className="min-w-0 bg-slate-950 border border-slate-700 rounded px-2 py-2 text-white text-sm" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function WaterLogForm({ text, parameters, form, setForm, saving, latestRecord, onSubmit, onAddCustomParameter, onHideCustomParameter }) {
  const [customForm, setCustomForm] = useState({ key: '', label: '', unit: '', step: '1', defaultValue: '' })

  function adjust(parameter, direction) {
    setForm(current => {
      const currentValue = parseNumber(current[parameter.key]) ?? parseNumber(parameter.defaultValue) ?? 0
      const step = Number(parameter.step || 1)
      const nextValue = currentValue + direction * step
      const decimals = String(step).includes('.') ? String(step).split('.')[1].length : 0
      return { ...current, [parameter.key]: Number(nextValue.toFixed(Math.min(decimals, 4))).toString() }
    })
  }

  async function submitCustomParameter(event) {
    event.preventDefault()
    await onAddCustomParameter(customForm)
    setCustomForm({ key: '', label: '', unit: '', step: '1', defaultValue: '' })
  }

  function copyPreviousValues() {
    if (!latestRecord) return
    setForm(current => {
      const next = { ...current }
      parameters.forEach(parameter => {
        const value = getRecordValue(latestRecord, parameter.key)
        if (value != null) next[parameter.key] = String(value)
      })
      return next
    })
  }

  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white">{text.todayWater}</h3>
        <div className="flex gap-2">
          <button type="button" onClick={copyPreviousValues} disabled={!latestRecord} className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-cyan-200 disabled:text-slate-600">
            前回値をコピー
          </button>
          <input type="date" value={form.measured_at} onChange={event => setForm(current => ({ ...current, measured_at: event.target.value }))} className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {parameters.map(parameter => (
          <div key={parameter.key}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400">{labelFor(parameter, text)} {parameter.unit}</span>
              {!parameter.isBuiltin && <button type="button" onClick={() => onHideCustomParameter(parameter.key)} className="text-[11px] text-slate-500 hover:text-rose-300">非表示</button>}
            </div>
            <div className="grid grid-cols-[48px_1fr_48px] gap-2 mt-1">
              <button type="button" onClick={() => adjust(parameter, -1)} className="min-h-[48px] rounded-md border border-slate-700 bg-slate-950 text-xl font-bold text-cyan-200 active:bg-cyan-950">-</button>
              <input type="number" inputMode="decimal" step={parameter.step} value={form[parameter.key] ?? ''} onChange={event => setForm(current => ({ ...current, [parameter.key]: event.target.value }))} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-center text-white" />
              <button type="button" onClick={() => adjust(parameter, 1)} className="min-h-[48px] rounded-md border border-slate-700 bg-slate-950 text-xl font-bold text-cyan-200 active:bg-cyan-950">+</button>
            </div>
          </div>
        ))}
      </div>
      <textarea rows={2} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder={text.waterNotes} className="mt-3 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white resize-none" />
      <button type="submit" disabled={saving} className="w-full bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3 mt-3">{saving ? text.saving : text.saveWater}</button>

      <div className="mt-5 pt-4 border-t border-slate-800">
        <p className="text-sm font-bold text-white">カスタム項目</p>
        <div className="grid md:grid-cols-[1fr_1fr_90px_90px_110px] gap-2 mt-3">
          <input value={customForm.label} onChange={event => setCustomForm(current => ({ ...current, label: event.target.value }))} placeholder="表示名 例: カリウム" className="bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          <input value={customForm.key} onChange={event => setCustomForm(current => ({ ...current, key: event.target.value }))} placeholder="key 例: potassium" className="bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          <input value={customForm.unit} onChange={event => setCustomForm(current => ({ ...current, unit: event.target.value }))} placeholder="単位" className="bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          <input type="number" inputMode="decimal" value={customForm.step} onChange={event => setCustomForm(current => ({ ...current, step: event.target.value }))} placeholder="step" className="bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          <button type="button" onClick={submitCustomParameter} disabled={!customForm.label || !customForm.key} className="bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md px-3 py-3">追加</button>
        </div>
      </div>
    </form>
  )
}

function InventoryPanel({ text, locale, additives, inventory, form, setForm, saving, onSubmit, onArchive }) {
  const groupedAdditives = groupByBrand(additives)
  const lowItems = inventory.filter(item => Number(item.remaining_amount) <= Number(item.low_stock_threshold))

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white">{text.inventoryTitle}</h3>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <label>
          <span className="text-xs text-slate-400">{text.additive}</span>
          <select value={form.additive_product_id} onChange={event => {
            const product = additives.find(item => item.id === event.target.value)
            setForm(current => ({ ...current, additive_product_id: event.target.value, unit: product?.default_unit || 'ml' }))
          }} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white">
            {Object.entries(groupedAdditives).map(([brand, products]) => (
              <optgroup key={brand} label={brand}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label><span className="text-xs text-slate-400">{text.capacity}</span><input required type="number" inputMode="decimal" step="0.001" value={form.initial_amount} onChange={event => setForm(current => ({ ...current, initial_amount: event.target.value, remaining_amount: current.remaining_amount || event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
          <label><span className="text-xs text-slate-400">{text.remaining}</span><input type="number" inputMode="decimal" step="0.001" value={form.remaining_amount} onChange={event => setForm(current => ({ ...current, remaining_amount: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
          <label><span className="text-xs text-slate-400">{text.unit}</span><input value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        </div>
        <label><span className="text-xs text-slate-400">{text.alertRemaining}</span><input type="number" inputMode="decimal" step="0.001" value={form.low_stock_threshold} onChange={event => setForm(current => ({ ...current, low_stock_threshold: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        <input value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder={text.memo} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
        <button type="submit" disabled={saving || !form.additive_product_id} className="w-full bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3">{saving ? text.registering : text.registerAdditive}</button>
      </form>
      <div className="mt-4 divide-y divide-slate-800">
        {inventory.slice(0, 8).map(item => <InventoryRow key={item.id} text={text} locale={locale} item={item} low={lowItems.some(low => low.id === item.id)} onArchive={onArchive} />)}
        {inventory.length === 0 && <p className="py-6 text-center text-sm text-slate-500">{text.noInventory}</p>}
      </div>
    </div>
  )
}

function InventoryRow({ text, locale, item, low, onArchive }) {
  const percent = Number(item.initial_amount) > 0 ? Math.max(0, Math.min(100, Number(item.remaining_amount) / Number(item.initial_amount) * 100)) : 0
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{productLabel(item.additive_products)}</p>
          <p className={`text-xs mt-1 ${low ? 'text-amber-300' : 'text-slate-400'}`}>{text.remaining} {formatValue(item.remaining_amount, item.unit, locale)} / {formatValue(item.initial_amount, item.unit, locale)}</p>
        </div>
        <button type="button" onClick={() => onArchive(item.id)} className="text-xs text-slate-500 hover:text-white">{text.hide}</button>
      </div>
      <div className="h-2 bg-slate-950 rounded-full overflow-hidden mt-2">
        <div className={low ? 'h-full bg-amber-400' : 'h-full bg-emerald-400'} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function WaterChangePanel({ text, locale, form, setForm, saving, waterChanges, onSubmit }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white">{text.waterChangeHistory}</h3>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label><span className="text-xs text-slate-400">{text.date}</span><input type="date" value={form.changed_at} onChange={event => setForm(current => ({ ...current, changed_at: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
          <label><span className="text-xs text-slate-400">{text.waterChangeLiters}</span><input required type="number" inputMode="decimal" step="0.1" value={form.amount_liters} onChange={event => setForm(current => ({ ...current, amount_liters: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        </div>
        <input value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder={text.memo} className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
        <button type="submit" disabled={saving} className="w-full bg-sky-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3">{saving ? text.saving : text.saveWaterChange}</button>
      </form>
      <div className="mt-4 divide-y divide-slate-800">
        {waterChanges.slice(0, 8).map(change => (
          <div key={change.id} className="py-3">
            <p className="text-sm font-semibold text-white">{change.changed_at} / {formatValue(change.amount_liters, 'L', locale)}</p>
            {change.notes && <p className="text-xs text-slate-500 mt-1">{change.notes}</p>}
          </div>
        ))}
        {waterChanges.length === 0 && <p className="py-6 text-center text-sm text-slate-500">{text.noWaterChanges}</p>}
      </div>
    </div>
  )
}

function AdditiveDoseForm({ text, locale, additives, inventory, form, setForm, saving, onSubmit }) {
  const groupedAdditives = groupByBrand(additives)

  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white">{text.doseTitle}</h3>
        <input type="date" value={form.dosed_at} onChange={event => setForm(current => ({ ...current, dosed_at: event.target.value }))} className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm" />
      </div>
      <div className="grid md:grid-cols-[1fr_1fr_120px_90px] gap-3">
        <label>
          <span className="text-xs text-slate-400">{text.fromInventory}</span>
          <select value={form.additive_inventory_id} onChange={event => {
            const item = inventory.find(row => row.id === event.target.value)
            setForm(current => ({ ...current, additive_inventory_id: event.target.value, additive_product_id: item?.additive_product_id || current.additive_product_id, unit: item?.unit || current.unit }))
          }} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white">
            <option value="">{text.noInventoryUse}</option>
            {inventory.map(item => <option key={item.id} value={item.id}>{productLabel(item.additive_products)} / {text.remainingPrefix} {formatValue(item.remaining_amount, item.unit, locale)}</option>)}
          </select>
        </label>
        <label>
          <span className="text-xs text-slate-400">{text.masterAdditive}</span>
          <select value={form.additive_product_id} onChange={event => {
            const product = additives.find(item => item.id === event.target.value)
            setForm(current => ({ ...current, additive_inventory_id: '', additive_product_id: event.target.value, unit: product?.default_unit || 'ml' }))
          }} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white">
            {Object.entries(groupedAdditives).map(([brand, products]) => (
              <optgroup key={brand} label={brand}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <label><span className="text-xs text-slate-400">{text.amount}</span><input required type="number" inputMode="decimal" step="0.001" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        <label><span className="text-xs text-slate-400">{text.unit}</span><input value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
      </div>
      <input value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder={text.memo} className="mt-3 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
      <button type="submit" disabled={saving || !form.additive_product_id} className="w-full bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3 mt-3">{saving ? text.saving : text.saveDose}</button>
    </form>
  )
}

function EventLogPanel({ form, setForm, events, saving, onSubmit }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">作業・イベントログ</h3>
          <p className="text-xs text-slate-500 mt-1">将来、水質グラフ上にマーカー表示するための記録です。</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <div className="grid sm:grid-cols-[150px_160px_1fr] gap-3">
          <input type="date" value={form.event_at} onChange={event => setForm(current => ({ ...current, event_at: event.target.value }))} className="bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          <select value={form.event_type} onChange={event => setForm(current => ({ ...current, event_type: event.target.value }))} className="bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white">
            {EVENT_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
          </select>
          <input value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="例: スキマー清掃、照明を1時間短縮" className="bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
        </div>
        <input value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="メモ" className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
        <button type="submit" disabled={saving || !form.title.trim()} className="w-full bg-violet-300 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3">
          {saving ? '保存中...' : 'イベントを記録'}
        </button>
      </form>
      <div className="mt-4 divide-y divide-slate-800">
        {events.slice(0, 8).map(event => {
          const type = EVENT_TYPES.find(item => item.value === event.event_type)
          return (
            <div key={event.id} className="py-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-950 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-300">{type?.label || event.event_type}</span>
                <p className="text-sm font-semibold text-white">{event.event_at} / {event.title}</p>
              </div>
              {event.notes && <p className="text-xs text-slate-500 mt-1">{event.notes}</p>}
            </div>
          )
        })}
        {events.length === 0 && <p className="py-6 text-center text-sm text-slate-500">まだイベントログはありません。</p>}
      </div>
    </div>
  )
}

function groupByBrand(additives) {
  return additives.reduce((groups, product) => {
    if (!groups[product.brand]) groups[product.brand] = []
    groups[product.brand].push(product)
    return groups
  }, {})
}

function PeriodSwitch({ text, value, onChange }) {
  return <div className="flex gap-2">{[7, 30].map(days => <button key={days} type="button" onClick={() => onChange(days)} className={`text-xs px-3 py-2 rounded-md border ${value === days ? 'border-cyan-500 bg-cyan-950 text-cyan-200' : 'border-slate-700 text-slate-400'}`}>{days === 7 ? text.week : text.month}</button>)}</div>
}

function TrendCard({ text, locale, records, parameter, periodDays, target }) {
  const points = useChartPoints(records, parameter.key, periodDays)
  const values = points.map(point => point.value)
  const label = labelFor(parameter, text)
  const latestValue = values.length ? values[values.length - 1] : null

  return (
    <ChartCard title={label} subtitle={`目標 ${formatValue(target.min, parameter.unit, locale)} - ${formatValue(target.max, parameter.unit, locale)}`} color={parameter.color} points={points} unit={parameter.unit} minGuide={target.min} maxGuide={target.max} text={text} locale={locale}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        <Stat label={text.latest} value={latestValue} unit={parameter.unit} locale={locale} />
        <Stat label={text.average} value={average(values)} unit={parameter.unit} locale={locale} />
        <Stat label={text.minimum} value={values.length ? Math.min(...values) : null} unit={parameter.unit} locale={locale} />
        <Stat label={text.maximum} value={values.length ? Math.max(...values) : null} unit={parameter.unit} locale={locale} />
      </div>
    </ChartCard>
  )
}

function AdditiveTrendCard({ text, locale, product, logs, periodDays }) {
  const points = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - periodDays + 1)
    const daily = new Map()
    logs.filter(log => log.additive_product_id === product.id && new Date(`${log.dosed_at}T00:00:00`) >= start).forEach(log => {
      daily.set(log.dosed_at, (daily.get(log.dosed_at) || 0) + Number(log.amount))
    })
    return [...daily.entries()].map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date))
  }, [logs, product.id, periodDays])

  return <ChartCard title={`${product.brand} ${product.name}`} subtitle={product.category} color="#34d399" points={points} unit={product.default_unit} text={text} locale={locale} />
}

function useChartPoints(records, key, periodDays) {
  return useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - periodDays + 1)
    return records
      .filter(record => {
        const value = record[key] ?? record.custom_values?.[key]
        return new Date(`${record.measured_at}T00:00:00`) >= start && value != null
      })
      .map(record => ({ date: record.measured_at, value: Number(record[key] ?? record.custom_values?.[key]) }))
      .reverse()
  }, [records, key, periodDays])
}

function ChartCard({ title, subtitle, color, points, unit, minGuide, maxGuide, children, text, locale }) {
  const values = points.map(point => point.value)
  const minValue = values.length ? Math.min(...values, minGuide ?? values[0]) : minGuide ?? 0
  const maxValue = values.length ? Math.max(...values, maxGuide ?? values[0]) : maxGuide ?? 1
  const range = maxValue - minValue || 1
  const x = index => 8 + (index / Math.max(points.length - 1, 1)) * 84
  const y = value => 88 - ((value - minValue) / range) * 76
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${x(index)} ${y(point.value)}`).join(' ')

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div><h4 className="font-bold text-white">{title}</h4><p className="text-xs text-slate-500 mt-1">{subtitle}</p></div>
        <span className="text-xs text-slate-500">{text.points(points.length)}</span>
      </div>
      <div className="aspect-[16/8] min-h-[160px] mt-3">
        {points.length ? (
          <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={title}>
            {minGuide != null && maxGuide != null && <rect x="8" y={y(maxGuide)} width="84" height={Math.max(y(minGuide) - y(maxGuide), 1)} fill="#064e3b" opacity="0.3" />}
            {[0, 1, 2, 3, 4].map(index => <line key={index} x1="8" x2="92" y1={12 + index * 19} y2={12 + index * 19} stroke="#334155" strokeWidth="0.3" />)}
            <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => <circle key={`${point.date}-${index}`} cx={x(index)} cy={y(point.value)} r="1.8" fill={color} />)}
          </svg>
        ) : <div className="h-full flex flex-col items-center justify-center px-4 text-center text-sm text-slate-500"><p>{text.noRecords}</p><p className="mt-1 text-xs">まずはKHだけでも記録すると、推移と目標レンジが見えるようになります。</p></div>}
      </div>
      {children}
      {points.length > 0 && <p className="text-xs text-slate-500 mt-3">{text.latest}: {points[points.length - 1].date} / {formatValue(points[points.length - 1].value, unit, locale)}</p>}
    </div>
  )
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

function Stat({ label, value, unit, locale }) {
  return <div className="bg-slate-950 border border-slate-800 rounded-md p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="text-sm font-bold text-white mt-1">{value == null ? '-' : formatValue(Number(value.toFixed(3)), unit, locale)}</p></div>
}

function RecentLists({ text, locale, records, doseLogs, loading, error }) {
  const emptyWater = error ? (
    <span className="text-rose-300">水質記録の読み込みでエラーが発生しました。</span>
  ) : (
    <span>まだ記録がありません。まずはKHだけでも記録してみましょう。前回値コピーで次回入力が楽になります。</span>
  )

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <RecentPanel title={text.recentWaterRecords} emptyText={loading ? text.loading : emptyWater} items={records.slice(0, 8)} renderItem={record => (
        <>
          <p className="text-sm font-semibold text-white">{record.measured_at}</p>
          <p className="text-xs text-slate-400 mt-1">{text.parameters.temperature} {formatValue(getRecordValue(record, 'temperature'), '°C', locale)} / KH {formatValue(getRecordValue(record, 'kh'), 'dKH', locale)} / NO3 {formatValue(getRecordValue(record, 'nitrate'), 'ppm', locale)}</p>
        </>
      )} />
      <RecentPanel title={text.recentDoseRecords} emptyText={text.noDoseRecords} items={doseLogs.slice(0, 8)} renderItem={log => (
        <>
          <p className="text-sm font-semibold text-white">{log.dosed_at}</p>
          <p className="text-xs text-slate-400 mt-1">{productLabel(log.additive_products)} / {formatValue(log.amount, log.unit, locale)}</p>
        </>
      )} />
    </div>
  )
}

function RecentPanel({ title, items, emptyText, renderItem }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800"><h3 className="font-bold text-white">{title}</h3></div>
      <div className="divide-y divide-slate-800">
        {items.length ? items.map(item => <div key={item.id} className="px-4 py-3">{renderItem(item)}</div>) : <p className="p-8 text-center text-slate-500">{emptyText}</p>}
      </div>
    </div>
  )
}
