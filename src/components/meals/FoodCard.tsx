import type { FoodLog } from '../../types'

interface FoodCardProps {
  log: FoodLog
  onDelete: (id: string) => void
}

export function FoodCard({ log, onDelete }: FoodCardProps) {
  return (
    <div className="food-card-enter flex items-center gap-3 py-3" style={{ borderBottom: '1px solid #F5F5F5' }}>
      <div className="flex-1 min-w-0">
        <p
          className="text-sm truncate"
          style={{ color: '#111111', fontWeight: 400 }}
        >
          {log.food_name}
        </p>
        <p className="text-xs mt-0.5" style={{ color: '#999999', fontWeight: 300 }}>
          {log.quantity_g}g &nbsp;·&nbsp;
          <span style={{ color: '#999999' }}>
            P {log.protein.toFixed(1)}g &nbsp;C {log.carbs.toFixed(1)}g &nbsp;G {log.fat.toFixed(1)}g
          </span>
        </p>
      </div>

      <span
        className="text-sm shrink-0"
        style={{ color: '#2D7D46', fontWeight: 600 }}
      >
        {Math.round(log.kcal)} kcal
      </span>

      <button
        onClick={() => onDelete(log.id)}
        className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg"
        style={{ color: '#999999' }}
        aria-label="Remover"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  )
}
