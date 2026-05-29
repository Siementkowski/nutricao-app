import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { ProgressRing } from '../components/home/ProgressRing'
import { MacroBar } from '../components/home/MacroBar'
import { EnergyCard } from '../components/home/EnergyCard'
import { PageTransition } from '../components/layout/PageTransition'
import { SettingsModal } from '../components/settings/SettingsModal'
import { loadMealGoals, type MealGoals } from '../lib/mealGoals'
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

  useEffect(() => {
    fetchTodayLogs()
    fetchTodayWater()
  }, [fetchTodayLogs, fetchTodayWater])

  // Load meal goals from localStorage; reload whenever settings modal closes
  useEffect(() => {
    if (!settingsOpen) setMealGoals(loadMealGoals())
  }, [settingsOpen])

  const macros = getDayMacros
  const waterPct = Math.min(100, (waterToday / waterGoal) * 100)

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
            style={{ backgroundColor: '#EEF3EE', color: '#7C9A7E' }}
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
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
        >
          <ProgressRing consumed={macros.kcal} goal={goals.kcal_goal} />
        </div>

        {/* Macro Bars */}
        <div
          className="rounded-2xl px-5 py-5 space-y-4"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
        >
          <p className="text-xs uppercase tracking-wider" style={{ color: '#8C8880', fontWeight: 300 }}>
            Macronutrientes
          </p>
          <MacroBar label="Proteína" value={macros.protein} goal={goals.protein_goal} color="#C4956A" />
          <MacroBar label="Carboidrato" value={macros.carbs} goal={goals.carbs_goal} color="#8B8B5A" />
          <MacroBar label="Gordura" value={macros.fat} goal={goals.fat_goal} color="#7C9A7E" />
        </div>

        {/* Energy deficit/surplus card */}
        <EnergyCard consumed={macros.kcal} />

        {/* Água */}
        <div
          className="rounded-2xl px-5 py-5"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7BA7BC" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C6 9 4 13 4 16a8 8 0 0 0 16 0c0-3-2-7-8-14z" />
              </svg>
              <p className="text-xs uppercase tracking-wider" style={{ color: '#8C8880', fontWeight: 300 }}>
                Hidratação
              </p>
            </div>
            <span className="text-xs" style={{ color: '#7BA7BC', fontWeight: 500 }}>
              {waterToday} / {waterGoal} ml
            </span>
          </div>

          <div className="h-2.5 rounded-full overflow-hidden mb-4" style={{ backgroundColor: '#F7F5F0' }}>
            <div
              className="h-2.5 rounded-full"
              style={{
                width: `${waterPct}%`,
                backgroundColor: '#7BA7BC',
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
                  backgroundColor: '#F0F6FA',
                  color: '#7BA7BC',
                  fontWeight: 500,
                  border: '1px solid #D8EAF2',
                }}
              >
                +{ml}ml
              </button>
            ))}
          </div>
        </div>

        {/* Meal summary cards */}
        <div>
          <p className="text-xs uppercase tracking-wider mb-3 px-1" style={{ color: '#8C8880', fontWeight: 300 }}>
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
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
                >
                  <p className="text-xs mb-1" style={{ color: '#8C8880', fontWeight: 300 }}>
                    {MEAL_LABELS[mealKey]}
                  </p>
                  <p className="text-base" style={{ color: over ? '#C47A5A' : '#2C2C2C', fontWeight: 600, lineHeight: 1.2 }}>
                    {Math.round(m.kcal)}
                    <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}> kcal</span>
                  </p>
                  {goalKcal > 0 && (
                    <p className="text-xs mb-2" style={{ color: '#8C8880', fontWeight: 300 }}>
                      meta: {goalKcal} kcal
                    </p>
                  )}
                  {goalKcal === 0 && <div className="mb-2" />}
                  <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#F7F5F0' }}>
                    <div
                      className="h-1 rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: over ? '#C47A5A' : '#7C9A7E',
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
