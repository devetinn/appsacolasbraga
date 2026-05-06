'use client'

import type { ProductionEntry } from '@/types'

interface TabelaLancamentosProps {
  entries: ProductionEntry[]
  loading?: boolean
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
  confirmado: { label: 'Confirmado', className: 'bg-green-100 text-green-800' },
  divergente: { label: 'Divergente', className: 'bg-red-100 text-red-800' },
}

export function TabelaLancamentos({ entries, loading }: TabelaLancamentosProps) {
  if (loading) return <p className="text-gray-500 text-sm">Carregando lançamentos...</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Marca</th>
            <th className="px-4 py-3">Tamanho</th>
            <th className="px-4 py-3 text-right">Qtd</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const status = STATUS_LABELS[entry.status] ?? STATUS_LABELS.pendente
            return (
              <tr key={entry.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3">{entry.data_producao}</td>
                <td className="px-4 py-3">{entry.marca}</td>
                <td className="px-4 py-3">{entry.tamanho}</td>
                <td className="px-4 py-3 text-right font-medium">{entry.quantidade.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </td>
              </tr>
            )
          })}
          {entries.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                Nenhum lançamento encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
