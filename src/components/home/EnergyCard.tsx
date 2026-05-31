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
  const label = isDeficit ? 'DÉFICIT CALÓRICO' : 'SUPERÁVIT CALÓRICO'
  const numColor = isDeficit ? '#111111' : '#C4501A'
  const accentColor = isDeficit ? '#2D7D46' : '#C4501A'
  const badgeText = isDeficit ? '✓ No caminho certo' : '⚠ Acima da meta'

  return (
    <div
      className="rounded-2xl px-5 py-4"
      style={{ backgroundColor: '#E8F5ED', border: '1.5px solid rgba(45,125,70,0.25)' }}
    >
      {/* Label */}
      <p style={{ color: accentColor, fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </p>

      {/* Number + breakdown row */}
      <div className="flex items-start justify-between">
        {/* Big number */}
        <div>
          <p style={{ color: numColor, fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: '-1px' }}>
            {Math.abs(Math.round(deficit))}
          </p>
          <p style={{ color: '#999999', fontSize: 11, fontWeight: 400, marginTop: 2 }}>kcal</p>
        </div>

        {/* Stats */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="flex justify-between gap-4">
            <span style={{ color: '#999999', fontSize: 11, fontWeight: 400 }}>TDEE base</span>
            <span style={{ color: '#111111', fontSize: 13, fontWeight: 700 }}>{tdeeBase} kcal</span>
          </div>
          <div className="flex justify-between gap-4">
            <span style={{ color: '#999999', fontSize: 11, fontWeight: 400 }}>Treino hoje</span>
            <span style={{ color: workoutKcal > 0 ? accentColor : '#999999', fontSize: 13, fontWeight: 700 }}>
              {workoutKcal > 0 ? `+${workoutKcal}` : '0'} kcal
            </span>
          </div>
          <div style={{ borderTop: '1px solid rgba(45,125,70,0.15)', paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#999999', fontSize: 11, fontWeight: 400 }}>Total gasto</span>
              <span style={{ color: '#111111', fontSize: 13, fontWeight: 700 }}>{totalSpent} kcal</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#999999', fontSize: 11, fontWeight: 400 }}>Consumido</span>
              <span style={{ color: '#111111', fontSize: 13, fontWeight: 700 }}>{Math.round(consumed)} kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badge */}
      <div style={{ marginTop: 12 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          backgroundColor: '#FFFFFF',
          border: `1px solid ${accentColor}`,
          borderRadius: 20,
          paddingLeft: 10,
          paddingRight: 10,
          paddingTop: 4,
          paddingBottom: 4,
          fontSize: 12,
          fontWeight: 700,
          color: accentColor,
        }}>
          {badgeText}
        </span>
      </div>
    </div>
  )
}
