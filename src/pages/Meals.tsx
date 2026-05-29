import { useEffect, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { MealSection } from '../components/meals/MealSection'
import { AddFoodModal } from '../components/meals/AddFoodModal'
import { PageTransition } from '../components/layout/PageTransition'
import { useDiary } from '../hooks/useDiary'
import type { FoodLog } from '../types'

type MealType = FoodLog['meal_type']

const MEAL_CONFIG: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Café da manhã' },
  { key: 'lunch', label: 'Almoço' },
  { key: 'snack', label: 'Lanche' },
  { key: 'dinner', label: 'Jantar' },
]

export function Meals() {
  const { fetchTodayLogs, removeFoodLog, getMealMacros } = useDiary()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeMeal, setActiveMeal] = useState<MealType>('breakfast')

  useEffect(() => { fetchTodayLogs() }, [fetchTodayLogs])

  function openModal(meal: MealType) {
    setActiveMeal(meal)
    setModalOpen(true)
  }

  return (
    <>
      <PageTransition>
      <div>
        <PageHeader title="Refeições" subtitle="Registro do dia" />

        <div className="px-5 space-y-3 pb-28">
          {MEAL_CONFIG.map(({ key, label }) => {
            const m = getMealMacros(key)
            return (
              <MealSection
                key={key}
                label={label}
                mealType={key}
                logs={m.logs}
                kcal={m.kcal}
                protein={m.protein}
                carbs={m.carbs}
                fat={m.fat}
                onDelete={removeFoodLog}
                onAdd={() => openModal(key)}
              />
            )
          })}
        </div>
      </div>
      </PageTransition>

      <AddFoodModal
        open={modalOpen}
        defaultMeal={activeMeal}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
