import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ExerciseLog, ExerciseCache } from '../types'

export type { ExerciseLog, ExerciseCache }

export function useExercise() {
  const [todayLogs, setTodayLogs] = useState<ExerciseLog[]>([])
  const [exerciseCache, setExerciseCache] = useState<ExerciseCache[]>([])

  const fetchTodayExercise = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('exercise_log')
      .select('*')
      .eq('date', today)
      .order('created_at', { ascending: false })
    if (error) { console.warn('exercise_log:', error.message); return }
    if (data) setTodayLogs(data as ExerciseLog[])
  }, [])

  const fetchExerciseCache = useCallback(async () => {
    const { data, error } = await supabase
      .from('exercise_cache')
      .select('*')
      .order('exercicio')
    if (error) { console.warn('exercise_cache:', error.message); return }
    if (data) setExerciseCache(data as ExerciseCache[])
  }, [])

  const addExerciseLog = useCallback(async (
    entry: Omit<ExerciseLog, 'id' | 'created_at'>
  ): Promise<ExerciseLog | null> => {
    // Optimistic: atualiza total imediatamente
    const tempId = `temp-${Date.now()}`
    const tempLog: ExerciseLog = { id: tempId, created_at: new Date().toISOString(), ...entry }
    setTodayLogs(prev => [tempLog, ...prev])
    const { data, error } = await supabase
      .from('exercise_log')
      .insert(entry)
      .select()
      .single()
    if (error) {
      setTodayLogs(prev => prev.filter(l => l.id !== tempId)) // rollback
      console.warn('addExerciseLog:', error.message)
      return null
    }
    const log = data as ExerciseLog
    setTodayLogs(prev => prev.map(l => l.id === tempId ? log : l)) // troca temp pelo real
    return log
  }, [])

  const removeLastLog = useCallback(async (type: 'strength' | 'cardio') => {
    // todayLogs is sorted descending — first match is the most recent
    setTodayLogs(prev => {
      const idx = prev.findIndex(l => l.type === type)
      if (idx === -1) return prev
      const log = prev[idx]
      supabase.from('exercise_log').delete().eq('id', log.id)
      return prev.filter((_, i) => i !== idx)
    })
  }, [])

  const getTotalBurned = useCallback((): number => {
    return Math.round(todayLogs.reduce((s, l) => s + l.kcal_burned, 0))
  }, [todayLogs])

  const getTotalByType = useCallback((type: 'strength' | 'cardio') => {
    const logs = todayLogs.filter(l => l.type === type)
    return {
      kcal: Math.round(logs.reduce((s, l) => s + l.kcal_burned, 0)),
      minutes: logs.reduce((s, l) => s + l.duration_min, 0),
    }
  }, [todayLogs])

  return {
    todayLogs,
    exerciseCache,
    fetchTodayExercise,
    fetchExerciseCache,
    addExerciseLog,
    removeLastLog,
    getTotalBurned,
    getTotalByType,
  }
}
