'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

const PARAMETERS = [
  { key: 'temperature', label: '水温', unit: '°C', min: 24, max: 26.5, step: '0.1' },
  { key: 'salinity', label: '比重', unit: '', min: 1.024, max: 1.026, step: '0.001' },
  { key: 'ph', label: 'pH', unit: '', min: 8.0, max: 8.4, step: '0.1' },
  { key: 'kh', label: 'KH', unit: 'dKH', min: 7.0, max: 9.0, step: '0.1' },
  { key: 'calcium', label: 'Ca', unit: 'ppm', min: 400, max: 450, step: '1' },
  { key: 'magnesium', label: 'Mg', unit: 'ppm', min: 1250, max: 1400, step: '1' },
  { key: 'nitrate', label: 'NO3', unit: 'ppm', min: 0.2, max: 10, step: '0.1' },
  { key: 'phosphate', label: 'PO4', unit: 'ppm', min: 0.02, max: 0.08, step: '0.01' },
]

const initialForm = {
  measured_at: new Date().toISOString().slice(0, 10),
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

function parseNumber(value) {
  if (value === '' || value == null) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getStatus(parameter, value) {
  if (value == null) return { label: '未入力', className: 'bg-slate-800 text-slate-300 border-slate-700' }
  if (value < parameter.min) return { label: '低い', className: 'bg-amber-950 text-amber-200 border-amber-700' }
  if (value > parameter.max) return { label: '高い', className: 'bg-rose-950 text-rose-200 border-rose-700' }
  return { label: '適正', className: 'bg-emerald-950 text-emerald-200 border-emerald-700' }
}

function formatValue(value, unit) {
  if (value == null) return '-'
  return `${value}${unit ? ` ${unit}` : ''}`
}

export default function WaterQualityDashboard() {
  const [aquariums, setAquariums] = useState([])
  const [selectedAquariumId, setSelectedAquariumId] = useState('')
  const [records, setRecords] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    bootstrap()
  }, [])

  useEffect(() => {
    if (selectedAquariumId) fetchWaterLogs(selectedAquariumId)
  }, [selectedAquariumId])

  async function bootstrap() {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('aquariums')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      if (data?.length) {
        setAquariums(data)
        setSelectedAquariumId(data[0].id)
        return
      }

      const { data: created, error: createError } = await supabase
        .from('aquariums')
        .insert({ name: 'Main Reef Tank', notes: 'Default aquarium created from the app.' })
        .select('*')
        .single()

      if (createError) throw createError
      setAquariums([created])
      setSelectedAquariumId(created.id)
    } catch (err) {
      setError('Supabaseの水質管理テーブルに接続できません。aquarium-water-quality.sqlをSQL editorで実行してください。')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWaterLogs(aquariumId) {
    try {
      const { data, error } = await supabase
        .from('water_quality_logs')
        .select('*')
        .eq('aquarium_id', aquariumId)
        .order('measured_at', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(60)

      if (error) throw error
      setRecords(data ?? [])
    } catch (err) {
      setError('水質ログの読み込みに失敗しました。')
      console.error(err)
    }
  }

  const selectedAquarium = aquariums.find(aquarium => aquarium.id === selectedAquariumId)
  const latest = records[0]

  const latestScores = useMemo(() => {
    if (!latest) return []
    return PARAMETERS.map(parameter => ({
      ...parameter,
      value: latest[parameter.key],
      status: getStatus(parameter, latest[parameter.key]),
    }))
  }, [latest])

  const alerts = latestScores.filter(item => item.status.label !== '適正' && item.status.label !== '未入力')

  function updateField(key, value) {
    setForm(current => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedAquariumId) return

    setSaving(true)
    setError(null)

    const payload = {
      aquarium_id: selectedAquariumId,
      measured_at: form.measured_at,
      notes: form.notes.trim() || null,
    }

    PARAMETERS.forEach(parameter => {
      payload[parameter.key] = parseNumber(form[parameter.key])
    })

    try {
      const { data, error } = await supabase
        .from('water_quality_logs')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error
      setRecords(current => [data, ...current].slice(0, 60))
      setForm(current => ({ ...initialForm, measured_at: current.measured_at, notes: '' }))
    } catch (err) {
      setError('水質ログの保存に失敗しました。RLSポリシーとSupabase設定を確認してください。')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function deleteRecord(id) {
    try {
      const { error } = await supabase
        .from('water_quality_logs')
        .delete()
        .eq('id', id)

      if (error) throw error
      setRecords(current => current.filter(record => record.id !== id))
    } catch (err) {
      setError('水質ログの削除に失敗しました。')
      console.error(err)
    }
  }

  return (
    <section className="space-y-6">
      {error && (
        <div className="border border-rose-800 bg-rose-950/50 rounded-lg p-4 text-rose-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">水質ログ</h2>
              <p className="text-sm text-slate-400 mt-1">測定値をSupabaseに保存し、推奨範囲と照合します。</p>
            </div>
            <span className="text-xs text-cyan-200 border border-cyan-800 bg-cyan-950 px-2.5 py-1 rounded-full">
              Supabase
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs text-slate-400">水槽</span>
                <select
                  value={selectedAquariumId}
                  onChange={event => setSelectedAquariumId(event.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  disabled={loading || aquariums.length === 0}
                >
                  {aquariums.map(aquarium => (
                    <option key={aquarium.id} value={aquarium.id}>{aquarium.name}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs text-slate-400">測定日</span>
                <input
                  type="date"
                  value={form.measured_at}
                  onChange={event => updateField('measured_at', event.target.value)}
                  className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PARAMETERS.map(parameter => (
                <label key={parameter.key} className="block">
                  <span className="text-xs text-slate-400">{parameter.label}</span>
                  <input
                    type="number"
                    step={parameter.step}
                    value={form[parameter.key]}
                    onChange={event => updateField(parameter.key, event.target.value)}
                    className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[11px] text-slate-500">
                    {parameter.min} - {parameter.max} {parameter.unit}
                  </span>
                </label>
              ))}
            </div>

            <label className="block">
              <span className="text-xs text-slate-400">メモ</span>
              <textarea
                value={form.notes}
                onChange={event => updateField('notes', event.target.value)}
                rows={3}
                placeholder="換水、添加剤、サンゴの開き具合など"
                className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 resize-none"
              />
            </label>

            <button
              type="submit"
              disabled={saving || loading || !selectedAquariumId}
              className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-bold px-5 py-2.5 rounded-md transition-colors"
            >
              {saving ? '保存中...' : '記録する'}
            </button>
          </form>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h2 className="text-xl font-bold text-white">最新ステータス</h2>
          {loading ? (
            <p className="text-sm text-slate-400 mt-4">読み込み中...</p>
          ) : !latest ? (
            <p className="text-sm text-slate-400 mt-4">
              {selectedAquarium?.name ?? '水槽'} の記録はまだありません。
            </p>
          ) : (
            <>
              <p className="text-sm text-slate-400 mt-1">{latest.measured_at} の測定</p>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {latestScores.map(item => (
                  <div key={item.key} className="bg-slate-950 border border-slate-800 rounded-md p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm text-slate-300">{item.label}</span>
                      <span className={`text-[11px] border px-2 py-0.5 rounded-full ${item.status.className}`}>
                        {item.status.label}
                      </span>
                    </div>
                    <div className="text-lg font-bold text-white mt-1">{formatValue(item.value, item.unit)}</div>
                  </div>
                ))}
              </div>
              {alerts.length > 0 && (
                <div className="mt-4 border border-amber-800 bg-amber-950/50 rounded-md p-3">
                  <p className="text-sm text-amber-100 font-semibold">調整候補</p>
                  <p className="text-sm text-amber-200 mt-1">
                    {alerts.map(alert => `${alert.label}が${alert.status.label}`).join('、')}です。
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">測定履歴</h2>
          <span className="text-xs text-slate-500">{records.length} 件</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-950 text-slate-400">
              <tr>
                <th className="text-left font-medium px-4 py-3">日付</th>
                {PARAMETERS.map(parameter => (
                  <th key={parameter.key} className="text-left font-medium px-3 py-3">{parameter.label}</th>
                ))}
                <th className="text-left font-medium px-3 py-3">メモ</th>
                <th className="px-3 py-3" aria-label="操作" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={PARAMETERS.length + 3} className="px-4 py-8 text-center text-slate-500">
                    最初の測定値を記録してください。
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="text-slate-300">
                    <td className="px-4 py-3 font-medium text-white">{record.measured_at}</td>
                    {PARAMETERS.map(parameter => (
                      <td key={parameter.key} className="px-3 py-3">
                        {formatValue(record[parameter.key], parameter.unit)}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-slate-400 max-w-[220px] truncate">{record.notes || '-'}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteRecord(record.id)}
                        className="text-xs text-slate-500 hover:text-rose-300 transition-colors"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
