import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { PageTransition } from '../components/layout/PageTransition'
import { useSubstitution, type EquivType, type SubResult } from '../hooks/useSubstitution'
import { useFoods } from '../hooks/useFoods'
import { useDiary } from '../hooks/useDiary'
import type { Food, FoodLog } from '../types'

type MealType = FoodLog['meal_type']

const EQUIV_OPTIONS: { key: EquivType; label: string }[] = [
  { key: 'kcal', label: 'Kcal' },
  { key: 'protein', label: 'Proteína' },
  { key: 'carbs', label: 'Carb' },
  { key: 'fat', label: 'Gordura' },
  { key: 'balanced', label: 'Equilibrado' },
]

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Café da manhã',
  lunch: 'Almoço',
  dinner: 'Jantar',
  snack: 'Lanche',
}

// ── FoodPicker ────────────────────────────────────────────────
interface FoodPickerProps {
  label: string
  selected: Food | null
  onSelect: (f: Food) => void
  onClear: () => void
  searchFn: (q: string) => Food[]
}

function FoodPicker({ label, selected, onSelect, onClear, searchFn }: FoodPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Food[]>([])
  const [open, setOpen] = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      setResults(searchFn(query))
    }, 200)
    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [query, searchFn])

  useEffect(() => { setResults(searchFn('')) }, [searchFn])

  if (selected) {
    return (
      <div
        className="flex items-center justify-between px-4 py-3 rounded-xl"
        style={{ backgroundColor: '#1C3520', border: '1px solid #2A4830' }}
      >
        <div>
          <p className="text-xs mb-0.5" style={{ color: '#8AAF8C', fontWeight: 300 }}>{label}</p>
          <p className="text-sm" style={{ color: '#EAF2E6', fontWeight: 500 }}>{selected.name}</p>
          <p className="text-xs mt-0.5" style={{ color: '#8AAF8C', fontWeight: 300 }}>
            {selected.kcal_per_100g} kcal · P {selected.protein_per_100g}g · C {selected.carbs_per_100g}g · G {selected.fat_per_100g}g / 100g
          </p>
        </div>
        <button
          onClick={onClear}
          className="text-xs px-2 py-1 rounded-lg ml-3 shrink-0"
          style={{ color: '#8AAF8C', backgroundColor: '#152318', border: '1px solid #22362A' }}
        >
          Trocar
        </button>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs mb-1.5" style={{ color: '#8AAF8C', fontWeight: 300 }}>{label}</p>
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ backgroundColor: '#0D1B10', border: '1px solid #22362A' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8AAF8C" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar alimento..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#EAF2E6' }}
        />
      </div>

      {open && results.length > 0 && (
        <div
          className="mt-1 rounded-xl overflow-hidden"
          style={{ border: '1px solid #22362A', backgroundColor: '#152318', maxHeight: 200, overflowY: 'auto' }}
        >
          {results.map((food, i) => (
            <button
              key={food.id}
              onClick={() => { onSelect(food); setQuery(''); setOpen(false) }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
              style={{ borderBottom: i < results.length - 1 ? '1px solid #0D1B10' : 'none' }}
            >
              <span className="text-sm" style={{ color: '#EAF2E6', fontWeight: 400 }}>{food.name}</span>
              <span className="text-xs ml-2 shrink-0" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                {food.kcal_per_100g} kcal/100g
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Diff cell ─────────────────────────────────────────────────
function DiffCell({ orig, sub }: { orig: number; sub: number }) {
  const diff = +(sub - orig).toFixed(1)
  const color = diff > 0 ? '#EA5224' : diff < 0 ? '#72C45A' : '#8AAF8C'
  return (
    <td className="text-right text-xs py-2 pr-2" style={{ color, fontWeight: diff !== 0 ? 500 : 300 }}>
      {diff > 0 ? '+' : ''}{diff}
    </td>
  )
}

// ── Main page ─────────────────────────────────────────────────
export function Substitution() {
  const { searchFoods, calculate } = useSubstitution()
  const { fetchFoods } = useFoods()
  const { addFoodLog } = useDiary()

  const [origFood, setOrigFood] = useState<Food | null>(null)
  const [subFood, setSubFood] = useState<Food | null>(null)
  const [origQty, setOrigQty] = useState('100')
  const [equivType, setEquivType] = useState<EquivType>('protein')
  const [result, setResult] = useState<SubResult | null>(null)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealType>('lunch')
  const [registering, setRegistering] = useState(false)
  const [registered, setRegistered] = useState(false)

  useEffect(() => { fetchFoods() }, [fetchFoods])

  useEffect(() => {
    if (origFood && subFood && origQty && +origQty > 0) {
      setResult(calculate(origFood, subFood, +origQty, equivType))
    } else {
      setResult(null)
    }
  }, [origFood, subFood, origQty, equivType, calculate])

  async function handleRegister() {
    if (!subFood || !result || result.qty <= 0) return
    setRegistering(true)
    const today = new Date().toISOString().split('T')[0]
    await addFoodLog({
      date: today,
      meal_type: selectedMeal,
      food_name: subFood.name,
      quantity_g: result.qty,
      kcal: result.subMacros.kcal,
      protein: result.subMacros.protein,
      carbs: result.subMacros.carbs,
      fat: result.subMacros.fat,
    })
    setRegistering(false)
    setRegistered(true)
    setRegisterOpen(false)
    setTimeout(() => setRegistered(false), 3000)
  }

  const macroRows = result ? [
    { label: 'Kcal', orig: result.origMacros.kcal, sub: result.subMacros.kcal },
    { label: 'Proteína (g)', orig: result.origMacros.protein, sub: result.subMacros.protein },
    { label: 'Carb (g)', orig: result.origMacros.carbs, sub: result.subMacros.carbs },
    { label: 'Gordura (g)', orig: result.origMacros.fat, sub: result.subMacros.fat },
  ] : []

  return (
    <>
      <PageTransition>
      <div>
        <PageHeader title="Substituições" subtitle="Equivalência nutricional" />

        <div className="px-5 space-y-4 pb-28">

          {/* Original */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ backgroundColor: '#152318', border: '1px solid #22362A' }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ color: '#8AAF8C', fontWeight: 300 }}>
              Alimento original
            </p>
            <FoodPicker
              label="Selecionar alimento"
              selected={origFood}
              onSelect={setOrigFood}
              onClear={() => { setOrigFood(null); setResult(null) }}
              searchFn={searchFoods}
            />
            {origFood && (
              <div className="flex items-center gap-2">
                <label className="text-xs shrink-0" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                  Quantidade
                </label>
                <div
                  className="flex items-center gap-1 rounded-xl px-3 py-2"
                  style={{ backgroundColor: '#0D1B10', border: '1px solid #22362A' }}
                >
                  <input
                    type="number"
                    min="5"
                    max="2000"
                    value={origQty}
                    onChange={e => setOrigQty(e.target.value)}
                    className="w-16 bg-transparent text-sm text-center outline-none"
                    style={{ color: '#EAF2E6', fontWeight: 500 }}
                  />
                  <span className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>g</span>
                </div>
              </div>
            )}
          </div>

          {/* Equivalence type */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: '#152318', border: '1px solid #22362A' }}
          >
            <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8AAF8C', fontWeight: 300 }}>
              Equivalência por
            </p>
            <div className="flex gap-2 flex-wrap">
              {EQUIV_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setEquivType(key)}
                  className="px-3 py-1.5 rounded-full text-xs"
                  style={{
                    backgroundColor: equivType === key ? '#72C45A' : '#0D1B10',
                    color: equivType === key ? '#152318' : '#8AAF8C',
                    fontWeight: equivType === key ? 500 : 400,
                    border: `1px solid ${equivType === key ? '#72C45A' : '#22362A'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Substitute */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ backgroundColor: '#152318', border: '1px solid #22362A' }}
          >
            <p className="text-xs uppercase tracking-wider" style={{ color: '#8AAF8C', fontWeight: 300 }}>
              Alimento substituto
            </p>
            <FoodPicker
              label="Selecionar substituto"
              selected={subFood}
              onSelect={setSubFood}
              onClear={() => { setSubFood(null); setResult(null) }}
              searchFn={searchFoods}
            />
          </div>

          {/* Result */}
          {result && !result.error && (
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: '#152318', border: '1px solid #22362A' }}
            >
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                Resultado
              </p>

              <div
                className="rounded-xl px-4 py-3 mb-4"
                style={{ backgroundColor: '#1C3520' }}
              >
                <p className="text-sm" style={{ color: '#EAF2E6', fontWeight: 400 }}>
                  Para equivaler em{' '}
                  <span style={{ color: '#72C45A', fontWeight: 500 }}>
                    {EQUIV_OPTIONS.find(o => o.key === equivType)?.label}
                  </span>
                  , use{' '}
                  <span style={{ color: '#EAF2E6', fontWeight: 600, fontSize: 18 }}>
                    {result.qty}g
                  </span>
                  {' '}de {subFood?.name}
                </p>
              </div>

              {/* Comparison table */}
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #22362A' }}>
                    <th className="text-left py-2 pl-1" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                      Nutriente
                    </th>
                    <th className="text-right py-2 pr-2" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                      Original
                    </th>
                    <th className="text-right py-2 pr-2" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                      Substituto
                    </th>
                    <th className="text-right py-2 pr-2" style={{ color: '#8AAF8C', fontWeight: 300 }}>
                      Δ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {macroRows.map(row => (
                    <tr key={row.label} style={{ borderBottom: '1px solid #0D1B10' }}>
                      <td className="py-2 pl-1 text-xs" style={{ color: '#EAF2E6', fontWeight: 400 }}>
                        {row.label}
                      </td>
                      <td className="text-right py-2 pr-2 text-xs" style={{ color: '#EAF2E6', fontWeight: 400 }}>
                        {row.orig}
                      </td>
                      <td className="text-right py-2 pr-2 text-xs" style={{ color: '#EAF2E6', fontWeight: 400 }}>
                        {row.sub}
                      </td>
                      <DiffCell orig={row.orig} sub={row.sub} />
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Register button */}
              <button
                onClick={() => setRegisterOpen(true)}
                disabled={registered}
                className="w-full mt-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: registered ? '#1C3520' : '#72C45A',
                  color: registered ? '#72C45A' : '#152318',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                {registered ? '✓ Substituição registrada' : 'Registrar substituição'}
              </button>
            </div>
          )}

          {result?.error && (
            <div
              className="rounded-2xl px-4 py-3"
              style={{ backgroundColor: '#2A1608', border: '1px solid #3C2412' }}
            >
              <p className="text-sm" style={{ color: '#EA5224', fontWeight: 400 }}>
                {result.error}
              </p>
            </div>
          )}

        </div>
      </div>
      </PageTransition>

      {/* Register meal selector sheet */}
      {registerOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(0,0,0,0.72)' }}
            onClick={() => setRegisterOpen(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{ backgroundColor: '#152318', animation: 'slideUp 0.25s ease' }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#22362A' }} />
            </div>
            <div className="px-5 pt-4 pb-8">
              <p className="text-sm mb-4" style={{ color: '#EAF2E6', fontWeight: 500 }}>
                Registrar em qual refeição?
              </p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(Object.keys(MEAL_LABELS) as MealType[]).map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMeal(m)}
                    className="py-3 rounded-xl text-sm"
                    style={{
                      backgroundColor: selectedMeal === m ? '#72C45A' : '#0D1B10',
                      color: selectedMeal === m ? '#152318' : '#EAF2E6',
                      fontWeight: selectedMeal === m ? 500 : 400,
                      border: `1px solid ${selectedMeal === m ? '#72C45A' : '#22362A'}`,
                      transition: 'all 0.15s',
                    }}
                  >
                    {MEAL_LABELS[m]}
                  </button>
                ))}
              </div>
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-4 rounded-2xl text-sm"
                style={{ backgroundColor: '#72C45A', color: '#152318', fontWeight: 500 }}
              >
                {registering ? 'Salvando...' : `Confirmar — ${result?.qty}g de ${subFood?.name}`}
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
      )}
    </>
  )
}
