type Row = Record<string, unknown>
interface Column { key: string; label: string }

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export function downloadCsv(filename: string, rows: Row[], columns: Column[]) {
  const sep = ';'
  const header = columns.map(c => c.label).join(sep)
  const body = rows
    .map(row => columns.map(c => escapeCsv(row[c.key])).join(sep))
    .join('\n')
  // sep= instrui o Excel BR a usar ; como delimitador
  const csv = `sep=${sep}\n` + header + '\n' + body
  // BOM para Excel abrir com acentos corretamente
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
