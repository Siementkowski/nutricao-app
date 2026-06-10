import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

import type { WeightLog } from '../types'

export interface DayAdherence {
  date: string
  kcal: number
  status: 'on' | 'deficit' | 'surplus' | 'none'
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

    const [foodRes, exerciseRes] = await Promise.all([
      supabase.from('food_log').select('date, kcal').gte('date', fromStr),
      supabase.from('exercise_log').select('date, kcal_burned').gte('date', fromStr),
    ])

    // Aggregate kcal consumidas por dia
    const consumed = new Map<string, number>()
    for (const row of foodRes.data || []) {
      consumed.set(row.date, (consumed.get(row.date) ?? 0) + row.kcal)
    }

    // Aggregate kcal gastas por dia
    const burned = new Map<string, number>()
    for (const row of exerciseRes.data || []) {
      burned.set(row.date, (burned.get(row.date) ?? 0) + row.kcal_burned)
    }

    // Build 60-day array oldest → newest (saldo = meta - (consumidas - treino))
    const result: DayAdherence[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toLocaleDateString('en-CA')

      const consumedDay = consumed.get(dateStr) ?? 0
      const burnedDay   = burned.get(dateStr) ?? 0
      const net         = consumedDay - burnedDay
      const saldo       = kcalGoal - net   // positivo = déficit, negativo = superávit

      let status: DayAdherence['status'] = 'none'
      if (consumedDay > 0) {
        if (Math.abs(saldo) <= 100) status = 'on'
        else if (saldo > 100)       status = 'deficit'
        else                        status = 'surplus'
      }

      result.push({ date: dateStr, kcal: saldo, status })
    }
    setAdherence(result)
  }, [])

  return { weightLogs, adherence, fetchWeightLogs, logWeight, fetchAdherence }
}
