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
  const color = isDeficit ? '#5A8A5C' : '#C47A5A'
  const bgColor = isDeficit ? '#EEF3EE' : '#FDF0EC'
  const borderColor = isDeficit ? '#D4E4D5' : '#EDD5C8'

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
    >
      {/* Big number */}
      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-2xl" style={{ color, fontWeight: 600, lineHeight: 1 }}>
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
          <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>TDEE base</span>
          <span className="text-xs" style={{ color: '#2C2C2C', fontWeight: 400 }}>{tdeeBase} kcal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>Treino hoje</span>
          <span className="text-xs" style={{ color: workoutKcal > 0 ? color : '#8C8880', fontWeight: workoutKcal > 0 ? 500 : 300 }}>
            {workoutKcal > 0 ? `+${workoutKcal}` : '0'} kcal
          </span>
        </div>
        <div
          className="flex justify-between pt-1.5"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>Total gasto</span>
          <span className="text-xs" style={{ color: '#2C2C2C', fontWeight: 600 }}>{totalSpent} kcal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>Consumido</span>
          <span className="text-xs" style={{ color: '#2C2C2C', fontWeight: 400 }}>{Math.round(consumed)} kcal</span>
        </div>
      </div>
    </div>
  )
}
