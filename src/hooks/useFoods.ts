import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useFoodStore } from '../store/foodStore'
import type { Food } from '../types'

export function useFoods() {
  const { foods, setFoods, searchFoods } = useFoodStore()

  const fetchFoods = useCallback(async () => {
    if (foods.length > 0) return
    const { data, error } = await supabase.from('food_cache').select('*').order('name')
    if (!error && data) setFoods(data as Food[])
  }, [foods.length, setFoods])

  return { foods, fetchFoods, searchFoods }
}
