import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

import type { WeightLog } from '../types'

export interface DayAdherence {
  date: string
  kcal: number
  status: 'on' | 'near' | 'over' | 'none'
}

export function useProgress() {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([])
  const [adherence, setAdherence] = useState<DayAdherence[]>([])

  const fetchWeightLogs = useCallback(async (days = 30) => {
    const from = new Date()
    from.setDate(from.getDate() - days)
    const { data } = await supabase
      .from('weight_log')
      .select('*')
      .gte('date', from.toLocaleDateString('en-CA'))
      .order('date', { ascending: true })
    if (data) setWeightLogs(data as WeightLog[])
  }, [])

  const logWeight = useCallback(async (weight_kg: number, body_fat_pct?: number, notes?: string) => {
    const today = new Date().toLocaleDateString('en-CA')
    const { data } = await supabase
      .from('weight_log')
      .insert({ date: today, weight_kg, body_fat_pct: body_fat_pct ?? null, notes: notes ?? null })
      .select()
      .single()
    if (data) setWeightLogs((prev) => [...prev, data as WeightLog])
  }, [])

  const fetchAdherence = useCallback(async (kcalGoal: number, days = 60) => {
    const from = new Date()
    from.setDate(from.getDate() - (days - 1))
    const fromStr = from.toLocaleDateString('en-CA')

    const { data } = await supabase
      .from('food_log')
      .select('date, kcal')
      .gte('date', fromStr)

    // Aggregate kcal per date
    const byDate = new Map<string, number>()
    for (const row of data || []) {
      byDate.set(row.date, (byDate.get(row.date) ?? 0) + row.kcal)
    }

    // Build 60-day array oldest → newest
    const result: DayAdherence[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-CA')
      const kcal = byDate.get(dateStr) ?? 0

      let status: DayAdherence['status'] = 'none'
      if (kcal > 0) {
        const diff = kcal - kcalGoal
        if (Math.abs(diff) <= 100) status = 'on'
        else if (Math.abs(diff) <= 200) status = 'near'
        else status = 'over'
      }

      result.push({ date: dateStr, kcal, status })
    }
    setAdherence(result)
  }, [])

  return { weightLogs, adherence, fetchWeightLogs, logWeight, fetchAdherence }
}
