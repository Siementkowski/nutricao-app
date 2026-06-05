import { useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useFoodStore } from '../store/foodStore'
import type { Food } from '../types'

export function useFoods() {
  const { foods, setFoods, searchFoods } = useFoodStore()

  const fetchFoods = useCallback(async () => {
    if (foods.length > 0) return
    const { data, error } = await supabase.from('food_cache').select('*').order('name')
    if (!error && data) {
      // Deduplica por name+category (mesmo alimento pode ter múltiplas categorias)
      const seen = new Set<string>()
      const unique = (data as Food[]).filter(f => {
        const key = `${f.name}|${f.category}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      setFoods(unique)
    }
  }, [foods.length, setFoods])

  return { foods, fetchFoods, searchFoods }
}
