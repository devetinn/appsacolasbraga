const MESES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ']

/**
 * Retorna label de quinzena: '1ª Q | MAI/2026' ou '2ª Q | MAI/2026'
 * Baseado em data_inicio: dias 5-19 → 1ª Q; dias 20+ → 2ª Q
 */
export function formatarLabelQuinzena(dataInicio: string): string {
  const [ano, mes, dia] = dataInicio.split('-').map(Number)
  const ordem = dia <= 19 ? '1ª' : '2ª'
  return `${ordem} Q | ${MESES[mes - 1]}/${ano}`
}

/**
 * Converte "YYYY-MM-DD" para "DD/MM/YYYY".
 * Aceita também Date objects.
 */
export function formatDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
  // "2025-01-15" → [2025, 01, 15]
  const parts = value.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return value
}
