import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useFoodStore } from '../store/foodStore'
import type { DietEntry } from '../types'

export function useDiet() {
  const { dietEntries, setDietEntries } = useFoodStore()

  const fetchDietEntries = useCallback(async () => {
    const { data, error } = await supabase
      .from('diet_cache')
      .select('*')
      .order('meal_type')
    if (!error && data) setDietEntries(data as DietEntry[])
  }, [setDietEntries])

  // Group entries by meal_type
  const byMeal = dietEntries.reduce<Record<string, DietEntry[]>>((acc, e) => {
    const key = e.meal_type
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return { dietEntries, fetchDietEntries, byMeal }
}
