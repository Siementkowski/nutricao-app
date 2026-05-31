import { useEffect, useState } from 'react'

interface MacroBarProps {
  label: string
  value: number
  goal: number
  color: string
}

export function MacroBar({ label, value, goal, color }: MacroBarProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])

  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0
  const over = value > goal

  return (
    <div className="flex items-center gap-3">
      {/* Colored dot */}
      <span
        className="shrink-0"
        style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }}
      />
      {/* Label */}
      <span style={{ color: '#555555', fontSize: 13, fontWeight: 500, width: 84, flexShrink: 0 }}>
        {label}
      </span>
      {/* Bar */}
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 7, backgroundColor: '#F0F0F0' }}>
        <div
          className="rounded-full"
          style={{
            height: 7,
            width: mounted ? `${pct}%` : '0%',
            backgroundColor: over ? '#C4501A' : color,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      {/* Value */}
      <span style={{ color: '#555555', fontSize: 12, fontWeight: 600, width: 80, textAlign: 'right', flexShrink: 0 }}>
        {value.toFixed(1)}
        <span style={{ color: '#999999', fontWeight: 400 }}> / {goal}g</span>
      </span>
    </div>
  )
}
