'use client'

import { useState } from 'react'
import { useQuinzenaAtiva } from '@/hooks/useQuinzenaAtiva'
import { useProducaoColaborador } from '@/hooks/useProducaoColaborador'
import { ListaHistorico } from '@/components/colaborador/ListaHistorico'
import { SeletorDataSemana } from '@/components/colaborador/SeletorDataSemana'

export default function Historico() {
  const { quinzena } = useQuinzenaAtiva()
  const { entries, loading } = useProducaoColaborador(quinzena?.id)
  const [dataSelecionada, setDataSelecionada] = useState<string | null>(null)

  const entriesFiltrados = dataSelecionada
    ? entries.filter((e) => e.data_producao === dataSelecionada)
    : entries

  const totalConfirmadas = entriesFiltrados
    .filter((e) => e.status === 'confirmado')
    .reduce((sum, e) => sum + e.quantidade, 0)

  return (
    <div className="space-y-5">

      <SeletorDataSemana dataSelecionada={dataSelecionada} onSelect={setDataSelecionada} />

      {totalConfirmadas > 0 && (
        <div className="rounded-3xl bg-brand-gold/8 border border-brand-gold/20 px-5 py-4">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-gold/70">
            Unidades confirmadas
            {dataSelecionada ? ' no dia' : ' na quinzena'}
          </p>
          <p className="font-display font-bold text-brand-gold text-3xl mt-1 leading-none">
            {totalConfirmadas.toLocaleString('pt-BR')}
          </p>
        </div>
      )}

      <ListaHistorico entries={entriesFiltrados} loading={loading} />
    </div>
  )
}
