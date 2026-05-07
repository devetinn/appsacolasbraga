'use client'

import { formatarMoeda } from '@/lib/calculos'

type PayoutRow = {
  nome_colaborador: string
  total_unidades: number
  valor_total: number
  status: string
}

interface BotaoExportarCSVProps {
  payouts: PayoutRow[]
  quinzenaLabel?: string
}

export function BotaoExportarCSV({ payouts, quinzenaLabel }: BotaoExportarCSVProps) {
  function exportar() {
    const cabecalho = ['Colaborador', 'Unidades', 'Valor', 'Status']
    const linhas = payouts.map((p) => [
      p.nome_colaborador,
      p.total_unidades.toString(),
      formatarMoeda(p.valor_total),
      p.status === 'pago' ? 'Pago' : 'Pendente',
    ])
    const csv = [cabecalho, ...linhas]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pagamentos${quinzenaLabel ? `-${quinzenaLabel}` : ''}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (payouts.length === 0) return null

  return (
    <button
      onClick={exportar}
      className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
    >
      ↓ Exportar CSV
    </button>
  )
}
