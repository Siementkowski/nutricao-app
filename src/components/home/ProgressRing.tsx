interface ProgressRingProps {
  consumed: number
  goal: number
}

const R = 85
const CX = 100
const CY = 100
const STROKE = 14
const CIRCUMFERENCE = 2 * Math.PI * R

export function ProgressRing({ consumed, goal }: ProgressRingProps) {
  const pct = goal > 0 ? Math.min(consumed / goal, 1.2) : 0
  const over = consumed > goal
  const diff = Math.abs(Math.round(consumed - goal))

  const ringColor = over ? '#C47A5A' : '#7C9A7E'
  const offset = CIRCUMFERENCE * (1 - Math.min(pct, 1))

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Track */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#EEF3EE"
            strokeWidth={STROKE}
          />
          {/* Progress arc — starts at top (−90°) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={ringColor}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.3s ease' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span style={{ color: '#2C2C2C', fontSize: 40, fontWeight: 600, lineHeight: 1 }}>
            {Math.round(consumed)}
          </span>
          <span style={{ color: '#8C8880', fontSize: 12, fontWeight: 300, marginTop: 4 }}>
            de {goal} kcal
          </span>
        </div>
      </div>

      {/* Below ring */}
      <p
        className="text-sm mt-1"
        style={{ color: over ? '#C47A5A' : '#7C9A7E', fontWeight: 500 }}
      >
        {over
          ? `${diff} kcal acima da meta`
          : diff === 0
            ? 'Meta atingida!'
            : `${diff} kcal restantes`}
      </p>
    </div>
  )
}
