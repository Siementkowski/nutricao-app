import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { downloadCsv } from '../../lib/exportCsv'

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Cafe da manha',
  lunch: 'Almoco',
  dinner: 'Jantar',
  snack: 'Lanche',
}

const TYPE_LABELS: Record<string, string> = {
  strength: 'Musculacao',
  cardio: 'Cardio',
}

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

function todayStr() {
  return new Date().toLocaleDateString('en-CA')
}
function daysAgoStr(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en-CA')
}

export function ExportModal({ open, onClose }: ExportModalProps) {
  const [from, setFrom] = useState(daysAgoStr(30))
  const [to, setTo]     = useState(todayStr())
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<string | null>(null)

  async function handleExport() {
    setLoading(true)
    setResult(null)

    const [foodRes, exerciseRes, weightRes, waterRes] = await Promise.all([
      supabase.from('food_log').select('*').gte('date', from).lte('date', to).order('date').order('created_at'),
      supabase.from('exercise_log').select('*').gte('date', from).lte('date', to).order('date').order('created_at'),
      supabase.from('weight_log').select('*').gte('date', from).lte('date', to).order('date'),
      supabase.from('water_log').select('*').gte('date', from).lte('date', to).order('date'),
    ])

    const prefix = `nutricao_${from}_${to}`

    // Monta tabela unificada — todas as linhas com mesmas colunas
    type UnifiedRow = {
      Data: string; Categoria: string; Detalhe: string; Nome: string
      Quantidade_g: string; Duracao_min: string; Kcal: string
      Proteina_g: string; Carboidrato_g: string; Gordura_g: string
      Kcal_queimadas: string; Peso_kg: string; Gordura_corporal_pct: string
      Agua_ml: string; Notas: string
    }
    const empty = (): UnifiedRow => ({
      Data: '', Categoria: '', Detalhe: '', Nome: '',
      Quantidade_g: '', Duracao_min: '', Kcal: '',
      Proteina_g: '', Carboidrato_g: '', Gordura_g: '',
      Kcal_queimadas: '', Peso_kg: '', Gordura_corporal_pct: '',
      Agua_ml: '', Notas: '',
    })

    const rows: UnifiedRow[] = []

    for (const r of foodRes.data ?? []) {
      rows.push({ ...empty(), Data: r.date, Categoria: 'Diario', Detalhe: MEAL_LABELS[r.meal_type] ?? r.meal_type,
        Nome: r.food_name, Quantidade_g: String(r.quantity_g), Kcal: String(r.kcal),
        Proteina_g: String(r.protein), Carboidrato_g: String(r.carbs), Gordura_g: String(r.fat) })
    }
    for (const r of exerciseRes.data ?? []) {
      rows.push({ ...empty(), Data: r.date, Categoria: 'Exercicio', Detalhe: TYPE_LABELS[r.type] ?? r.type,
        Nome: r.exercise_name ?? '', Duracao_min: String(r.duration_min),
        Kcal_queimadas: String(r.kcal_burned) })
    }
    for (const r of weightRes.data ?? []) {
      rows.push({ ...empty(), Data: r.date, Categoria: 'Peso',
        Peso_kg: String(r.weight_kg), Gordura_corporal_pct: r.body_fat_pct != null ? String(r.body_fat_pct) : '',
        Notas: r.notes ?? '' })
    }
    for (const r of waterRes.data ?? []) {
      rows.push({ ...empty(), Data: r.date, Categoria: 'Agua', Agua_ml: String(r.amount_ml) })
    }

    // Ordena por data
    rows.sort((a, b) => a.Data.localeCompare(b.Data))

    setLoading(false)
    if (rows.length === 0) {
      setResult('Nenhum dado encontrado no período.')
      return
    }

    downloadCsv(`${prefix}.csv`, rows, [
      { key: 'Data',                  label: 'Data'                },
      { key: 'Categoria',             label: 'Categoria'           },
      { key: 'Detalhe',               label: 'Detalhe'             },
      { key: 'Nome',                  label: 'Nome'                },
      { key: 'Quantidade_g',          label: 'Quantidade (g)'      },
      { key: 'Duracao_min',           label: 'Duracao (min)'       },
      { key: 'Kcal',                  label: 'Kcal'                },
      { key: 'Proteina_g',            label: 'Proteina (g)'        },
      { key: 'Carboidrato_g',         label: 'Carboidrato (g)'     },
      { key: 'Gordura_g',             label: 'Gordura (g)'         },
      { key: 'Kcal_queimadas',        label: 'Kcal Queimadas'      },
      { key: 'Peso_kg',               label: 'Peso (kg)'           },
      { key: 'Gordura_corporal_pct',  label: 'Gordura Corporal (%)'},
      { key: 'Agua_ml',               label: 'Agua (ml)'           },
      { key: 'Notas',                 label: 'Notas'               },
    ])

    setResult(`${rows.length} registros exportados.`)
    setTimeout(() => { setResult(null); onClose() }, 2000)
  }

  if (!open) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        onClick={onClose}
      />

      <div
        className="fixed left-0 right-0 bottom-0 z-50 rounded-t-3xl"
        style={{ backgroundColor: '#FFFFFF', animation: 'slideUp 0.25s ease' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#EBEBEB' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-4 pt-2">
          <div>
            <h2 className="text-base" style={{ color: '#111111', fontWeight: 600 }}>
              Exportar histórico
            </h2>
            <p className="text-xs mt-0.5" style={{ color: '#999999', fontWeight: 300 }}>
              Diário · Exercícios · Peso · Água — 1 arquivo CSV
            </p>
          </div>
          <button onClick={onClose} style={{ color: '#999999' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Date pickers */}
        <div className="px-5 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* De */}
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#999999', fontWeight: 300 }}>
                De
              </label>
              <div
                className="rounded-xl px-3 py-2.5"
                style={{ backgroundColor: '#F5F5F5', border: '1px solid #EBEBEB' }}
              >
                <input
                  type="date"
                  value={from}
                  max={to}
                  onChange={e => setFrom(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: '#111111', fontWeight: 500 }}
                />
              </div>
            </div>

            {/* Até */}
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: '#999999', fontWeight: 300 }}>
                Até
              </label>
              <div
                className="rounded-xl px-3 py-2.5"
                style={{ backgroundColor: '#F5F5F5', border: '1px solid #EBEBEB' }}
              >
                <input
                  type="date"
                  value={to}
                  min={from}
                  max={todayStr()}
                  onChange={e => setTo(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: '#111111', fontWeight: 500 }}
                />
              </div>
            </div>
          </div>

          {/* Atalhos de período */}
          <div className="flex gap-2">
            {[
              { label: '7 dias',  days: 7  },
              { label: '30 dias', days: 30 },
              { label: '90 dias', days: 90 },
            ].map(({ label, days }) => (
              <button
                key={days}
                onClick={() => { setFrom(daysAgoStr(days)); setTo(todayStr()) }}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  backgroundColor: from === daysAgoStr(days) && to === todayStr() ? '#2D7D46' : '#F5F5F5',
                  color:           from === daysAgoStr(days) && to === todayStr() ? '#FFFFFF' : '#555555',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {result && (
            <div
              className="rounded-xl px-4 py-3 text-sm text-center"
              style={{
                backgroundColor: result.includes('sucesso') ? '#E8F5ED' : '#FFF3E0',
                color: result.includes('sucesso') ? '#2D7D46' : '#D4890A',
                fontWeight: 500,
              }}
            >
              {result}
            </div>
          )}

          {/* Botão */}
          <button
            onClick={handleExport}
            disabled={loading || !from || !to}
            className="w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
            style={{
              backgroundColor: loading ? '#F5F5F5' : '#2D7D46',
              color: loading ? '#999999' : '#FFFFFF',
              fontWeight: 700,
              transition: 'all 0.15s',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Baixando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Baixar CSVs
              </>
            )}
          </button>

          <p className="text-center text-xs pb-2" style={{ color: '#CCCCCC', fontWeight: 300 }}>
            Abre no Excel ou Google Sheets
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
