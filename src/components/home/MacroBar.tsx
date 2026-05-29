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
      <span className="text-xs w-16 shrink-0" style={{ color: '#8AAF8C', fontWeight: 300 }}>
        {label}
      </span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0D1B10' }}>
        <div
          className="h-2 rounded-full"
          style={{
            width: mounted ? `${pct}%` : '0%',
            backgroundColor: over ? '#EA5224' : color,
            transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      <span className="text-xs w-20 text-right shrink-0" style={{ color: '#EAF2E6', fontWeight: 400 }}>
        {value.toFixed(1)}
        <span style={{ color: '#8AAF8C', fontWeight: 300 }}> / {goal}g</span>
      </span>
    </div>
  )
}
