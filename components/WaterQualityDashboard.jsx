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
  { key: 'temperature', unit: '°C', min: 24, max: 26.5, step: '0.1', color: '#22d3ee' },
  { key: 'salinity', unit: '', min: 1.024, max: 1.026, step: '0.001', color: '#38bdf8' },
  { key: 'ph', unit: '', min: 8.0, max: 8.4, step: '0.1', color: '#a78bfa' },
  { key: 'kh', unit: 'dKH', min: 7.0, max: 9.0, step: '0.1', color: '#f59e0b' },
  { key: 'calcium', unit: 'ppm', min: 400, max: 450, step: '1', color: '#f472b6' },
  { key: 'magnesium', unit: 'ppm', min: 1250, max: 1400, step: '1', color: '#818cf8' },
  { key: 'nitrate', unit: 'ppm', min: 0.2, max: 10, step: '0.1', color: '#34d399' },
  { key: 'phosphate', unit: 'ppm', min: 0.02, max: 0.08, step: '0.01', color: '#fb7185' },
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
  return text.parameters[parameter.key] || parameter.key
}

export default function WaterQualityDashboard({ locale = 'ja' }) {
  const text = TEXT[locale] || TEXT.ja
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [aquariums, setAquariums] = useState([])
  const [selectedAquariumId, setSelectedAquariumId] = useState('')
  const [records, setRecords] = useState([])
  const [additives, setAdditives] = useState([])
  const [inventory, setInventory] = useState([])
  const [doseLogs, setDoseLogs] = useState([])
  const [waterChanges, setWaterChanges] = useState([])
  const [waterForm, setWaterForm] = useState(initialWaterForm)
  const [doseForm, setDoseForm] = useState(initialDoseForm)
  const [inventoryForm, setInventoryForm] = useState(initialInventoryForm)
  const [waterChangeForm, setWaterChangeForm] = useState(initialWaterChangeForm)
  const [periodDays, setPeriodDays] = useState(7)
  const [savingWater, setSavingWater] = useState(false)
  const [savingDose, setSavingDose] = useState(false)
  const [savingInventory, setSavingInventory] = useState(false)
  const [savingTank, setSavingTank] = useState(false)
  const [savingWaterChange, setSavingWaterChange] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetchAdditives()
    if (session) bootstrap(session.user.id)
    else {
      setAquariums([])
      setRecords([])
      setInventory([])
      setDoseLogs([])
      setWaterChanges([])
      setSelectedAquariumId('')
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (selectedAquariumId) {
      fetchWaterLogs(selectedAquariumId)
      fetchInventory(selectedAquariumId)
      fetchDoseLogs(selectedAquariumId)
      fetchWaterChanges(selectedAquariumId)
    }
  }, [selectedAquariumId])

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
      const { data, error } = await supabase.from('aquariums').select('*').order('created_at')
      if (error) throw error
      if (data?.length) {
        setAquariums(data)
        setSelectedAquariumId(data[0].id)
      } else {
        const { data: created, error: createError } = await supabase
          .from('aquariums')
          .insert({ name: 'Main Reef Tank', user_id: userId, volume_liters: 100 })
          .select('*')
          .single()
        if (createError) throw createError
        setAquariums([created])
        setSelectedAquariumId(created.id)
      }
    } catch (err) {
      setError(text.loadTankError)
      console.error(err)
    } finally {
      setLoading(false)
    }
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

  async function sendMagicLink(event) {
    event.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    setAuthMessage(error ? error.message : text.loginSent)
  }

  async function saveTankVolume(volumeLiters) {
    setSavingTank(true)
    setError(null)
    const { data, error } = await supabase.from('aquariums').update({ volume_liters: parseNumber(volumeLiters) }).eq('id', selectedAquariumId).select('*').single()
    if (error) setError(text.saveTankError)
    else setAquariums(current => current.map(item => item.id === data.id ? data : item))
    setSavingTank(false)
  }

  async function saveWaterLog(event) {
    event.preventDefault()
    setSavingWater(true)
    setError(null)
    const payload = { aquarium_id: selectedAquariumId, user_id: session.user.id, measured_at: waterForm.measured_at, notes: waterForm.notes.trim() || null }
    PARAMETERS.forEach(parameter => { payload[parameter.key] = parseNumber(waterForm[parameter.key]) })
    const { data, error } = await supabase.from('water_quality_logs').insert(payload).select('*').single()
    if (error) setError(text.saveWaterError)
    else {
      setRecords(current => [data, ...current].slice(0, 365))
      setWaterForm(current => ({ ...initialWaterForm, measured_at: current.measured_at }))
    }
    setSavingWater(false)
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

  if (!session) return <LoginPanel text={text} email={email} authMessage={authMessage} setEmail={setEmail} sendMagicLink={sendMagicLink} />

  const selectedAquarium = aquariums.find(item => item.id === selectedAquariumId)
  const lowStockItems = inventory.filter(item => Number(item.remaining_amount) <= Number(item.low_stock_threshold))
  const lastWaterChange = waterChanges[0]

  return (
    <section className="space-y-5 pb-10">
      {error && <div className="border border-rose-800 bg-rose-950/50 rounded-lg p-4 text-rose-100 text-sm">{error}</div>}
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
          <button type="button" onClick={() => supabase.auth.signOut()} className="text-xs text-slate-500 hover:text-white">{text.logout}</button>
        </div>
      </div>

      <TankDataPanel text={text} locale={locale} aquarium={selectedAquarium} lastWaterChange={lastWaterChange} saving={savingTank} onSaveVolume={saveTankVolume} />
      <WaterLogForm text={text} form={waterForm} setForm={setWaterForm} saving={savingWater} onSubmit={saveWaterLog} />

      <div className="grid xl:grid-cols-2 gap-4">
        <InventoryPanel text={text} locale={locale} additives={additives} inventory={inventory} form={inventoryForm} setForm={setInventoryForm} saving={savingInventory} onSubmit={saveInventory} onArchive={archiveInventory} />
        <WaterChangePanel text={text} locale={locale} form={waterChangeForm} setForm={setWaterChangeForm} saving={savingWaterChange} waterChanges={waterChanges} onSubmit={saveWaterChange} />
      </div>

      <AdditiveDoseForm text={text} locale={locale} additives={additives} inventory={inventory} form={doseForm} setForm={setDoseForm} saving={savingDose} onSubmit={saveDoseLog} />

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{text.waterChart}</h3>
        <PeriodSwitch text={text} value={periodDays} onChange={setPeriodDays} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {PARAMETERS.map(parameter => <TrendCard key={parameter.key} text={text} locale={locale} records={records} parameter={parameter} periodDays={periodDays} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {additives.filter(product => doseLogs.some(log => log.additive_product_id === product.id)).map(product => (
          <AdditiveTrendCard key={product.id} text={text} locale={locale} product={product} logs={doseLogs} periodDays={periodDays} />
        ))}
      </div>

      <RecentLists text={text} locale={locale} records={records} doseLogs={doseLogs} loading={loading} />
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

function TankDataPanel({ text, locale, aquarium, lastWaterChange, saving, onSaveVolume }) {
  const [volume, setVolume] = useState('')

  useEffect(() => {
    setVolume(aquarium?.volume_liters ?? '')
  }, [aquarium?.id, aquarium?.volume_liters])

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
    </div>
  )
}

function WaterLogForm({ text, form, setForm, saving, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white">{text.todayWater}</h3>
        <input type="date" value={form.measured_at} onChange={event => setForm(current => ({ ...current, measured_at: event.target.value }))} className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PARAMETERS.map(parameter => (
          <label key={parameter.key}>
            <span className="text-xs text-slate-400">{labelFor(parameter, text)} {parameter.unit}</span>
            <input type="number" inputMode="decimal" step={parameter.step} value={form[parameter.key]} onChange={event => setForm(current => ({ ...current, [parameter.key]: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          </label>
        ))}
      </div>
      <textarea rows={2} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder={text.waterNotes} className="mt-3 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white resize-none" />
      <button type="submit" disabled={saving} className="w-full bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3 mt-3">{saving ? text.saving : text.saveWater}</button>
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

function TrendCard({ text, locale, records, parameter, periodDays }) {
  const points = useChartPoints(records, parameter.key, periodDays)
  const values = points.map(point => point.value)
  const label = labelFor(parameter, text)

  return (
    <ChartCard title={label} subtitle={`${parameter.min} - ${parameter.max} ${parameter.unit}`} color={parameter.color} points={points} unit={parameter.unit} minGuide={parameter.min} maxGuide={parameter.max} text={text} locale={locale}>
      <div className="grid grid-cols-3 gap-2 mt-2">
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
    return records.filter(record => new Date(`${record.measured_at}T00:00:00`) >= start && record[key] != null).map(record => ({ date: record.measured_at, value: Number(record[key]) })).reverse()
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
        ) : <div className="h-full flex items-center justify-center text-sm text-slate-500">{text.noRecords}</div>}
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

function RecentLists({ text, locale, records, doseLogs, loading }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <RecentPanel title={text.recentWaterRecords} emptyText={loading ? text.loading : text.noWaterRecords} items={records.slice(0, 8)} renderItem={record => (
        <>
          <p className="text-sm font-semibold text-white">{record.measured_at}</p>
          <p className="text-xs text-slate-400 mt-1">{text.parameters.temperature} {formatValue(record.temperature, '°C', locale)} / KH {formatValue(record.kh, 'dKH', locale)} / NO3 {formatValue(record.nitrate, 'ppm', locale)}</p>
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
