'use client'

import { useQuinzenaAtiva } from '@/hooks/useQuinzenaAtiva'
import { useProducaoColaborador } from '@/hooks/useProducaoColaborador'
import { ListaHistorico } from '@/components/colaborador/ListaHistorico'


export default function Historico() {
  const { quinzena } = useQuinzenaAtiva()
  const { entries, loading } = useProducaoColaborador(quinzena?.id)

  const totalConfirmadas = entries
    .filter((e) => e.status === 'confirmado')
    .reduce((sum, e) => sum + e.quantidade, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Histórico da Quinzena</h2>
        <span className="text-sm text-gray-500">{entries.length} registros</span>
      </div>

      {totalConfirmadas > 0 && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <p className="text-xs text-blue-600">Unidades confirmadas</p>
          <p className="text-xl font-bold text-blue-700">{totalConfirmadas.toLocaleString('pt-BR')}</p>
        </div>
      )}

      <ListaHistorico entries={entries} loading={loading} />
    </div>
  )
}
