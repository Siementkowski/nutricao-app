import { supabase } from './supabase'
import type { DietEntry, Food } from '../types'

const SHEET_URL = (sheetId: string, tab: string) =>
  `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`

// ── CSV parser ───────────────────────────────────────────────
function parseCSV(raw: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuote = false

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    const next = raw[i + 1]

    if (inQuote) {
      if (ch === '"' && next === '"') { field += '"'; i++ }
      else if (ch === '"') { inQuote = false }
      else { field += ch }
    } else {
      if (ch === '"') { inQuote = true }
      else if (ch === ',') { row.push(field.trim()); field = '' }
      else if (ch === '\n') {
        row.push(field.trim())
        if (row.some(f => f.length > 0)) rows.push(row)
        row = []; field = ''
      } else if (ch !== '\r') { field += ch }
    }
  }
  row.push(field.trim())
  if (row.some(f => f.length > 0)) rows.push(row)

  return rows
}

function num(v: string): number {
  return parseFloat(v.replace(',', '.')) || 0
}

// Mapeia nomes de refeição em português → chave interna
const MEAL_MAP: Record<string, string> = {
  'café': 'breakfast', 'cafe': 'breakfast', 'café da manhã': 'breakfast', 'cafe da manha': 'breakfast', 'manha': 'breakfast',
  'almoço': 'lunch', 'almoco': 'lunch',
  'jantar': 'dinner',
  'lanche': 'snack', 'lanche da tarde': 'snack',
}
function mapMeal(raw: string): string {
  const key = raw.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (const [k, v] of Object.entries(MEAL_MAP)) {
    const kn = k.normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (key.includes(kn)) return v
  }
  return raw.toLowerCase()
}

// ── Fetchers ─────────────────────────────────────────────────
export async function fetchFoodsFromSheets(sheetId: string): Promise<Omit<Food, 'id'>[]> {
  const res = await fetch(SHEET_URL(sheetId, 'Alimentos'))
  if (!res.ok) throw new Error(`Erro ao buscar planilha (${res.status})`)
  const text = await res.text()
  const rows = parseCSV(text)
  if (rows.length < 2) return []

  // Skip header row (index 0)
  return rows.slice(1).map(r => ({
    name: r[0] || '',
    category: r[1] || '',
    kcal_per_100g: num(r[2]),
    protein_per_100g: num(r[3]),
    carbs_per_100g: num(r[4]),
    fat_per_100g: num(r[5]),
  })).filter(f => f.name.length > 0)
}

export async function fetchDietFromSheets(sheetId: string): Promise<Omit<DietEntry, 'id'>[]> {
  const res = await fetch(SHEET_URL(sheetId, 'Dieta'))
  if (!res.ok) throw new Error(`Erro ao buscar planilha (${res.status})`)
  const text = await res.text()
  const rows = parseCSV(text)
  if (rows.length < 2) return []

  return rows.slice(1).map(r => ({
    meal_type: mapMeal(r[0] || ''),
    food_name: r[1] || '',
    quantity_g: num(r[2]),
    kcal: num(r[3]),
    protein: num(r[4]),
    carbs: num(r[5]),
    fat: num(r[6]),
    notes: r[7] || null,
    substitutions_json: r[8] || null,
  })).filter(e => e.food_name.length > 0)
}

// ── Supabase importers ────────────────────────────────────────
export async function importFoodsToSupabase(foods: Omit<Food, 'id'>[]): Promise<number> {
  await supabase.from('food_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const { error } = await supabase.from('food_cache').insert(foods)
  if (error) throw new Error(error.message)
  return foods.length
}

export async function importDietToSupabase(entries: Omit<DietEntry, 'id'>[]): Promise<number> {
  await supabase.from('diet_cache').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const { error } = await supabase.from('diet_cache').insert(entries)
  if (error) throw new Error(error.message)
  return entries.length
}

// ── Combo: fetch + import ─────────────────────────────────────
export interface SyncResult {
  foods: number
  diet: number
}

export async function syncFromSheets(sheetId: string): Promise<SyncResult> {
  const [foods, diet] = await Promise.all([
    fetchFoodsFromSheets(sheetId),
    fetchDietFromSheets(sheetId),
  ])
  const [foodCount, dietCount] = await Promise.all([
    importFoodsToSupabase(foods),
    importDietToSupabase(diet),
  ])
  return { foods: foodCount, diet: dietCount }
}
