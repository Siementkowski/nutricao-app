import { useEffect, useState } from 'react'
import { loadEnergy, calcTDEEBase } from '../../lib/energy'

interface EnergyCardProps {
  consumed: number
  workoutKcal: number
}

export function EnergyCard({ consumed, workoutKcal }: EnergyCardProps) {
  const [tdeeBase, setTdeeBase] = useState(0)

  useEffect(() => {
    const s = loadEnergy()
    setTdeeBase(calcTDEEBase(s))
  }, [])

  if (tdeeBase === 0) return null

  const totalSpent = tdeeBase + workoutKcal
  const deficit = totalSpent - consumed
  const isDeficit = deficit > 0
  const label = isDeficit ? 'Déficit' : 'Superávit'
  const color = isDeficit ? '#72C45A' : '#EA5224'
  const bgColor = isDeficit ? '#1C3520' : '#2A1608'
  const borderColor = isDeficit ? '#2A4830' : '#3C2412'

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
    >
      {/* Big number */}
      <div className="flex items-baseline gap-2 mb-3">
        <p className="font-display" style={{ color, fontWeight: 600, lineHeight: 1, fontSize: '2.1rem', letterSpacing: '-0.02em' }}>
          {Math.abs(Math.round(deficit))}
        </p>
        <p className="text-sm" style={{ color, fontWeight: 400 }}>kcal</p>
        <p className="text-xs uppercase tracking-wider ml-1" style={{ color, fontWeight: 300 }}>
          {label}
        </p>
      </div>

      {/* Breakdown */}
      <div className="space-y-1.5" style={{ borderTop: `1px solid ${borderColor}`, paddingTop: 10 }}>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>TDEE base</span>
          <span className="text-xs" style={{ color: '#EAF2E6', fontWeight: 400 }}>{tdeeBase} kcal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>Treino hoje</span>
          <span className="text-xs" style={{ color: workoutKcal > 0 ? color : '#8AAF8C', fontWeight: workoutKcal > 0 ? 500 : 300 }}>
            {workoutKcal > 0 ? `+${workoutKcal}` : '0'} kcal
          </span>
        </div>
        <div
          className="flex justify-between pt-1.5"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <span className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>Total gasto</span>
          <span className="text-xs" style={{ color: '#EAF2E6', fontWeight: 600 }}>{totalSpent} kcal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#8AAF8C', fontWeight: 300 }}>Consumido</span>
          <span className="text-xs" style={{ color: '#EAF2E6', fontWeight: 400 }}>{Math.round(consumed)} kcal</span>
        </div>
      </div>
    </div>
  )
}
