import { useState } from 'react'
import { FoodCard } from './FoodCard'
import type { FoodLog } from '../../types'

interface MealSectionProps {
  label: string
  mealType: FoodLog['meal_type']
  logs: FoodLog[]
  kcal: number
  protein: number
  carbs: number
  fat: number
  onDelete: (id: string) => void
  onAdd: () => void
}

export function MealSection({
  label, logs, kcal, protein, carbs, fat, onDelete, onAdd,
}: MealSectionProps) {
  const [open, setOpen] = useState(true)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#FBFAF4', border: '1px solid #E2DBC9' }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: '#20302A', fontWeight: 500 }}>
            {label}
          </span>
          {kcal > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ backgroundColor: '#E3E9D6', color: '#3B6B4D', fontWeight: 500 }}
            >
              {Math.round(kcal)} kcal
            </span>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#8B8170" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-4">
          {/* Food list */}
          {logs.length === 0 ? (
            <p className="text-xs py-2 mb-2" style={{ color: '#8B8170', fontWeight: 300 }}>
              Nenhum alimento registrado
            </p>
          ) : (
            <div>
              {logs.map((log) => (
                <FoodCard key={log.id} log={log} onDelete={onDelete} />
              ))}
            </div>
          )}

          {/* Macro footer (only when there's food) */}
          {logs.length > 0 && (
            <div
              className="flex gap-4 px-3 py-2 rounded-xl mt-1 mb-3"
              style={{ backgroundColor: '#EFEADD' }}
            >
              {[
                { label: 'P', value: protein, color: '#BE8842' },
                { label: 'C', value: carbs, color: '#898B45' },
                { label: 'G', value: fat, color: '#3B6B4D' },
              ].map(({ label: l, value, color }) => (
                <span key={l} className="text-xs" style={{ color: '#8B8170', fontWeight: 300 }}>
                  {l}{' '}
                  <span style={{ color, fontWeight: 500 }}>
                    {value.toFixed(1)}g
                  </span>
                </span>
              ))}
            </div>
          )}

          {/* Add button */}
          <button
            onClick={onAdd}
            className="flex items-center gap-2 text-xs py-2"
            style={{ color: '#3B6B4D', fontWeight: 500 }}
          >
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#E3E9D6' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </span>
            Adicionar alimento
          </button>
        </div>
      )}
    </div>
  )
}
