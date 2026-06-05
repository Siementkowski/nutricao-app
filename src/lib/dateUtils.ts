/**
 * Retorna a data atual no fuso local do dispositivo em formato YYYY-MM-DD.
 * Usar em vez de new Date().toISOString().split('T')[0] que retorna UTC.
 */
export function localDateStr(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA') // en-CA → YYYY-MM-DD no fuso local
}
