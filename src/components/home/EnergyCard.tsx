import { useEffect, useState } from 'react'
import { loadEnergy, calcTDEE } from '../../lib/energy'

interface EnergyCardProps {
  consumed: number
}

export function EnergyCard({ consumed }: EnergyCardProps) {
  const [tdee, setTdee] = useState(0)

  useEffect(() => {
    const s = loadEnergy()
    setTdee(calcTDEE(s))
  }, [])

  if (tdee === 0) return null

  const deficit = tdee - consumed
  const isDeficit = deficit > 0
  const label = isDeficit ? 'Déficit' : 'Superávit'
  const color = isDeficit ? '#5A8A5C' : '#C47A5A'
  const bgColor = isDeficit ? '#EEF3EE' : '#FDF0EC'
  const borderColor = isDeficit ? '#D4E4D5' : '#EDD5C8'

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center justify-between"
      style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
    >
      <div>
        <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color, fontWeight: 300 }}>
          {label} calórico
        </p>
        <p className="text-2xl" style={{ color, fontWeight: 600, lineHeight: 1.1 }}>
          {Math.abs(deficit)} kcal
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>TDEE</p>
        <p className="text-sm" style={{ color: '#2C2C2C', fontWeight: 500 }}>{tdee} kcal</p>
        <p className="text-xs mt-1" style={{ color: '#8C8880', fontWeight: 300 }}>Consumido</p>
        <p className="text-sm" style={{ color: '#2C2C2C', fontWeight: 500 }}>{Math.round(consumed)} kcal</p>
      </div>
    </div>
  )
}
