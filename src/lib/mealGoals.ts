export interface MealGoals {
  breakfast_kcal: number
  lunch_kcal: number
  dinner_kcal: number
  snack_kcal: number
}

const LS_KEY = 'nutricao_meal_goals'

export const MEAL_GOAL_DEFAULTS: MealGoals = {
  breakfast_kcal: 400,
  lunch_kcal: 700,
  dinner_kcal: 600,
  snack_kcal: 300,
}

export function loadMealGoals(): MealGoals {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return { ...MEAL_GOAL_DEFAULTS }
    return { ...MEAL_GOAL_DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...MEAL_GOAL_DEFAULTS }
  }
}

export function saveMealGoals(g: MealGoals): void {
  localStorage.setItem(LS_KEY, JSON.stringify(g))
}
