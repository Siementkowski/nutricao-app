import { useState, useEffect, useCallback, useRef } from 'react'
import { useFoods } from '../../hooks/useFoods'
import { useDiary } from '../../hooks/useDiary'
import { localDateStr } from '../../lib/dateUtils'
import type { FoodLog, Food } from '../../types'

type MealType = FoodLog['meal_type']

interface AddFoodModalProps {
  open: boolean
  defaultMeal: MealType
  onClose: () => void
}

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
}

// Mapeamento português → chave interna (suporta dados antigos e novos do DB)
const PT_TO_KEY: Record<string, MealType> = {
  'cafe': 'breakfast', 'cafe da manha': 'breakfast', 'manha': 'breakfast',
  'almoco': 'lunch',
  'jantar': 'dinner',
  'lanche': 'snack',
}
function normalize(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
}
function categoryToKeys(category: string): MealType[] {
  if (!category) return []
  const n = normalize(category)
  if (n === 'todos' || n === 'all') return ['breakfast', 'lunch', 'snack', 'dinner']
  // Já é uma chave interna (pós-sync)
  if (['breakfast', 'lunch', 'snack', 'dinner'].includes(n)) return [n as MealType]
  // Pode ser comma-separated em português (dados antigos)
  return category.split(',').flatMap(part => {
    const pn = normalize(part)
    for (const [k, v] of Object.entries(PT_TO_KEY)) {
      if (pn.includes(k)) return [v]
    }
    return []
  })
}
function displayCategory(category: string): string {
  const keys = categoryToKeys(category)
  if (keys.length === 0) return category
  return keys.map(k => MEAL_LABELS[k]).join(', ')
}

function calcMacros(food: Food, qty: number) {
  const f = (v: number) => +((v * qty) / 100).toFixed(1)
  return {
    kcal: f(food.kcal_per_100g),
    protein: f(food.protein_per_100g),
    carbs: f(food.carbs_per_100g),
    fat: f(food.fat_per_100g),
  }
}

export function AddFoodModal({ open, defaultMeal, onClose }: AddFoodModalProps) {
  const { foods, fetchFoods, searchFoods } = useFoods()
  const { addFoodLog } = useDiary()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [selected, setSelected] = useState<Food | null>(null)
  const [qty, setQty] = useState('')
  const [meal, setMeal] = useState<MealType>(defaultMeal)
  const [saving, setSaving] = useState(false)
  const [kbOffset, setKbOffset] = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const qtyInputRef = useRef<HTMLInputElement>(null)

  // Track keyboard height via visualViewport
  useEffect(() => {
    if (!open) { setKbOffset(0); return }
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKbOffset(kb)
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      setKbOffset(0)
    }
  }, [open])

  useEffect(() => { if (open) fetchFoods() }, [open, fetchFoods])

  // Ao abrir: sincroniza refeição e reseta estado — corrige bug de refeição errada
  useEffect(() => {
    if (open) {
      setMeal(defaultMeal)
      setQuery('')
      setResults([])
      setSelected(null)
      setQty('')
    }
  }, [open, defaultMeal])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(() => {
      // Busca em todos os alimentos, independente da categoria
      setResults(searchFoods(query).slice(0, 8))
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, searchFoods])

  // Default: mostra alimentos da refeição atual em ordem alfabética
  useEffect(() => {
    if (!query.trim() && foods.length > 0 && !selected) {
      const byMeal = foods
        .filter(f => categoryToKeys(f.category).includes(meal))
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
      // Remove entradas duplicadas de nome (mesmo alimento pode ter várias entradas)
      const seen = new Set<string>()
      const unique = byMeal.filter(f => {
        if (seen.has(f.name)) return false
        seen.add(f.name)
        return true
      })
      setResults(unique.length > 0 ? unique.slice(0, 8) : foods.slice(0, 8))
    }
  }, [foods, query, selected, meal])

  const preview = selected && qty && +qty > 0 ? calcMacros(selected, +qty) : null

  const handleAdd = useCallback(async () => {
    if (!selected || !qty || +qty <= 0 || !preview) return
    onClose() // fecha imediatamente — optimistic update cuida do resto
    const today = localDateStr()
    addFoodLog({
      date: today,
      meal_type: meal,
      food_name: selected.name,
      quantity_g: +qty,
      ...preview,
    })
  }, [selected, qty, meal, preview, addFoodLog, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />

      {/* Sheet — sobe junto com o teclado via visualViewport */}
      <div
        className="fixed left-0 right-0 z-50 rounded-t-3xl"
        style={{
          bottom: kbOffset + 80,
          backgroundColor: '#FFFFFF',
          maxHeight: `min(92dvh, calc(100dvh - ${kbOffset}px - 80px - 16px))`,
          display: 'flex',
          flexDirection: 'column',
          transition: kbOffset > 0 ? 'bottom 0.15s ease, max-height 0.15s ease' : 'none',
          animation: kbOffset === 0 ? 'slideUp 0.25s ease' : 'none',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#EBEBEB' }} />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-5 pb-4 shrink-0">
          <h2 className="text-base" style={{ color: '#111111', fontWeight: 500 }}>
            Adicionar alimento
          </h2>
          <button onClick={onClose} style={{ color: '#999999' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Meal selector */}
        <div className="px-5 pb-3 shrink-0">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {(Object.keys(MEAL_LABELS) as MealType[]).map((m) => (
              <button
                key={m}
                onClick={() => setMeal(m)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs"
                style={{
                  backgroundColor: meal === m ? '#2D7D46' : '#E8F5ED',
                  color: meal === m ? '#FFFFFF' : '#999999',
                  fontWeight: meal === m ? 500 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {MEAL_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 shrink-0">
          <div
            className="flex items-center gap-2 rounded-2xl px-4 py-3"
            style={{ backgroundColor: '#F5F5F5', border: '1px solid #EBEBEB' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999999" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar alimento..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#111111' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSelected(null) }} style={{ color: '#999999' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5">
          {/* Results list */}
          {!selected && results.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{ border: '1px solid #EBEBEB' }}
            >
              {results.map((food, i) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelected(food)
                    setQty('100')
                    searchInputRef.current?.blur()
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  style={{
                    borderBottom: i < results.length - 1 ? '1px solid #F5F5F5' : 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div>
                    <p className="text-sm" style={{ color: '#111111', fontWeight: 400 }}>
                      {food.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#999999', fontWeight: 300 }}>
                      {food.kcal_per_100g} kcal · {displayCategory(food.category)}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: '#2D7D46', fontWeight: 500 }}>
                    /100g
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Selected food + quantity */}
          {selected && (
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ backgroundColor: '#E8F5ED', border: '1px solid #EBEBEB' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm" style={{ color: '#111111', fontWeight: 500 }}>
                  {selected.name}
                </p>
                <button
                  onClick={() => {
                    setSelected(null)
                    setQty('')
                    setTimeout(() => searchInputRef.current?.focus(), 50)
                  }}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: '#999999', backgroundColor: '#FFFFFF' }}
                >
                  Trocar
                </button>
              </div>

              {/* Qty input */}
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs" style={{ color: '#999999', fontWeight: 300 }}>
                  Quantidade
                </label>
                <div
                  className="flex items-center gap-1 rounded-xl px-3 py-2"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid #EBEBEB' }}
                >
                  <input
                    ref={qtyInputRef}
                    type="number"
                    inputMode="decimal"
                    min="1"
                    max="2000"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    className="w-16 bg-transparent text-sm text-center outline-none"
                    style={{ color: '#111111', fontWeight: 500 }}
                  />
                  <span className="text-xs" style={{ color: '#999999', fontWeight: 300 }}>g</span>
                </div>
              </div>

              {/* Live preview */}
              {preview && (
                <div
                  className="rounded-xl px-3 py-2.5 flex items-center justify-between"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <span className="text-sm" style={{ color: '#2D7D46', fontWeight: 600 }}>
                    {preview.kcal} kcal
                  </span>
                  <span className="text-xs" style={{ color: '#999999', fontWeight: 300 }}>
                    P {preview.protein}g · C {preview.carbs}g · G {preview.fat}g
                  </span>
                </div>
              )}
            </div>
          )}

          {!selected && results.length === 0 && query.length > 0 && (
            <p className="text-center text-sm py-6" style={{ color: '#999999', fontWeight: 300 }}>
              Nenhum alimento encontrado
            </p>
          )}
        </div>

        {/* Footer fixo com botão Adicionar — sempre visível acima da nav */}
        {preview && (
          <div className="shrink-0 px-5 pt-3 pb-4">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full py-3.5 rounded-xl text-sm"
              style={{
                backgroundColor: '#2D7D46',
                color: '#FFFFFF',
                fontWeight: 700,
                transition: 'opacity 0.15s',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Salvando...' : 'Adicionar'}
            </button>
          </div>
        )}


      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
