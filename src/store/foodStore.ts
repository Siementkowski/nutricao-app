import { create } from 'zustand'
import type { Food, DietEntry } from '../types'

interface FoodState {
  foods: Food[]
  dietEntries: DietEntry[]
  setFoods: (foods: Food[]) => void
  setDietEntries: (entries: DietEntry[]) => void
  searchFoods: (query: string) => Food[]
}

export const useFoodStore = create<FoodState>((set, get) => ({
  foods: [],
  dietEntries: [],
  setFoods: (foods) => set({ foods }),
  setDietEntries: (entries) => set({ dietEntries: entries }),
  searchFoods: (query) => {
    const q = query.toLowerCase()
    return get().foods.filter((f) => f.name.toLowerCase().includes(q))
  },
}))
