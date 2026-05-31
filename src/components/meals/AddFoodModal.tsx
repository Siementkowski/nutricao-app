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
  const addBtnRef = useRef<HTMLDivElement>(null)

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
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
        style={{
          backgroundColor: '#FFFFFF',
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s ease',
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
        <div className="flex-1 overflow-y-auto px-5 pb-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
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
                    // After keyboard closes, scroll the Add button into view
                    setTimeout(() => {
                      addBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
                    }, 380)
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
                      {food.kcal_per_100g} kcal · {food.category}
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
                  className="rounded-xl px-3 py-2.5 flex items-center justify-between mb-3"
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

              {/* Adicionar button — inside the card, always visible */}
              {preview && (
                <div ref={addBtnRef}>
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
          )}

          {!selected && results.length === 0 && query.length > 0 && (
            <p className="text-center text-sm py-6" style={{ color: '#999999', fontWeight: 300 }}>
              Nenhum alimento encontrado
            </p>
          )}
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
