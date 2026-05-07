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
