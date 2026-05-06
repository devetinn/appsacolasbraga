export interface PayoutCalculo {
  colaborador_id: string
  total_unidades: number
  valor_unitario: number
  valor_total: number
}

export function calcularPayouts(
  entries: { colaborador_id: string; quantidade: number; status: string }[],
  rates: { funcao: string; valor_unitario: number }[],
  users: { id: string; funcao: string }[]
): PayoutCalculo[] {
  const confirmados = entries.filter((e) => e.status === 'confirmado')

  const totais = new Map<string, number>()
  confirmados.forEach((e) => {
    totais.set(e.colaborador_id, (totais.get(e.colaborador_id) ?? 0) + e.quantidade)
  })

  const payouts: PayoutCalculo[] = []
  totais.forEach((total_unidades, colaborador_id) => {
    const user = users.find((u) => u.id === colaborador_id)
    if (!user) return

    const rate = rates.find((r) => r.funcao === user.funcao)
    if (!rate) return

    payouts.push({
      colaborador_id,
      total_unidades,
      valor_unitario: rate.valor_unitario,
      valor_total: total_unidades * rate.valor_unitario,
    })
  })

  return payouts
}

export function formatarMoeda(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
