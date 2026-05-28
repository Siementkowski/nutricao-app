export interface Food {
  id: string
  name: string
  category: string
  kcal_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
}

export interface FoodLog {
  id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  food_name: string
  quantity_g: number
  kcal: number
  protein: number
  carbs: number
  fat: number
  created_at: string
}

export interface WaterLog {
  id: string
  date: string
  amount_ml: number
  created_at: string
}

export interface WeightLog {
  id: string
  date: string
  weight_kg: number
  body_fat_pct: number | null
  notes: string | null
}

export interface UserGoals {
  kcal_goal: number
  protein_goal: number
  carbs_goal: number
  fat_goal: number
  water_goal_ml: number
}

export interface DietEntry {
  id: string
  meal_type: string
  food_name: string
  quantity_g: number
  kcal: number
  protein: number
  carbs: number
  fat: number
  notes: string | null
  substitutions_json: string | null
}
