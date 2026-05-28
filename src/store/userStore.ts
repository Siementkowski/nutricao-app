import { create } from 'zustand'
import type { UserGoals } from '../types'

interface UserState {
  goals: UserGoals
  setGoals: (goals: UserGoals) => void
}

export const useUserStore = create<UserState>((set) => ({
  goals: {
    kcal_goal: 2000,
    protein_goal: 150,
    carbs_goal: 200,
    fat_goal: 65,
    water_goal_ml: 2500,
  },
  setGoals: (goals) => set({ goals }),
}))
