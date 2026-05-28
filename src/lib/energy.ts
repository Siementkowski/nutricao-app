const LS_KEY = 'nutricao_energy'

export interface EnergySettings {
  weight: number
  height: number
  age: number
  sex: 'male' | 'female'
  activity: number
  workout: number
}

export const ACTIVITY_OPTIONS = [
  { value: 1.2,   label: 'Sedentário', desc: 'Pouco ou nenhum exercício' },
  { value: 1.375, label: 'Leve',       desc: '1–3 dias/semana' },
  { value: 1.55,  label: 'Moderado',   desc: '3–5 dias/semana' },
  { value: 1.725, label: 'Intenso',    desc: '6–7 dias/semana' },
]

const DEFAULT: EnergySettings = {
  weight: 70, height: 170, age: 30,
  sex: 'male', activity: 1.375, workout: 0,
}

export function loadEnergy(): EnergySettings {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT
  } catch {
    return DEFAULT
  }
}

export function saveEnergy(s: EnergySettings): void {
  localStorage.setItem(LS_KEY, JSON.stringify(s))
}

export function calcTMB(s: EnergySettings): number {
  const base = 10 * s.weight + 6.25 * s.height - 5 * s.age
  return Math.round(s.sex === 'male' ? base + 5 : base - 161)
}

export function calcTDEE(s: EnergySettings): number {
  return Math.round(calcTMB(s) * s.activity + s.workout)
}
