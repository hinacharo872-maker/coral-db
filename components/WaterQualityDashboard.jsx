'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PARAMETERS = [
  { key: 'temperature', label: '水温', unit: '°C', min: 24, max: 26.5, step: '0.1', color: '#22d3ee' },
  { key: 'salinity', label: '比重', unit: '', min: 1.024, max: 1.026, step: '0.001', color: '#38bdf8' },
  { key: 'ph', label: 'pH', unit: '', min: 8.0, max: 8.4, step: '0.1', color: '#a78bfa' },
  { key: 'kh', label: 'KH', unit: 'dKH', min: 7.0, max: 9.0, step: '0.1', color: '#f59e0b' },
  { key: 'calcium', label: 'Ca', unit: 'ppm', min: 400, max: 450, step: '1', color: '#f472b6' },
  { key: 'magnesium', label: 'Mg', unit: 'ppm', min: 1250, max: 1400, step: '1', color: '#818cf8' },
  { key: 'nitrate', label: 'NO3', unit: 'ppm', min: 0.2, max: 10, step: '0.1', color: '#34d399' },
  { key: 'phosphate', label: 'PO4', unit: 'ppm', min: 0.02, max: 0.08, step: '0.01', color: '#fb7185' },
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

function formatValue(value, unit) {
  if (value == null) return '-'
  return `${Number(value).toLocaleString('ja-JP', { maximumFractionDigits: 3 })}${unit ? ` ${unit}` : ''}`
}

function productLabel(product) {
  if (!product) return ''
  return `${product.brand} ${product.name}`
}

export default function WaterQualityDashboard() {
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
      setError('水槽データを読み込めませんでした。')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWaterLogs(aquariumId) {
    const { data, error } = await supabase
      .from('water_quality_logs')
      .select('*')
      .eq('aquarium_id', aquariumId)
      .order('measured_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(365)

    if (error) setError('水質ログを読み込めませんでした。')
    else setRecords(data ?? [])
  }

  async function fetchInventory(aquariumId) {
    const { data, error } = await supabase
      .from('additive_inventory')
      .select('*, additive_products(*)')
      .eq('aquarium_id', aquariumId)
      .is('archived_at', null)
      .order('created_at', { ascending: false })

    if (error) setError('添加剤の在庫を読み込めませんでした。')
    else setInventory(data ?? [])
  }

  async function fetchDoseLogs(aquariumId) {
    const { data, error } = await supabase
      .from('additive_dose_logs')
      .select('*, additive_products(*), additive_inventory(*)')
      .eq('aquarium_id', aquariumId)
      .order('dosed_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(365)

    if (error) setError('添加ログを読み込めませんでした。')
    else setDoseLogs(data ?? [])
  }

  async function fetchWaterChanges(aquariumId) {
    const { data, error } = await supabase
      .from('water_change_logs')
      .select('*')
      .eq('aquarium_id', aquariumId)
      .order('changed_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) setError('水換え履歴を読み込めませんでした。')
    else setWaterChanges(data ?? [])
  }

  async function sendMagicLink(event) {
    event.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    setAuthMessage(error ? error.message : 'ログインリンクをメールへ送りました。')
  }

  async function saveTankVolume(volumeLiters) {
    setSavingTank(true)
    setError(null)
    const { data, error } = await supabase
      .from('aquariums')
      .update({ volume_liters: parseNumber(volumeLiters) })
      .eq('id', selectedAquariumId)
      .select('*')
      .single()

    if (error) setError('水槽データを保存できませんでした。')
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

    if (error) setError('水質ログを保存できませんでした。')
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

    if (error) setError('持っている添加剤を登録できませんでした。')
    else {
      setInventory(current => [data, ...current])
      setInventoryForm(current => ({
        ...initialInventoryForm,
        additive_product_id: current.additive_product_id,
        unit: current.unit,
        low_stock_threshold: current.low_stock_threshold,
      }))
    }
    setSavingInventory(false)
  }

  async function archiveInventory(id) {
    const { data, error } = await supabase
      .from('additive_inventory')
      .update({ archived_at: new Date().toISOString() })
      .eq('id', id)
      .select('id')
      .single()

    if (error) setError('添加剤を一覧から外せませんでした。')
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
    const payload = {
      aquarium_id: selectedAquariumId,
      user_id: session.user.id,
      additive_product_id: productId,
      additive_inventory_id: selectedInventory?.id || null,
      dosed_at: doseForm.dosed_at,
      amount,
      unit,
      notes: doseForm.notes.trim() || null,
    }
    const { data, error } = await supabase.from('additive_dose_logs').insert(payload).select('*, additive_products(*), additive_inventory(*)').single()

    if (error) {
      setError('添加ログを保存できませんでした。')
      setSavingDose(false)
      return
    }

    setDoseLogs(current => [data, ...current].slice(0, 365))

    if (selectedInventory && amount != null) {
      const nextRemaining = Math.max(0, Number(selectedInventory.remaining_amount) - amount)
      const { error: updateError } = await supabase
        .from('additive_inventory')
        .update({ remaining_amount: nextRemaining })
        .eq('id', selectedInventory.id)

      if (updateError) setError('添加ログは保存しましたが、残量の更新に失敗しました。')
      else setInventory(current => current.map(item => item.id === selectedInventory.id ? { ...item, remaining_amount: nextRemaining } : item))
    }

    setDoseForm(current => ({
      ...initialDoseForm,
      dosed_at: current.dosed_at,
      additive_inventory_id: current.additive_inventory_id,
      additive_product_id: current.additive_product_id,
      unit,
    }))
    setSavingDose(false)
  }

  async function saveWaterChange(event) {
    event.preventDefault()
    setSavingWaterChange(true)
    setError(null)
    const payload = {
      aquarium_id: selectedAquariumId,
      user_id: session.user.id,
      changed_at: waterChangeForm.changed_at,
      amount_liters: parseNumber(waterChangeForm.amount_liters),
      notes: waterChangeForm.notes.trim() || null,
    }
    const { data, error } = await supabase.from('water_change_logs').insert(payload).select('*').single()

    if (error) setError('水換え履歴を保存できませんでした。')
    else {
      setWaterChanges(current => [data, ...current].slice(0, 100))
      setWaterChangeForm(current => ({ ...initialWaterChangeForm, changed_at: current.changed_at }))
    }
    setSavingWaterChange(false)
  }

  if (!session) return <LoginPanel email={email} authMessage={authMessage} setEmail={setEmail} sendMagicLink={sendMagicLink} />

  const selectedAquarium = aquariums.find(item => item.id === selectedAquariumId)
  const lowStockItems = inventory.filter(item => Number(item.remaining_amount) <= Number(item.low_stock_threshold))
  const lastWaterChange = waterChanges[0]

  return (
    <section className="space-y-5 pb-10">
      {error && <div className="border border-rose-800 bg-rose-950/50 rounded-lg p-4 text-rose-100 text-sm">{error}</div>}
      {lowStockItems.length > 0 && <LowStockAlert items={lowStockItems} />}

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-cyan-300 font-semibold">PRIVATE REEF LOG</p>
          <h2 className="text-2xl font-bold text-white">{selectedAquarium?.name || '水質管理'}</h2>
        </div>
        <div className="flex items-center gap-2">
          <select value={selectedAquariumId} onChange={event => setSelectedAquariumId(event.target.value)} className="max-w-[140px] bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-white">
            {aquariums.map(aquarium => <option key={aquarium.id} value={aquarium.id}>{aquarium.name}</option>)}
          </select>
          <button type="button" onClick={() => supabase.auth.signOut()} className="text-xs text-slate-500 hover:text-white">退出</button>
        </div>
      </div>

      <TankDataPanel aquarium={selectedAquarium} lastWaterChange={lastWaterChange} saving={savingTank} onSaveVolume={saveTankVolume} />
      <WaterLogForm form={waterForm} setForm={setWaterForm} saving={savingWater} onSubmit={saveWaterLog} />

      <div className="grid xl:grid-cols-2 gap-4">
        <InventoryPanel additives={additives} inventory={inventory} form={inventoryForm} setForm={setInventoryForm} saving={savingInventory} onSubmit={saveInventory} onArchive={archiveInventory} />
        <WaterChangePanel form={waterChangeForm} setForm={setWaterChangeForm} saving={savingWaterChange} waterChanges={waterChanges} onSubmit={saveWaterChange} />
      </div>

      <AdditiveDoseForm additives={additives} inventory={inventory} form={doseForm} setForm={setDoseForm} saving={savingDose} onSubmit={saveDoseLog} />

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-white">水質グラフ</h3>
        <PeriodSwitch value={periodDays} onChange={setPeriodDays} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {PARAMETERS.map(parameter => <TrendCard key={parameter.key} records={records} parameter={parameter} periodDays={periodDays} />)}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {additives.filter(product => doseLogs.some(log => log.additive_product_id === product.id)).map(product => (
          <AdditiveTrendCard key={product.id} product={product} logs={doseLogs} periodDays={periodDays} />
        ))}
      </div>

      <RecentLists records={records} doseLogs={doseLogs} loading={loading} />
    </section>
  )
}

function LoginPanel({ email, authMessage, setEmail, sendMagicLink }) {
  return (
    <section className="max-w-md mx-auto py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <p className="text-cyan-300 text-sm font-semibold">PRIVATE REEF LOG</p>
        <h2 className="text-2xl font-bold text-white mt-1">水質記録へログイン</h2>
        <p className="text-sm text-slate-400 mt-2">水質、添加剤、水換え履歴をアカウントごとに保存します。</p>
        <form onSubmit={sendMagicLink} className="mt-5">
          <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="メールアドレス" className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          <button type="submit" className="w-full bg-cyan-400 text-slate-950 font-bold rounded-md py-3 mt-3">ログインリンクを送る</button>
          {authMessage && <p className="text-xs text-cyan-300 mt-3">{authMessage}</p>}
        </form>
      </div>
    </section>
  )
}

function LowStockAlert({ items }) {
  return (
    <div className="border border-amber-700 bg-amber-950/50 rounded-lg p-4">
      <p className="font-bold text-amber-100">添加剤の残量が少なくなっています</p>
      <p className="text-sm text-amber-200 mt-1">
        {items.slice(0, 3).map(item => `${productLabel(item.additive_products)} ${formatValue(item.remaining_amount, item.unit)}`).join(' / ')}
        {items.length > 3 ? ` ほか${items.length - 3}件` : ''}
      </p>
    </div>
  )
}

function TankDataPanel({ aquarium, lastWaterChange, saving, onSaveVolume }) {
  const [volume, setVolume] = useState('')

  useEffect(() => {
    setVolume(aquarium?.volume_liters ?? '')
  }, [aquarium?.id, aquarium?.volume_liters])

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white">Tankデータ</h3>
        <p className="text-xs text-slate-500">水量と直近の水換え</p>
      </div>
      <div className="grid md:grid-cols-[1fr_1fr] gap-3">
        <form onSubmit={event => { event.preventDefault(); onSaveVolume(volume) }} className="bg-slate-950 border border-slate-800 rounded-md p-3">
          <label>
            <span className="text-xs text-slate-400">水量</span>
            <div className="flex gap-2 mt-1">
              <input type="number" inputMode="decimal" step="0.1" value={volume} onChange={event => setVolume(event.target.value)} placeholder="例: 120" className="min-w-0 flex-1 bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-white" />
              <button type="submit" disabled={saving} className="bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md px-4 py-2 text-sm">保存</button>
            </div>
          </label>
        </form>
        <div className="bg-slate-950 border border-slate-800 rounded-md p-3">
          <p className="text-xs text-slate-400">直近の水換え</p>
          <p className="text-lg font-bold text-white mt-1">{lastWaterChange ? `${lastWaterChange.changed_at} / ${formatValue(lastWaterChange.amount_liters, 'L')}` : '未登録'}</p>
        </div>
      </div>
    </div>
  )
}

function WaterLogForm({ form, setForm, saving, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white">今日の水質</h3>
        <input type="date" value={form.measured_at} onChange={event => setForm(current => ({ ...current, measured_at: event.target.value }))} className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PARAMETERS.map(parameter => (
          <label key={parameter.key}>
            <span className="text-xs text-slate-400">{parameter.label} {parameter.unit}</span>
            <input type="number" inputMode="decimal" step={parameter.step} value={form[parameter.key]} onChange={event => setForm(current => ({ ...current, [parameter.key]: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
          </label>
        ))}
      </div>
      <textarea rows={2} value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="換水、添加剤、生体の様子など" className="mt-3 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white resize-none" />
      <button type="submit" disabled={saving} className="w-full bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3 mt-3">{saving ? '保存中...' : '水質を記録'}</button>
    </form>
  )
}

function InventoryPanel({ additives, inventory, form, setForm, saving, onSubmit, onArchive }) {
  const groupedAdditives = groupByBrand(additives)
  const lowItems = inventory.filter(item => Number(item.remaining_amount) <= Number(item.low_stock_threshold))

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white">持っている添加剤</h3>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <label>
          <span className="text-xs text-slate-400">添加剤</span>
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
          <label><span className="text-xs text-slate-400">容量</span><input required type="number" inputMode="decimal" step="0.001" value={form.initial_amount} onChange={event => setForm(current => ({ ...current, initial_amount: event.target.value, remaining_amount: current.remaining_amount || event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
          <label><span className="text-xs text-slate-400">残量</span><input type="number" inputMode="decimal" step="0.001" value={form.remaining_amount} onChange={event => setForm(current => ({ ...current, remaining_amount: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
          <label><span className="text-xs text-slate-400">単位</span><input value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        </div>
        <label><span className="text-xs text-slate-400">アラート残量</span><input type="number" inputMode="decimal" step="0.001" value={form.low_stock_threshold} onChange={event => setForm(current => ({ ...current, low_stock_threshold: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        <input value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="メモ" className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
        <button type="submit" disabled={saving || !form.additive_product_id} className="w-full bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3">{saving ? '登録中...' : '添加剤を登録'}</button>
      </form>
      <div className="mt-4 divide-y divide-slate-800">
        {inventory.slice(0, 8).map(item => <InventoryRow key={item.id} item={item} low={lowItems.some(low => low.id === item.id)} onArchive={onArchive} />)}
        {inventory.length === 0 && <p className="py-6 text-center text-sm text-slate-500">手持ちの添加剤を登録してください。</p>}
      </div>
    </div>
  )
}

function InventoryRow({ item, low, onArchive }) {
  const percent = Number(item.initial_amount) > 0 ? Math.max(0, Math.min(100, Number(item.remaining_amount) / Number(item.initial_amount) * 100)) : 0
  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{productLabel(item.additive_products)}</p>
          <p className={`text-xs mt-1 ${low ? 'text-amber-300' : 'text-slate-400'}`}>残量 {formatValue(item.remaining_amount, item.unit)} / {formatValue(item.initial_amount, item.unit)}</p>
        </div>
        <button type="button" onClick={() => onArchive(item.id)} className="text-xs text-slate-500 hover:text-white">非表示</button>
      </div>
      <div className="h-2 bg-slate-950 rounded-full overflow-hidden mt-2">
        <div className={low ? 'h-full bg-amber-400' : 'h-full bg-emerald-400'} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

function WaterChangePanel({ form, setForm, saving, waterChanges, onSubmit }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white">水換え履歴</h3>
      <form onSubmit={onSubmit} className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label><span className="text-xs text-slate-400">日付</span><input type="date" value={form.changed_at} onChange={event => setForm(current => ({ ...current, changed_at: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
          <label><span className="text-xs text-slate-400">水換え量 L</span><input required type="number" inputMode="decimal" step="0.1" value={form.amount_liters} onChange={event => setForm(current => ({ ...current, amount_liters: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        </div>
        <input value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="メモ" className="w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
        <button type="submit" disabled={saving} className="w-full bg-sky-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3">{saving ? '保存中...' : '水換えを記録'}</button>
      </form>
      <div className="mt-4 divide-y divide-slate-800">
        {waterChanges.slice(0, 8).map(change => (
          <div key={change.id} className="py-3">
            <p className="text-sm font-semibold text-white">{change.changed_at} / {formatValue(change.amount_liters, 'L')}</p>
            {change.notes && <p className="text-xs text-slate-500 mt-1">{change.notes}</p>}
          </div>
        ))}
        {waterChanges.length === 0 && <p className="py-6 text-center text-sm text-slate-500">水換え履歴はまだありません。</p>}
      </div>
    </div>
  )
}

function AdditiveDoseForm({ additives, inventory, form, setForm, saving, onSubmit }) {
  const groupedAdditives = groupByBrand(additives)

  return (
    <form onSubmit={onSubmit} className="bg-slate-900 border border-slate-800 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg font-bold text-white">添加剤の記録</h3>
        <input type="date" value={form.dosed_at} onChange={event => setForm(current => ({ ...current, dosed_at: event.target.value }))} className="bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white text-sm" />
      </div>
      <div className="grid md:grid-cols-[1fr_1fr_120px_90px] gap-3">
        <label>
          <span className="text-xs text-slate-400">手持ちから選択</span>
          <select value={form.additive_inventory_id} onChange={event => {
            const item = inventory.find(row => row.id === event.target.value)
            setForm(current => ({
              ...current,
              additive_inventory_id: event.target.value,
              additive_product_id: item?.additive_product_id || current.additive_product_id,
              unit: item?.unit || current.unit,
            }))
          }} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white">
            <option value="">在庫を使わない</option>
            {inventory.map(item => <option key={item.id} value={item.id}>{productLabel(item.additive_products)} / 残 {formatValue(item.remaining_amount, item.unit)}</option>)}
          </select>
        </label>
        <label>
          <span className="text-xs text-slate-400">添加剤マスタ</span>
          <select value={form.additive_product_id} onChange={event => {
            const product = additives.find(item => item.id === event.target.value)
            setForm(current => ({ ...current, additive_inventory_id: '', additive_product_id: event.target.value, unit: product?.default_unit || 'ml' }))
          }} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white">
            {Object.entries(groupedAdditives).map(([brand, products]) => (
              <optgroup key={brand} label={brand}>{products.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}</optgroup>
            ))}
          </select>
        </label>
        <label><span className="text-xs text-slate-400">添加量</span><input required type="number" inputMode="decimal" step="0.001" value={form.amount} onChange={event => setForm(current => ({ ...current, amount: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
        <label><span className="text-xs text-slate-400">単位</span><input value={form.unit} onChange={event => setForm(current => ({ ...current, unit: event.target.value }))} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" /></label>
      </div>
      <input value={form.notes} onChange={event => setForm(current => ({ ...current, notes: event.target.value }))} placeholder="メモ" className="mt-3 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-3 text-white" />
      <button type="submit" disabled={saving || !form.additive_product_id} className="w-full bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-bold rounded-md py-3 mt-3">{saving ? '保存中...' : '添加量を記録'}</button>
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

function PeriodSwitch({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[7, 30].map(days => (
        <button key={days} type="button" onClick={() => onChange(days)} className={`text-xs px-3 py-2 rounded-md border ${value === days ? 'border-cyan-500 bg-cyan-950 text-cyan-200' : 'border-slate-700 text-slate-400'}`}>
          {days === 7 ? '週間' : '月間'}
        </button>
      ))}
    </div>
  )
}

function TrendCard({ records, parameter, periodDays }) {
  const points = useChartPoints(records, parameter.key, periodDays)
  const values = points.map(point => point.value)

  return (
    <ChartCard title={parameter.label} subtitle={`${parameter.min} - ${parameter.max} ${parameter.unit}`} color={parameter.color} points={points} unit={parameter.unit} minGuide={parameter.min} maxGuide={parameter.max}>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Stat label="平均" value={average(values)} unit={parameter.unit} />
        <Stat label="最小" value={values.length ? Math.min(...values) : null} unit={parameter.unit} />
        <Stat label="最大" value={values.length ? Math.max(...values) : null} unit={parameter.unit} />
      </div>
    </ChartCard>
  )
}

function AdditiveTrendCard({ product, logs, periodDays }) {
  const points = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - periodDays + 1)
    const daily = new Map()
    logs
      .filter(log => log.additive_product_id === product.id && new Date(`${log.dosed_at}T00:00:00`) >= start)
      .forEach(log => {
        daily.set(log.dosed_at, (daily.get(log.dosed_at) || 0) + Number(log.amount))
      })
    return [...daily.entries()].map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date))
  }, [logs, product.id, periodDays])

  return <ChartCard title={`${product.brand} ${product.name}`} subtitle={product.category} color="#34d399" points={points} unit={product.default_unit} />
}

function useChartPoints(records, key, periodDays) {
  return useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - periodDays + 1)
    return records
      .filter(record => new Date(`${record.measured_at}T00:00:00`) >= start && record[key] != null)
      .map(record => ({ date: record.measured_at, value: Number(record[key]) }))
      .reverse()
  }, [records, key, periodDays])
}

function ChartCard({ title, subtitle, color, points, unit, minGuide, maxGuide, children }) {
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
        <div>
          <h4 className="font-bold text-white">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        </div>
        <span className="text-xs text-slate-500">{points.length}点</span>
      </div>
      <div className="aspect-[16/8] min-h-[160px] mt-3">
        {points.length ? (
          <svg viewBox="0 0 100 100" className="w-full h-full" role="img" aria-label={`${title}の推移`}>
            {minGuide != null && maxGuide != null && <rect x="8" y={y(maxGuide)} width="84" height={Math.max(y(minGuide) - y(maxGuide), 1)} fill="#064e3b" opacity="0.3" />}
            {[0, 1, 2, 3, 4].map(index => <line key={index} x1="8" x2="92" y1={12 + index * 19} y2={12 + index * 19} stroke="#334155" strokeWidth="0.3" />)}
            <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((point, index) => <circle key={`${point.date}-${index}`} cx={x(index)} cy={y(point.value)} r="1.8" fill={color} />)}
          </svg>
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-slate-500">記録なし</div>
        )}
      </div>
      {children}
      {points.length > 0 && <p className="text-xs text-slate-500 mt-3">直近: {points[points.length - 1].date} / {formatValue(points[points.length - 1].value, unit)}</p>}
    </div>
  )
}

function average(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null
}

function Stat({ label, value, unit }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-md p-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-sm font-bold text-white mt-1">{value == null ? '-' : formatValue(Number(value.toFixed(3)), unit)}</p>
    </div>
  )
}

function RecentLists({ records, doseLogs, loading }) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <RecentPanel
        title="最近の水質記録"
        emptyText={loading ? '読み込み中...' : 'まだ水質記録がありません。'}
        items={records.slice(0, 8)}
        renderItem={record => (
          <>
            <p className="text-sm font-semibold text-white">{record.measured_at}</p>
            <p className="text-xs text-slate-400 mt-1">水温 {formatValue(record.temperature, '°C')} / KH {formatValue(record.kh, 'dKH')} / NO3 {formatValue(record.nitrate, 'ppm')}</p>
          </>
        )}
      />
      <RecentPanel
        title="最近の添加記録"
        emptyText="まだ添加記録がありません。"
        items={doseLogs.slice(0, 8)}
        renderItem={log => (
          <>
            <p className="text-sm font-semibold text-white">{log.dosed_at}</p>
            <p className="text-xs text-slate-400 mt-1">{productLabel(log.additive_products)} / {formatValue(log.amount, log.unit)}</p>
          </>
        )}
      />
    </div>
  )
}

function RecentPanel({ title, items, emptyText, renderItem }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800">
        <h3 className="font-bold text-white">{title}</h3>
      </div>
      <div className="divide-y divide-slate-800">
        {items.length ? items.map(item => <div key={item.id} className="px-4 py-3">{renderItem(item)}</div>) : <p className="p-8 text-center text-slate-500">{emptyText}</p>}
      </div>
    </div>
  )
}
