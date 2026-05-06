'use client'

import type { ProductionEntry } from '@/types'

interface ListaHistoricoProps {
  entries: ProductionEntry[]
  loading?: boolean
}

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  confirmado: { label: 'Confirmado', className: 'bg-green-100 text-green-700' },
  divergente: { label: 'Divergente', className: 'bg-red-100 text-red-700' },
}

export function ListaHistorico({ entries, loading }: ListaHistoricoProps) {
  if (loading) return <p className="text-gray-500 text-sm text-center py-4">Carregando...</p>

  if (entries.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">Nenhum lançamento nesta quinzena.</p>
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => {
        const status = STATUS_CONFIG[entry.status]
        return (
          <li key={entry.id} className="rounded-lg border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{entry.data_producao}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {entry.marca} · {entry.tamanho} · {entry.cores} cor{entry.cores > 1 ? 'es' : ''}
            </p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {entry.quantidade.toLocaleString('pt-BR')} unidades
            </p>
          </li>
        )
      })}
    </ul>
  )
}
