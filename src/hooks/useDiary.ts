import { useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useDiaryStore } from '../store/diaryStore'
import type { FoodLog } from '../types'

export function useDiary() {
  const { todayLogs, waterToday, setTodayLogs, setWaterToday, addLog, removeLog } = useDiaryStore()

  const fetchTodayLogs = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('food_log')
      .select('*')
      .eq('date', today)
      .order('created_at', { ascending: true })
    if (!error && data) setTodayLogs(data as FoodLog[])
  }, [setTodayLogs])

  const addFoodLog = useCallback(async (entry: Omit<FoodLog, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('food_log').insert(entry).select().single()
    if (!error && data) addLog(data as FoodLog)
    return { error }
  }, [addLog])

  const removeFoodLog = useCallback(async (id: string) => {
    const { error } = await supabase.from('food_log').delete().eq('id', id)
    if (!error) removeLog(id)
  }, [removeLog])

  const fetchTodayWater = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('water_log')
      .select('amount_ml')
      .eq('date', today)
    const total = (data || []).reduce((sum, row) => sum + row.amount_ml, 0)
    setWaterToday(total)
  }, [setWaterToday])

  const addWater = useCallback(async (amount_ml: number) => {
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('water_log').insert({ date: today, amount_ml })
    setWaterToday(waterToday + amount_ml)
  }, [waterToday, setWaterToday])

  const getDayMacros = useMemo(() => ({
    kcal: todayLogs.reduce((s, l) => s + l.kcal, 0),
    protein: todayLogs.reduce((s, l) => s + l.protein, 0),
    carbs: todayLogs.reduce((s, l) => s + l.carbs, 0),
    fat: todayLogs.reduce((s, l) => s + l.fat, 0),
  }), [todayLogs])

  const getMealMacros = useCallback((meal_type: FoodLog['meal_type']) => {
    const logs = todayLogs.filter((l) => l.meal_type === meal_type)
    return {
      kcal: logs.reduce((s, l) => s + l.kcal, 0),
      protein: logs.reduce((s, l) => s + l.protein, 0),
      carbs: logs.reduce((s, l) => s + l.carbs, 0),
      fat: logs.reduce((s, l) => s + l.fat, 0),
      logs,
    }
  }, [todayLogs])

  return {
    todayLogs,
    waterToday,
    fetchTodayLogs,
    addFoodLog,
    removeFoodLog,
    fetchTodayWater,
    addWater,
    getDayMacros,
    getMealMacros,
  }
}
