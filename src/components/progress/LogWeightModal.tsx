import { useState } from 'react'

interface LogWeightModalProps {
  open: boolean
  onClose: () => void
  onSave: (weight: number, fatPct?: number, notes?: string) => Promise<void>
}

export function LogWeightModal({ open, onClose, onSave }: LogWeightModalProps) {
  const [weight, setWeight] = useState('')
  const [fat, setFat] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const w = parseFloat(weight)
    if (!w || w <= 0) return
    setSaving(true)
    await onSave(w, fat ? parseFloat(fat) : undefined, notes || undefined)
    setSaving(false)
    setWeight(''); setFat(''); setNotes('')
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(44,44,44,0.35)' }}
        onClick={onClose}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
        style={{ backgroundColor: '#FBFAF4', animation: 'slideUp 0.25s ease' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#E2DBC9' }} />
        </div>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #E2DBC9' }}>
          <h2 className="text-base" style={{ color: '#20302A', fontWeight: 500 }}>
            Registrar peso
          </h2>
          <button onClick={onClose} style={{ color: '#8B8170' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Weight */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: '#8B8170', fontWeight: 300 }}>
              Peso (kg) *
            </label>
            <input
              autoFocus
              type="number"
              step="0.1"
              min="30"
              max="300"
              placeholder="78.5"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-lg outline-none"
              style={{
                backgroundColor: '#EFEADD',
                border: '1px solid #E2DBC9',
                color: '#20302A',
                fontWeight: 500,
              }}
            />
          </div>

          {/* Body fat */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: '#8B8170', fontWeight: 300 }}>
              % Gordura corporal (opcional)
            </label>
            <input
              type="number"
              step="0.1"
              min="3"
              max="60"
              placeholder="18.0"
              value={fat}
              onChange={e => setFat(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#EFEADD', border: '1px solid #E2DBC9', color: '#20302A' }}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs block mb-1.5" style={{ color: '#8B8170', fontWeight: 300 }}>
              Nota (opcional)
            </label>
            <input
              type="text"
              placeholder="ex: após treino, em jejum..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#EFEADD', border: '1px solid #E2DBC9', color: '#20302A' }}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={!weight || saving}
            className="w-full py-4 rounded-2xl text-sm mb-4"
            style={{
              backgroundColor: weight ? '#3B6B4D' : '#E2DBC9',
              color: weight ? '#FBFAF4' : '#8B8170',
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
