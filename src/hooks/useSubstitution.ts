import { useFoodStore } from '../store/foodStore'
import type { Food } from '../types'

export type EquivType = 'kcal' | 'protein' | 'carbs' | 'fat' | 'balanced'

export interface MacroSnapshot {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface SubResult {
  qty: number           // grams to use for substitute
  origMacros: MacroSnapshot
  subMacros: MacroSnapshot
  error?: string
}

function round5(n: number): number {
  return Math.round(n / 5) * 5
}

function macrosFor(food: Food, qty: number): MacroSnapshot {
  const f = (v: number) => +((v * qty) / 100).toFixed(1)
  return {
    kcal: f(food.kcal_per_100g),
    protein: f(food.protein_per_100g),
    carbs: f(food.carbs_per_100g),
    fat: f(food.fat_per_100g),
  }
}

export function calcSubQty(
  orig: Food,
  sub: Food,
  qtyOrig: number,
  type: EquivType,
): { qty: number; error?: string } {
  function ratio(origVal: number, subVal: number): number | null {
    if (subVal === 0) return null
    return (qtyOrig * origVal) / subVal
  }

  if (type === 'balanced') {
    const candidates = [
      orig.kcal_per_100g > 0 ? ratio(orig.kcal_per_100g, sub.kcal_per_100g) : null,
      orig.protein_per_100g > 0 ? ratio(orig.protein_per_100g, sub.protein_per_100g) : null,
      orig.carbs_per_100g > 0 ? ratio(orig.carbs_per_100g, sub.carbs_per_100g) : null,
      orig.fat_per_100g > 0 ? ratio(orig.fat_per_100g, sub.fat_per_100g) : null,
    ].filter((v): v is number => v !== null && v > 0)

    if (candidates.length === 0) return { qty: 0, error: 'Não é possível calcular equivalência.' }
    const avg = candidates.reduce((s, v) => s + v, 0) / candidates.length
    return { qty: Math.max(5, round5(avg)) }
  }

  const fieldMap: Record<EquivType, [number, number]> = {
    kcal: [orig.kcal_per_100g, sub.kcal_per_100g],
    protein: [orig.protein_per_100g, sub.protein_per_100g],
    carbs: [orig.carbs_per_100g, sub.carbs_per_100g],
    fat: [orig.fat_per_100g, sub.fat_per_100g],
    balanced: [0, 0],
  }
  const [origVal, subVal] = fieldMap[type]
  const r = ratio(origVal, subVal)

  if (r === null) return { qty: 0, error: `O substituto não contém este nutriente.` }
  return { qty: Math.max(5, round5(r)) }
}

export function useSubstitution() {
  const { foods } = useFoodStore()

  function searchFoods(query: string): Food[] {
    if (!query.trim()) return foods.slice(0, 10)
    const q = query.toLowerCase()
    return foods.filter(f => f.name.toLowerCase().includes(q)).slice(0, 10)
  }

  function calculate(
    orig: Food,
    sub: Food,
    qtyOrig: number,
    type: EquivType,
  ): SubResult {
    const { qty, error } = calcSubQty(orig, sub, qtyOrig, type)
    return {
      qty,
      origMacros: macrosFor(orig, qtyOrig),
      subMacros: macrosFor(sub, qty),
      error,
    }
  }

  return { foods, searchFoods, calculate }
}
