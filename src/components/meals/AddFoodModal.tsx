import { useState, useEffect, useCallback, useRef } from 'react'
import { useFoods } from '../../hooks/useFoods'
import { useDiary } from '../../hooks/useDiary'
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const qtyInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) fetchFoods() }, [open, fetchFoods])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults([])
      setSelected(null)
      setQty('')
      setMeal(defaultMeal)
    }
  }, [open, defaultMeal])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setResults([]); return }
    debounceRef.current = setTimeout(() => {
      setResults(searchFoods(query).slice(0, 8))
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, searchFoods])

  // Fallback: show all foods when no query and foods loaded
  useEffect(() => {
    if (!query.trim() && foods.length > 0 && !selected) {
      setResults(foods.slice(0, 8))
    }
  }, [foods, query, selected])

  const preview = selected && qty && +qty > 0 ? calcMacros(selected, +qty) : null

  const handleAdd = useCallback(async () => {
    if (!selected || !qty || +qty <= 0 || !preview) return
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    await addFoodLog({
      date: today,
      meal_type: meal,
      food_name: selected.name,
      quantity_g: +qty,
      ...preview,
    })
    setSaving(false)
    onClose()
  }, [selected, qty, meal, preview, addFoodLog, onClose])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
        style={{
          backgroundColor: '#152318',
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#22362A' }} />
        </div>

        {/* Title row */}
        <div className="flex items-center justify-between px-5 pb-4 shrink-0">
          <h2 className="text-base" style={{ color: '#EAF2E6', fontWeight: 500 }}>
            Adicionar alimento
          </h2>
          <button onClick={onClose} style={{ color: '#8AAF8C' }}>
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
                  backgroundColor: meal === m ? '#72C45A' : '#1C3520',
                  color: meal === m ? '#152318' : '#8AAF8C',
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
            style={{ backgroundColor: '#0D1B10', border: '1px solid #22362A' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8AAF8C" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={searchInputRef}
              autoFocus
              type="text"
              placeholder="Buscar alimento..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null) }}
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#EAF2E6' }}
            />
            {query && (
              <button onClick={() => { setQuery(''); setSelected(null) }} style={{ color: '#8AAF8C' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {/* Results list */}
          {!selected && results.length > 0 && (
            <div
              className="rounded-2xl overflow-hidden mb-4"
              style={{ border: '1px solid #22362A' }}
            >
              {results.map((food, i) => (
                <button
                  key={food.id}
                  onClick={() => {
                    setSelected(food)
                    setQty('100')
                    // Dismiss the keyboard so the Adicionar button is visible
                    searchInputRef.current?.blur()
                    // Small delay so the keyboard has time to close before focusing qty
                    setTimeout(() => qtyInputRef.current?.select(), 350)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                  style={{
                    borderBottom: i < results.length - 1 ? '1px solid #0D1B10' : 'none',
                    backgroundColor: '#152318',
                  }}
                >
                  <div>
                    <p className="text-sm" style={{ color: '#EAF2E6', fontWeight: 400 }}>
                      {food.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                      {food.kcal_per_100g} kcal · {food.category}
                    </p>
                  </div>
                  <span className="text-xs" style={{ color: '#72C45A', fontWeight: 500 }}>
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
              style={{ backgroundColor: '#1C3520', border: '1px solid #22362A' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm" style={{ color: '#EAF2E6', fontWeight: 500 }}>
                  {selected.name}
                </p>
                <button
                  onClick={() => {
                    setSelected(null)
                    setQty('')
                    setTimeout(() => searchInputRef.current?.focus(), 50)
                  }}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ color: '#8AAF8C', backgroundColor: '#152318' }}
                >
                  Trocar
                </button>
              </div>

              {/* Qty input */}
              <div className="flex items-center gap-3 mb-3">
                <label className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                  Quantidade
                </label>
                <div
                  className="flex items-center gap-1 rounded-xl px-3 py-2"
                  style={{ backgroundColor: '#152318', border: '1px solid #22362A' }}
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
                    style={{ color: '#EAF2E6', fontWeight: 500 }}
                  />
                  <span className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>g</span>
                </div>
              </div>

              {/* Live preview */}
              {preview && (
                <div
                  className="rounded-xl px-3 py-2.5 flex items-center justify-between"
                  style={{ backgroundColor: '#152318' }}
                >
                  <span className="text-sm" style={{ color: '#E8A01E', fontWeight: 600 }}>
                    {preview.kcal} kcal
                  </span>
                  <span className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                    P {preview.protein}g · C {preview.carbs}g · G {preview.fat}g
                  </span>
                </div>
              )}
            </div>
          )}

          {!selected && results.length === 0 && query.length > 0 && (
            <p className="text-center text-sm py-6" style={{ color: '#8AAF8C', fontWeight: 300 }}>
              Nenhum alimento encontrado
            </p>
          )}
        </div>

        {/* Add button */}
        <div className="px-5 pt-2 pb-8 shrink-0" style={{ borderTop: '1px solid #22362A' }}>
          <button
            onClick={handleAdd}
            disabled={!selected || !preview || saving}
            className="w-full py-4 rounded-2xl text-sm"
            style={{
              backgroundColor: selected && preview ? '#72C45A' : '#22362A',
              color: selected && preview ? '#152318' : '#8AAF8C',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
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
