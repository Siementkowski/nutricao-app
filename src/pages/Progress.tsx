import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { PageHeader } from '../components/layout/PageHeader'
import { PageTransition } from '../components/layout/PageTransition'
import { LogWeightModal } from '../components/progress/LogWeightModal'
import { useProgress } from '../hooks/useProgress'
import { useUserStore } from '../store/userStore'

const STATUS_COLOR: Record<string, string> = {
  on: '#5A8A5C',
  near: '#A8C5A0',
  over: '#C47A5A',
  none: '#E8E4DC',
}

const STATUS_LABEL: Record<string, string> = {
  on: '±100 kcal',
  near: '±200 kcal',
  over: 'Acima',
  none: 'Sem dado',
}

function formatChartDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      <p className="text-xs mb-0.5" style={{ color: '#8C8880', fontWeight: 300 }}>{label}</p>
      <p className="text-sm" style={{ color: '#2C2C2C', fontWeight: 600 }}>{payload[0].value} kg</p>
    </div>
  )
}

export function Progress() {
  const { weightLogs, adherence, fetchWeightLogs, logWeight, fetchAdherence } = useProgress()
  const { goals } = useUserStore()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchWeightLogs(30)
    fetchAdherence(goals.kcal_goal, 60)
  }, [fetchWeightLogs, fetchAdherence, goals.kcal_goal])

  // Weight stats
  const weights = weightLogs.map(l => l.weight_kg)
  const latest = weights.at(-1)
  const min = weights.length ? Math.min(...weights) : null
  const max = weights.length ? Math.max(...weights) : null
  const last7 = weightLogs.slice(-7).map(l => l.weight_kg)
  const avg7 = last7.length ? +(last7.reduce((s, v) => s + v, 0) / last7.length).toFixed(1) : null

  const chartData = weightLogs.map(l => ({
    date: formatChartDate(l.date),
    peso: l.weight_kg,
  }))

  // Adherence stats
  const daysWithData = adherence.filter(d => d.status !== 'none')
  const daysOnTarget = adherence.filter(d => d.status === 'on').length
  const pctAdherence = daysWithData.length
    ? Math.round((daysOnTarget / daysWithData.length) * 100)
    : 0

  // Streak: consecutive days from today going back with status on/near
  let streak = 0
  for (let i = adherence.length - 1; i >= 0; i--) {
    if (adherence[i].status === 'on' || adherence[i].status === 'near') streak++
    else break
  }

  return (
    <>
      <PageTransition>
      <div>
        <PageHeader
          title="Progresso"
          subtitle="Evolução ao longo do tempo"
          action={
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
              style={{ backgroundColor: '#EEF3EE', color: '#7C9A7E', fontWeight: 500 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Peso
            </button>
          }
        />

        <div className="px-5 space-y-4 pb-28">

          {/* ── Peso ── */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
          >
            <p className="text-xs uppercase tracking-wider mb-4" style={{ color: '#8C8880', fontWeight: 300 }}>
              Peso corporal — últimos 30 dias
            </p>

            {weightLogs.length < 2 ? (
              <div
                className="rounded-xl p-6 flex flex-col items-center"
                style={{ backgroundColor: '#F7F5F0' }}
              >
                <p className="text-xs text-center" style={{ color: '#8C8880', fontWeight: 300 }}>
                  {weightLogs.length === 0
                    ? 'Nenhum peso registrado. Toque em "+ Peso" para começar.'
                    : 'Registre mais 1 peso para ver o gráfico.'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#8C8880' }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#8C8880' }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#7C9A7E"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#7C9A7E', strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}

            {/* Stats row */}
            {weights.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { label: 'Atual', value: latest != null ? `${latest}kg` : '—' },
                  { label: 'Mínimo', value: min != null ? `${min}kg` : '—' },
                  { label: 'Máximo', value: max != null ? `${max}kg` : '—' },
                  { label: 'Média 7d', value: avg7 != null ? `${avg7}kg` : '—' },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-xl p-2.5 text-center"
                    style={{ backgroundColor: '#F7F5F0' }}
                  >
                    <p className="text-xs mb-1" style={{ color: '#8C8880', fontWeight: 300 }}>{label}</p>
                    <p className="text-sm" style={{ color: '#2C2C2C', fontWeight: 600 }}>{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Aderência ── */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8E4DC' }}
          >
            <p className="text-xs uppercase tracking-wider mb-4" style={{ color: '#8C8880', fontWeight: 300 }}>
              Aderência alimentar — 60 dias
            </p>

            {/* Heatmap 10×6 */}
            <div
              className="grid gap-1.5 mb-3"
              style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}
            >
              {adherence.map((day, index) => (
                <div
                  key={day.date}
                  className="aspect-square rounded-md"
                  style={{
                    backgroundColor: STATUS_COLOR[day.status],
                    animation: 'fadeIn 0.3s ease both',
                    animationDelay: `${index * 10}ms`,
                  }}
                  title={`${day.date}: ${day.status === 'none' ? 'sem registro' : `${Math.round(day.kcal)} kcal`}`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.entries(STATUS_LABEL).map(([key, label]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: STATUS_COLOR[key] }}
                  />
                  <span className="text-xs" style={{ color: '#8C8880', fontWeight: 300 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Na meta', value: daysOnTarget, unit: 'dias' },
                { label: 'Aderência', value: `${pctAdherence}`, unit: '%' },
                { label: 'Sequência', value: streak, unit: 'dias' },
              ].map(({ label, value, unit }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ backgroundColor: '#EEF3EE' }}
                >
                  <p className="text-xs mb-1" style={{ color: '#8C8880', fontWeight: 300 }}>{label}</p>
                  <p className="text-lg" style={{ color: '#5A8A5C', fontWeight: 600 }}>
                    {value}
                    <span className="text-xs ml-0.5" style={{ fontWeight: 300, color: '#8C8880' }}>{unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      </PageTransition>

      <LogWeightModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={async (w, fat, notes) => {
          await logWeight(w, fat, notes)
          await fetchWeightLogs(30)
        }}
      />
    </>
  )
}
