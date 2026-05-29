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

  const offset = CIRCUMFERENCE * (1 - Math.min(pct, 1))

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <defs>
            {/* Living gradient: deep herb green flowing into chartreuse */}
            <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#72C45A" />
              <stop offset="100%" stopColor="#C4EA38" />
            </linearGradient>
            <linearGradient id="ring-grad-over" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EA5224" />
              <stop offset="100%" stopColor="#E8A01E" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke="#1C3520"
            strokeWidth={STROKE}
          />
          {/* Progress arc — starts at top (−90°) */}
          <circle
            cx={CX}
            cy={CY}
            r={R}
            fill="none"
            stroke={over ? 'url(#ring-grad-over)' : 'url(#ring-grad)'}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 100 100)"
            style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.34,1.2,0.64,1)' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display"
            style={{ color: '#EAF2E6', fontSize: 52, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em' }}
          >
            {Math.round(consumed)}
          </span>
          <span className="uppercase tracking-[0.15em]" style={{ color: '#8AAF8C', fontSize: 11, fontWeight: 500, marginTop: 6 }}>
            de {goal} kcal
          </span>
        </div>
      </div>

      {/* Below ring */}
      <p
        className="text-sm mt-2"
        style={{ color: over ? '#EA5224' : '#72C45A', fontWeight: 500 }}
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
