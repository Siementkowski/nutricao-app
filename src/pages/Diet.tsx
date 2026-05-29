import { useEffect, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { PageTransition } from '../components/layout/PageTransition'
import { useDiet } from '../hooks/useDiet'
import { useDiary } from '../hooks/useDiary'
import type { DietEntry, FoodLog } from '../types'

const MEAL_ORDER: string[] = ['breakfast', 'lunch', 'snack', 'dinner']
const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
}

function isValidMealType(m: string): m is FoodLog['meal_type'] {
  return ['breakfast', 'lunch', 'dinner', 'snack'].includes(m)
}

interface DietItemProps {
  entry: DietEntry
  onUseToday: (entry: DietEntry) => Promise<void>
}

function DietItem({ entry, onUseToday }: DietItemProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleUse() {
    setState('loading')
    await onUseToday(entry)
    setState('done')
    setTimeout(() => setState('idle'), 3000)
  }

  return (
    <div
      className="flex items-start gap-3 py-3"
      style={{ borderBottom: '1px solid rgba(124,154,126,0.15)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm" style={{ color: '#EAF2E6', fontWeight: 400 }}>
          {entry.food_name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#8AAF8C', fontWeight: 300 }}>
          {entry.quantity_g}g &nbsp;·&nbsp;
          {Math.round(entry.kcal)} kcal &nbsp;·&nbsp;
          P {entry.protein.toFixed(1)}g · C {entry.carbs.toFixed(1)}g · G {entry.fat.toFixed(1)}g
        </p>

        {/* Notes chip */}
        {entry.notes && (
          <span
            className="inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(124,154,126,0.15)', color: '#72C45A', fontWeight: 400 }}
          >
            {entry.notes}
          </span>
        )}

        {/* Substitutions chip */}
        {entry.substitutions_json && (
          <span
            className="inline-block mt-1 ml-1 text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: '#0D1B10', color: '#C0B428', fontWeight: 400 }}
          >
            Sub: {entry.substitutions_json}
          </span>
        )}
      </div>

      <button
        onClick={handleUse}
        disabled={state !== 'idle'}
        className="shrink-0 px-3 py-1.5 rounded-xl text-xs"
        style={{
          backgroundColor: state === 'done' ? '#1C3520' : state === 'loading' ? '#0D1B10' : '#152318',
          color: state === 'done' ? '#72C45A' : '#72C45A',
          border: `1px solid ${state === 'done' ? '#72C45A' : '#72C45A'}`,
          fontWeight: 500,
          transition: 'all 0.15s',
          minWidth: 72,
        }}
      >
        {state === 'done' ? '✓ Adicionado' : state === 'loading' ? '...' : 'Usar hoje'}
      </button>
    </div>
  )
}

export function Diet() {
  const { byMeal, fetchDietEntries, dietEntries } = useDiet()
  const { addFoodLog } = useDiary()

  useEffect(() => { fetchDietEntries() }, [fetchDietEntries])

  async function handleUseToday(entry: DietEntry) {
    const meal = isValidMealType(entry.meal_type) ? entry.meal_type : 'snack'
    const today = new Date().toISOString().split('T')[0]
    await addFoodLog({
      date: today,
      meal_type: meal,
      food_name: entry.food_name,
      quantity_g: entry.quantity_g,
      kcal: entry.kcal,
      protein: entry.protein,
      carbs: entry.carbs,
      fat: entry.fat,
    })
  }

  const totalKcal = dietEntries.reduce((s, e) => s + e.kcal, 0)

  const orderedMeals = [
    ...MEAL_ORDER.filter(k => byMeal[k]),
    ...Object.keys(byMeal).filter(k => !MEAL_ORDER.includes(k)),
  ]

  return (
    <PageTransition>
    <div>
      <PageHeader
        title="Minha Dieta"
        subtitle={
          dietEntries.length > 0
            ? `${dietEntries.length} itens · ${Math.round(totalKcal)} kcal`
            : 'Plano alimentar prescrito'
        }
      />

      <div className="px-5 space-y-3 pb-28">
        {dietEntries.length === 0 ? (
          <div
            className="rounded-2xl p-8 flex flex-col items-center text-center"
            style={{ backgroundColor: '#152318', border: '1px solid #22362A' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ backgroundColor: '#1C3520' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#72C45A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="11" y2="17" />
              </svg>
            </div>
            <p className="text-sm mb-1" style={{ color: '#EAF2E6', fontWeight: 500 }}>
              Nenhuma dieta importada
            </p>
            <p className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>
              Acesse Configurações (⚙) na Home e sincronize sua planilha do Google Sheets.
            </p>
          </div>
        ) : (
          orderedMeals.map(mealKey => {
            const entries = byMeal[mealKey] || []
            const mealKcal = entries.reduce((s, e) => s + e.kcal, 0)
            const label = MEAL_LABELS[mealKey] || mealKey

            return (
              <div
                key={mealKey}
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid #2A4830' }}
              >
                {/* Section header */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{ backgroundColor: '#1C3520' }}
                >
                  <p className="text-sm" style={{ color: '#EAF2E6', fontWeight: 500 }}>
                    {label}
                  </p>
                  <span className="text-xs" style={{ color: '#72C45A', fontWeight: 500 }}>
                    {Math.round(mealKcal)} kcal
                  </span>
                </div>

                {/* Items */}
                <div
                  className="px-5"
                  style={{ backgroundColor: '#1A2C1C' }}
                >
                  {entries.map(entry => (
                    <DietItem
                      key={entry.id}
                      entry={entry}
                      onUseToday={handleUseToday}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
    </PageTransition>
  )
}
