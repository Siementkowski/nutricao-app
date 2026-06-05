import { create } from 'zustand'
import type { FoodLog } from '../types'

interface DiaryState {
  todayLogs: FoodLog[]
  waterToday: number
  setTodayLogs: (logs: FoodLog[]) => void
  setWaterToday: (ml: number) => void
  addLog: (log: FoodLog) => void
  removeLog: (id: string) => void
  replaceLog: (tempId: string, log: FoodLog) => void
}

export const useDiaryStore = create<DiaryState>((set) => ({
  todayLogs: [],
  waterToday: 0,
  setTodayLogs: (logs) => set({ todayLogs: logs }),
  setWaterToday: (ml) => set({ waterToday: ml }),
  addLog: (log) => set((s) => ({ todayLogs: [...s.todayLogs, log] })),
  removeLog: (id) => set((s) => ({ todayLogs: s.todayLogs.filter((l) => l.id !== id) })),
  replaceLog: (tempId, log) => set((s) => ({
    todayLogs: s.todayLogs.map((l) => l.id === tempId ? log : l),
  })),
}))
