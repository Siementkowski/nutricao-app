import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { syncFromSheets } from '../../lib/sheets'
import { useUserStore } from '../../store/userStore'
import { useFoodStore } from '../../store/foodStore'
import { loadEnergy, saveEnergy, calcTMB, calcTDEE, ACTIVITY_OPTIONS } from '../../lib/energy'
import type { EnergySettings } from '../../lib/energy'
import type { UserGoals } from '../../types'

const LS_KEY = 'nutricao_sheet_id'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

type SyncState = 'idle' | 'loading' | 'success' | 'error'

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { goals, setGoals } = useUserStore()
  const { setDietEntries, setFoods } = useFoodStore()

  const [sheetId, setSheetId] = useState('')
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [syncMsg, setSyncMsg] = useState('')
  const [localGoals, setLocalGoals] = useState<UserGoals>(goals)
  const [savingGoals, setSavingGoals] = useState(false)
  const [goalsSaved, setGoalsSaved] = useState(false)

  const defaultEnergy: EnergySettings = { weight: 0, height: 0, age: 0, sex: 'male', activity: 1.2, workout: 0 }
  const [energy, setEnergy] = useState<EnergySettings>(defaultEnergy)
  const [energySaved, setEnergySaved] = useState(false)

  const tmb = energy.weight > 0 && energy.height > 0 && energy.age > 0 ? calcTMB(energy) : 0
  const tdee = tmb > 0 ? calcTDEE(energy) : 0

  useEffect(() => {
    if (open) {
      setSheetId(localStorage.getItem(LS_KEY) || '')
      setLocalGoals(goals)
      setSyncState('idle')
      setSyncMsg('')
      setGoalsSaved(false)
      setEnergy(loadEnergy())
      setEnergySaved(false)
    }
  }, [open, goals])

  async function handleSync() {
    const id = sheetId.trim()
    if (!id) { setSyncState('error'); setSyncMsg('Cole o ID da planilha primeiro.'); return }
    setSyncState('loading')
    setSyncMsg('')
    try {
      const result = await syncFromSheets(id)
      localStorage.setItem(LS_KEY, id)
      // Refresh stores from Supabase
      const [foodsRes, dietRes] = await Promise.all([
        supabase.from('food_cache').select('*').order('name'),
        supabase.from('diet_cache').select('*').order('meal_type'),
      ])
      if (foodsRes.data) setFoods(foodsRes.data as any)
      if (dietRes.data) setDietEntries(dietRes.data as any)
      setSyncState('success')
      setSyncMsg(`${result.foods} alimentos · ${result.diet} itens de dieta importados`)
    } catch (e: any) {
      setSyncState('error')
      setSyncMsg(e.message || 'Erro desconhecido')
    }
  }

  async function handleSaveGoals() {
    setSavingGoals(true)
    const { error } = await supabase
      .from('user_goals')
      .update({
        kcal_goal: localGoals.kcal_goal,
        protein_goal: localGoals.protein_goal,
        carbs_goal: localGoals.carbs_goal,
        fat_goal: localGoals.fat_goal,
        water_goal_ml: localGoals.water_goal_ml,
        updated_at: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000')
    if (!error) {
      setGoals(localGoals)
      setGoalsSaved(true)
      setTimeout(() => setGoalsSaved(false), 2000)
    }
    setSavingGoals(false)
  }

  function setGoal(key: keyof UserGoals, value: string) {
    const n = parseInt(value) || 0
    setLocalGoals(prev => ({ ...prev, [key]: n }))
  }

  function handleSaveEnergy() {
    saveEnergy(energy)
    setEnergySaved(true)
    setTimeout(() => setEnergySaved(false), 2000)
  }

  function setEnergyField(key: keyof EnergySettings, value: string | number) {
    setEnergy(prev => ({ ...prev, [key]: value }))
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(44,44,44,0.35)' }}
        onClick={onClose}
      />

      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-y-auto"
        style={{
          backgroundColor: '#FFFFFF',
          maxHeight: '92dvh',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#E8E4DC' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sticky top-5 bg-white z-10" style={{ borderBottom: '1px solid #E8E4DC' }}>
          <h2 className="text-base" style={{ color: '#2C2C2C', fontWeight: 500 }}>
            Configurações
          </h2>
          <button onClick={onClose} style={{ color: '#8C8880' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-6 pb-12">

          {/* ── Gasto Energético ── */}
          <section>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8C8880', fontWeight: 300 }}>
              Gasto energético
            </p>
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
            >
              {/* Peso / Altura / Idade */}
              <div className="grid grid-cols-3 gap-2">
                {([
                  { key: 'weight', label: 'Peso', unit: 'kg' },
                  { key: 'height', label: 'Altura', unit: 'cm' },
                  { key: 'age',    label: 'Idade',  unit: 'anos' },
                ] as { key: keyof EnergySettings; label: string; unit: string }[]).map(({ key, label, unit }) => (
                  <div key={key}>
                    <label className="text-xs block mb-1" style={{ color: '#8C8880', fontWeight: 300 }}>{label}</label>
                    <div className="rounded-xl px-2 py-2 flex items-center gap-1" style={{ backgroundColor: '#F7F5F0', border: '1px solid #E8E4DC' }}>
                      <input
                        type="number"
                        min="0"
                        value={(energy[key] as number) || ''}
                        onChange={e => setEnergyField(key, parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent text-sm text-right outline-none"
                        style={{ color: '#2C2C2C', fontWeight: 500 }}
                      />
                      <span className="text-xs shrink-0" style={{ color: '#8C8880', fontWeight: 300 }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sexo */}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: '#8C8880', fontWeight: 300 }}>Sexo</label>
                <div className="flex gap-2">
                  {(['male', 'female'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setEnergyField('sex', s)}
                      className="flex-1 py-2 rounded-xl text-sm"
                      style={{
                        backgroundColor: energy.sex === s ? '#7C9A7E' : '#F7F5F0',
                        color: energy.sex === s ? '#FFFFFF' : '#2C2C2C',
                        border: `1px solid ${energy.sex === s ? '#7C9A7E' : '#E8E4DC'}`,
                        fontWeight: 500,
                        transition: 'all 0.15s',
                      }}
                    >
                      {s === 'male' ? 'Homem' : 'Mulher'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nível de atividade */}
              <div>
                <label className="text-xs block mb-1.5" style={{ color: '#8C8880', fontWeight: 300 }}>Nível de atividade</label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setEnergyField('activity', opt.value)}
                      className="py-2 px-3 rounded-xl text-xs text-left"
                      style={{
                        backgroundColor: energy.activity === opt.value ? '#7C9A7E' : '#F7F5F0',
                        color: energy.activity === opt.value ? '#FFFFFF' : '#2C2C2C',
                        border: `1px solid ${energy.activity === opt.value ? '#7C9A7E' : '#E8E4DC'}`,
                        fontWeight: energy.activity === opt.value ? 500 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gasto de treino */}
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm shrink-0" style={{ color: '#2C2C2C', fontWeight: 400 }}>Gasto de treino</label>
                <div className="flex items-center gap-1.5 rounded-xl px-3 py-2" style={{ backgroundColor: '#F7F5F0', border: '1px solid #E8E4DC' }}>
                  <input
                    type="number"
                    min="0"
                    value={energy.workout || ''}
                    onChange={e => setEnergyField('workout', parseInt(e.target.value) || 0)}
                    className="w-20 bg-transparent text-sm text-right outline-none"
                    style={{ color: '#2C2C2C', fontWeight: 500 }}
                  />
                  <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>kcal</span>
                </div>
              </div>

              {/* TMB / TDEE preview */}
              {tmb > 0 && (
                <div className="rounded-xl px-4 py-3 flex justify-between" style={{ backgroundColor: '#EEF3EE' }}>
                  <div className="text-center">
                    <p className="text-xs mb-0.5" style={{ color: '#5A8A5C', fontWeight: 300 }}>TMB</p>
                    <p className="text-sm" style={{ color: '#2C2C2C', fontWeight: 600 }}>{tmb} kcal</p>
                  </div>
                  <div className="w-px" style={{ backgroundColor: '#D4E4D5' }} />
                  <div className="text-center">
                    <p className="text-xs mb-0.5" style={{ color: '#5A8A5C', fontWeight: 300 }}>TDEE</p>
                    <p className="text-sm" style={{ color: '#2C2C2C', fontWeight: 600 }}>{tdee} kcal</p>
                  </div>
                  <div className="w-px" style={{ backgroundColor: '#D4E4D5' }} />
                  <div className="text-center">
                    <p className="text-xs mb-0.5" style={{ color: '#5A8A5C', fontWeight: 300 }}>Total</p>
                    <p className="text-sm" style={{ color: '#2C2C2C', fontWeight: 600 }}>{tdee + energy.workout} kcal</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveEnergy}
                className="w-full py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: energySaved ? '#EEF3EE' : '#F7F5F0',
                  color: energySaved ? '#5A8A5C' : '#2C2C2C',
                  fontWeight: 500,
                  border: '1px solid #E8E4DC',
                  transition: 'all 0.15s',
                }}
              >
                {energySaved ? '✓ Salvo' : 'Salvar gasto energético'}
              </button>
            </div>
          </section>

          {/* ── Sincronização ── */}
          <section>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8C8880', fontWeight: 300 }}>
              Google Sheets
            </p>
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
            >
              <label className="text-xs block mb-1.5" style={{ color: '#8C8880', fontWeight: 300 }}>
                ID da planilha
              </label>
              <input
                type="text"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                value={sheetId}
                onChange={e => setSheetId(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none mb-3"
                style={{
                  backgroundColor: '#F7F5F0',
                  border: '1px solid #E8E4DC',
                  color: '#2C2C2C',
                  fontFamily: 'monospace',
                }}
              />
              <p className="text-xs mb-4" style={{ color: '#8C8880', fontWeight: 300 }}>
                Planilha precisa ter abas "Alimentos" e "Dieta" com acesso público de leitura.
              </p>

              <button
                onClick={handleSync}
                disabled={syncState === 'loading'}
                className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                style={{
                  backgroundColor: syncState === 'loading' ? '#E8E4DC' : '#7C9A7E',
                  color: syncState === 'loading' ? '#8C8880' : '#FFFFFF',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                {syncState === 'loading' ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                    </svg>
                    Sincronizar agora
                  </>
                )}
              </button>

              {syncMsg && (
                <div
                  className="mt-3 px-3 py-2.5 rounded-xl text-xs"
                  style={{
                    backgroundColor: syncState === 'success' ? '#EEF3EE' : '#FDF0EC',
                    color: syncState === 'success' ? '#5A8A5C' : '#C47A5A',
                    fontWeight: 400,
                  }}
                >
                  {syncState === 'success' ? '✓ ' : '✗ '}{syncMsg}
                </div>
              )}
            </div>
          </section>

          {/* ── Metas ── */}
          <section>
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8C8880', fontWeight: 300 }}>
              Metas diárias
            </p>
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
            >
              {[
                { key: 'kcal_goal' as keyof UserGoals, label: 'Calorias', unit: 'kcal' },
                { key: 'protein_goal' as keyof UserGoals, label: 'Proteína', unit: 'g' },
                { key: 'carbs_goal' as keyof UserGoals, label: 'Carboidrato', unit: 'g' },
                { key: 'fat_goal' as keyof UserGoals, label: 'Gordura', unit: 'g' },
                { key: 'water_goal_ml' as keyof UserGoals, label: 'Água', unit: 'ml' },
              ].map(({ key, label, unit }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <label className="text-sm shrink-0 w-28" style={{ color: '#2C2C2C', fontWeight: 400 }}>
                    {label}
                  </label>
                  <div
                    className="flex items-center gap-1.5 rounded-xl px-3 py-2"
                    style={{ backgroundColor: '#F7F5F0', border: '1px solid #E8E4DC' }}
                  >
                    <input
                      type="number"
                      min="0"
                      value={localGoals[key]}
                      onChange={e => setGoal(key, e.target.value)}
                      className="w-20 bg-transparent text-sm text-right outline-none"
                      style={{ color: '#2C2C2C', fontWeight: 500 }}
                    />
                    <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>
                      {unit}
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleSaveGoals}
                disabled={savingGoals}
                className="w-full py-3 rounded-xl text-sm mt-2"
                style={{
                  backgroundColor: goalsSaved ? '#EEF3EE' : '#F7F5F0',
                  color: goalsSaved ? '#5A8A5C' : '#2C2C2C',
                  fontWeight: 500,
                  border: '1px solid #E8E4DC',
                  transition: 'all 0.15s',
                }}
              >
                {goalsSaved ? '✓ Metas salvas' : savingGoals ? 'Salvando...' : 'Salvar metas'}
              </button>
            </div>
          </section>

        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
