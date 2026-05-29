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
  const color = isDeficit ? '#46774F' : '#BC6242'
  const bgColor = isDeficit ? '#E3E9D6' : '#F6E6D9'
  const borderColor = isDeficit ? '#CAD7B8' : '#E7CDB6'

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
          <span className="text-xs" style={{ color: '#8B8170', fontWeight: 300 }}>TDEE base</span>
          <span className="text-xs" style={{ color: '#20302A', fontWeight: 400 }}>{tdeeBase} kcal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#8B8170', fontWeight: 300 }}>Treino hoje</span>
          <span className="text-xs" style={{ color: workoutKcal > 0 ? color : '#8B8170', fontWeight: workoutKcal > 0 ? 500 : 300 }}>
            {workoutKcal > 0 ? `+${workoutKcal}` : '0'} kcal
          </span>
        </div>
        <div
          className="flex justify-between pt-1.5"
          style={{ borderTop: `1px solid ${borderColor}` }}
        >
          <span className="text-xs" style={{ color: '#8B8170', fontWeight: 300 }}>Total gasto</span>
          <span className="text-xs" style={{ color: '#20302A', fontWeight: 600 }}>{totalSpent} kcal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs" style={{ color: '#8B8170', fontWeight: 300 }}>Consumido</span>
          <span className="text-xs" style={{ color: '#20302A', fontWeight: 400 }}>{Math.round(consumed)} kcal</span>
        </div>
      </div>
    </div>
  )
}
