export type EntryStatus = 'pendente' | 'confirmado' | 'divergente'

export interface EntryForValidation {
  id: string
  colaborador_id: string
  parceiro_id: string
  quantidade: number
  data_producao: string
  turno: string
  marca: string
  tamanho: string
}

export function validarCruzamento(
  entries: EntryForValidation[]
): Map<string, EntryStatus> {
  const statusMap = new Map<string, EntryStatus>()

  entries.forEach((entry) => {
    const par = entries.find(
      (e) =>
        e.colaborador_id === entry.parceiro_id &&
        e.parceiro_id === entry.colaborador_id &&
        e.data_producao === entry.data_producao &&
        e.turno === entry.turno &&
        e.marca.toLowerCase() === entry.marca.toLowerCase() &&
        e.tamanho.toLowerCase() === entry.tamanho.toLowerCase()
    )

    if (!par) {
      statusMap.set(entry.id, 'pendente')
    } else if (par.quantidade === entry.quantidade) {
      statusMap.set(entry.id, 'confirmado')
    } else {
      statusMap.set(entry.id, 'divergente')
    }
  })

  return statusMap
}
