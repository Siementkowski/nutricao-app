interface ProgressRingProps {
  consumed: number
  goal: number
}

const R = 82
const CX = 100
const CY = 100
const STROKE = 13
const CIRCUMFERENCE = 2 * Math.PI * R

export function ProgressRing({ consumed, goal }: ProgressRingProps) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1.2) : 0
  const over = consumed > goal
  const diff = Math.abs(Math.round(consumed - goal))
  const offset = CIRCUMFERENCE * (1 - Math.min(pct, 1))
  const ringColor = over ? '#C4501A' : '#2D7D46'

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F0F0F0" strokeWidth={STROKE} />
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.2s ease' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span style={{ color: '#111111', fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: '-1.5px' }}>
            {Math.round(consumed)}
          </span>
          <span style={{ color: '#999999', fontSize: 12, fontWeight: 400 }}>
            kcal consumidas
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5 mt-1">
        <p style={{ color: ringColor, fontSize: 14, fontWeight: 700 }}>
          {over ? `${diff} kcal acima da meta` : diff === 0 ? '✓ Meta atingida' : `${diff} kcal restantes`}
        </p>
        <p style={{ color: '#999999', fontSize: 12, fontWeight: 400 }}>
          Meta: {goal} kcal
        </p>
      </div>
    </div>
  )
}
