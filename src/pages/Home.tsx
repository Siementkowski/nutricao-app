import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { ProgressRing } from '../components/home/ProgressRing'
import { MacroBar } from '../components/home/MacroBar'
import { EnergyCard } from '../components/home/EnergyCard'
import { PageTransition } from '../components/layout/PageTransition'
import { SettingsModal } from '../components/settings/SettingsModal'
import { loadMealGoals, type MealGoals } from '../lib/mealGoals'
import { loadEnergy } from '../lib/energy'
import { useExercise } from '../hooks/useExercise'
import type { ExerciseCache } from '../types'
import { useDiary } from '../hooks/useDiary'
import { useWater } from '../hooks/useWater'
import { useUserStore } from '../store/userStore'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function formatDate() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

const MEAL_LABELS = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
} as const

type MealKey = keyof typeof MEAL_LABELS

const MEAL_GOAL_KEY: Record<MealKey, keyof MealGoals> = {
  breakfast: 'breakfast_kcal',
  lunch:     'lunch_kcal',
  dinner:    'dinner_kcal',
  snack:     'snack_kcal',
}

export function Home() {
  const { fetchTodayLogs, fetchTodayWater, getDayMacros, getMealMacros } = useDiary()
  const { waterToday, goal: waterGoal, addWater } = useWater()
  const { goals } = useUserStore()
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mealGoals, setMealGoals] = useState<MealGoals | null>(null)

  // Exercise
  const {
    exerciseCache,
    fetchTodayExercise,
    fetchExerciseCache,
    addExerciseLog,
    removeLastLog,
    getTotalBurned,
    getTotalByType,
  } = useExercise()
  const [activeTab, setActiveTab] = useState<'strength' | 'cardio'>('strength')
  const [toast, setToast] = useState<{ msg: string; type: 'strength' | 'cardio' } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Cardio state
  const [selExercise, setSelExercise] = useState<ExerciseCache | null>(null)
  const [selIntensity, setSelIntensity] = useState<string | null>(null)
  const [cardioMin, setCardioMin] = useState(0)

  useEffect(() => {
    fetchTodayLogs()
    fetchTodayWater()
    fetchTodayExercise()
    fetchExerciseCache()
  }, [fetchTodayLogs, fetchTodayWater, fetchTodayExercise, fetchExerciseCache])

  // Load meal goals from localStorage; reload whenever settings modal closes
  useEffect(() => {
    if (!settingsOpen) setMealGoals(loadMealGoals())
  }, [settingsOpen])

  const macros = getDayMacros
  const waterPct = Math.min(100, (waterToday / waterGoal) * 100)

  // Exercise helpers
  const cardioExercises: ExerciseCache[] = Array.from(
    new Map(
      exerciseCache
        .filter(e => e.categoria === 'cardio')
        .map(e => [e.exercicio, e])
    ).values()
  ).sort((a, b) => a.exercicio.localeCompare(b.exercicio, 'pt-BR'))

  const intensities = selExercise
    ? exerciseCache.filter(e => e.exercicio === selExercise.exercicio)
    : []

  function showToast(msg: string, type: 'strength' | 'cardio') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ msg, type })
    toastTimerRef.current = setTimeout(() => setToast(null), 5000)
  }

  async function handleStrengthAdd(minutes: number) {
    const strengthEx = exerciseCache.find(e => e.categoria === 'treino')
    if (!strengthEx) return
    const weight = loadEnergy().weight || 70
    const kcal = Math.round(strengthEx.kcal_por_kg_por_minuto * weight * minutes)
    const today = new Date().toISOString().split('T')[0]
    await addExerciseLog({
      date: today, type: 'strength',
      exercise_name: strengthEx.exercicio,
      intensity: strengthEx.intensidade,
      duration_min: minutes, kcal_burned: kcal,
    })
    showToast(`${minutes} min registrados — ${kcal} kcal`, 'strength')
  }

  async function handleCardioRegister() {
    if (!selExercise || !selIntensity || cardioMin === 0) return
    const ex = exerciseCache.find(
      e => e.exercicio === selExercise.exercicio && e.intensidade === selIntensity
    )
    if (!ex) return
    const weight = loadEnergy().weight || 70
    const kcal = Math.round(ex.kcal_por_kg_por_minuto * weight * cardioMin)
    const today = new Date().toISOString().split('T')[0]
    await addExerciseLog({
      date: today, type: 'cardio',
      exercise_name: selExercise.exercicio,
      intensity: selIntensity,
      duration_min: cardioMin, kcal_burned: kcal,
    })
    showToast(`${selExercise.exercicio} · ${selIntensity} — ${cardioMin} min — ${kcal} kcal`, 'cardio')
    setSelExercise(null); setSelIntensity(null); setCardioMin(0)
  }

  async function handleUndo() {
    if (!toast) return
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    await removeLastLog(toast.type)
    setToast(null)
  }

  return (
    <>
    <PageTransition>
    <div>
      <PageHeader
        title={greeting()}
        subtitle={formatDate()}
        action={
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#EBF3D8', color: '#536B2F' }}
            aria-label="Configurações"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        }
      />

      <div className="px-5 space-y-4 pb-28">

        {/* Progress Ring */}
        <div
          className="rounded-2xl py-6 flex justify-center"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D4E0B8' }}
        >
          <ProgressRing consumed={macros.kcal} goal={goals.kcal_goal} />
        </div>

        {/* Macro Bars */}
        <div
          className="rounded-2xl px-5 py-5 space-y-4"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D4E0B8' }}
        >
          <p className="text-xs uppercase tracking-wider" style={{ color: '#7A9460', fontWeight: 300 }}>
            Macronutrientes
          </p>
          <MacroBar label="Proteína" value={macros.protein} goal={goals.protein_goal} color="#B29F76" />
          <MacroBar label="Carboidrato" value={macros.carbs} goal={goals.carbs_goal} color="#748A20" />
          <MacroBar label="Gordura" value={macros.fat} goal={goals.fat_goal} color="#536B2F" />
        </div>

        {/* Energy deficit/surplus card */}
        <EnergyCard consumed={macros.kcal} workoutKcal={getTotalBurned()} />

        {/* Água */}
        <div
          className="rounded-2xl px-5 py-5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #D4E0B8' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3D8BAE" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6 9 4 13 4 16a8 8 0 0 0 16 0c0-3-2-7-8-14z" />
              </svg>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#7A9460', fontWeight: 300 }}>
                Hidratação
              </p>
            </div>
            <span className="text-xs" style={{ color: '#3D8BAE', fontWeight: 500 }}>
              {waterToday} / {waterGoal} ml
            </span>
          </div>

          <div className="h-2.5 rounded-full overflow-hidden mb-4" style={{ backgroundColor: '#FDFDFB' }}>
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${waterPct}%`,
                backgroundColor: '#3D8BAE',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div className="flex gap-2">
            {[200, 300, 500].map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                className="flex-1 py-2.5 rounded-xl text-xs"
                style={{
                  backgroundColor: '#E4F3FA',
                  color: '#3D8BAE',
                  fontWeight: 500,
                  border: '1px solid #B0D4E8',
                }}
              >
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* ── Treino ── */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] mb-3 px-1" style={{ color: '#7A9460', fontWeight: 500 }}>
            Treino
          </p>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#FFFFFF', border: '1px solid #D4E0B8' }}>

            {/* Tab bar */}
            <div className="flex" style={{ borderBottom: '1px solid #D4E0B8' }}>
              {(['strength', 'cardio'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex-1 py-3 text-sm"
                  style={{
                    color: activeTab === tab ? '#536B2F' : '#7A9460',
                    fontWeight: activeTab === tab ? 500 : 400,
                    borderBottom: `2px solid ${activeTab === tab ? '#536B2F' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {tab === 'strength' ? '🏋️ Musculação' : '🏃 Cardio'}
                </button>
              ))}
            </div>

            {/* ── Musculação panel ── */}
            {activeTab === 'strength' && (
              <div className="px-4 pt-4 pb-3 space-y-3">
                {/* Today total */}
                {(() => { const s = getTotalByType('strength'); return s.kcal > 0 ? (
                  <p className="text-xs" style={{ color: '#536B2F', fontWeight: 500 }}>
                    {s.kcal} kcal · {s.minutes} min hoje
                  </p>
                ) : null })()}

                <div>
                  <p className="text-xs mb-2" style={{ color: '#7A9460', fontWeight: 300 }}>
                    Registrar tempo
                  </p>
                  <div className="flex gap-2">
                    {[1, 5, 10, 30, 60].map(min => (
                      <button
                        key={min}
                        onClick={() => handleStrengthAdd(min)}
                        className="flex-1 py-2.5 rounded-xl text-xs"
                        style={{
                          backgroundColor: '#EBF3D8',
                          color: '#536B2F',
                          fontWeight: 500,
                          border: '1px solid #C4D9A0',
                        }}
                      >
                        +{min}m
                      </button>
                    ))}
                  </div>
                </div>

                {exerciseCache.find(e => e.categoria === 'treino') == null && (
                  <p className="text-xs text-center py-1" style={{ color: '#7A9460', fontWeight: 300 }}>
                    Sincronize a planilha para ativar o cálculo de calorias
                  </p>
                )}
              </div>
            )}

            {/* ── Cardio panel ── */}
            {activeTab === 'cardio' && (
              <div className="px-4 pt-4 pb-3 space-y-3">
                {/* Today total */}
                {(() => { const c = getTotalByType('cardio'); return c.kcal > 0 ? (
                  <p className="text-xs" style={{ color: '#536B2F', fontWeight: 500 }}>
                    {c.kcal} kcal · {c.minutes} min hoje
                  </p>
                ) : null })()}

                {!selExercise ? (
                  /* Step 1 — choose exercise */
                  <div>
                    <p className="text-xs mb-2" style={{ color: '#7A9460', fontWeight: 300 }}>Exercício</p>
                    {cardioExercises.length === 0 ? (
                      <p className="text-xs" style={{ color: '#7A9460', fontWeight: 300 }}>
                        Sincronize a planilha para ver os exercícios
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {cardioExercises.map(ex => (
                          <button
                            key={ex.exercicio}
                            onClick={() => { setSelExercise(ex); setSelIntensity(null); setCardioMin(0) }}
                            className="px-3 py-1.5 rounded-full text-xs"
                            style={{
                              backgroundColor: '#EBF3D8',
                              color: '#536B2F',
                              border: '1px solid #C4D9A0',
                              fontWeight: 400,
                            }}
                          >
                            {ex.exercicio}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Selected exercise + change */}
                    <div className="flex items-center justify-between">
                      <p className="text-sm" style={{ color: '#2E5518', fontWeight: 500 }}>
                        {selExercise.exercicio}
                      </p>
                      <button
                        onClick={() => { setSelExercise(null); setSelIntensity(null); setCardioMin(0) }}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ color: '#7A9460', backgroundColor: '#FDFDFB' }}
                      >
                        Trocar
                      </button>
                    </div>

                    {/* Step 2 — intensity */}
                    <div>
                      <p className="text-xs mb-2" style={{ color: '#7A9460', fontWeight: 300 }}>Intensidade</p>
                      <div className="flex gap-2 flex-wrap">
                        {intensities.map(ex => (
                          <button
                            key={ex.intensidade}
                            onClick={() => { setSelIntensity(ex.intensidade); setCardioMin(0) }}
                            className="flex-1 py-2 rounded-xl text-xs"
                            style={{
                              backgroundColor: selIntensity === ex.intensidade ? '#536B2F' : '#EBF3D8',
                              color: selIntensity === ex.intensidade ? '#FFFFFF' : '#536B2F',
                              border: `1px solid ${selIntensity === ex.intensidade ? '#536B2F' : '#C4D9A0'}`,
                              fontWeight: selIntensity === ex.intensidade ? 500 : 400,
                              transition: 'all 0.15s',
                            }}
                          >
                            {ex.intensidade}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Step 3 — time (only after intensity) */}
                    {selIntensity && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs" style={{ color: '#7A9460', fontWeight: 300 }}>Tempo</p>
                          {cardioMin > 0 && (
                            <p className="text-sm" style={{ color: '#536B2F', fontWeight: 600 }}>
                              {cardioMin} min
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {[1, 5, 10, 30, 60].map(min => (
                            <button
                              key={min}
                              onClick={() => setCardioMin(prev => prev + min)}
                              className="flex-1 py-2.5 rounded-xl text-xs"
                              style={{
                                backgroundColor: '#E4F3FA',
                                color: '#3D8BAE',
                                border: '1px solid #B0D4E8',
                                fontWeight: 500,
                              }}
                            >
                              +{min}m
                            </button>
                          ))}
                        </div>
                        {cardioMin > 0 && (
                          <button
                            onClick={handleCardioRegister}
                            className="w-full py-3 rounded-xl text-sm"
                            style={{ backgroundColor: '#536B2F', color: '#FFFFFF', fontWeight: 500 }}
                          >
                            Registrar
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Toast / undo */}
            {toast && (
              <div className="px-4 pb-4">
                <div
                  className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: '#EBF3D8' }}
                >
                  <span className="text-xs flex-1 mr-2" style={{ color: '#536B2F', fontWeight: 400 }}>
                    {toast.msg}
                  </span>
                  <button
                    onClick={handleUndo}
                    className="text-xs shrink-0"
                    style={{ color: '#7A9460', fontWeight: 400 }}
                  >
                    ↩ Desfazer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Meal summary cards */}
        <div>
          <p className="text-xs uppercase tracking-[0.18em] mb-3 px-1" style={{ color: '#7A9460', fontWeight: 500 }}>
            Refeições
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(MEAL_LABELS) as MealKey[]).map((mealKey) => {
              const m = getMealMacros(mealKey)
              const goalKcal = mealGoals ? mealGoals[MEAL_GOAL_KEY[mealKey]] : 0
              const pct = goalKcal > 0 ? Math.min((m.kcal / goalKcal) * 100, 100) : 0
              const over = goalKcal > 0 && m.kcal > goalKcal
              return (
                <button
                  key={mealKey}
                  onClick={() => navigate('/refeicoes')}
                  className="rounded-2xl p-4 text-left"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #D4E0B8' }}
                >
                  <p className="text-xs mb-1" style={{ color: '#7A9460', fontWeight: 300 }}>
                    {MEAL_LABELS[mealKey]}
                  </p>
                  <p className="font-display" style={{ color: over ? '#C0471A' : '#2E5518', fontWeight: 600, lineHeight: 1.1, fontSize: '1.5rem', letterSpacing: '-0.01em' }}>
                    {Math.round(m.kcal)}
                    <span className="text-xs font-sans" style={{ color: '#7A9460', fontWeight: 400 }}> kcal</span>
                  </p>
                  {goalKcal > 0 && (
                    <p className="text-xs mb-2" style={{ color: '#7A9460', fontWeight: 300 }}>
                      meta: {goalKcal} kcal
                    </p>
                  )}
                  {goalKcal === 0 && <div className="mb-2" />}
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#FDFDFB' }}>
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: over ? '#C0471A' : '#536B2F',
                        transition: 'width 0.4s',
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
    </PageTransition>

    <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
