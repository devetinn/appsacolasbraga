'use client'

import { useState, useMemo } from 'react'
import { useQuinzenasFechadas } from '@/hooks/useQuinzenasFechadas'
import { CardQuinzenaFechada } from '@/components/colaborador/CardQuinzenaFechada'
import { DetalheQuinzena } from '@/components/colaborador/DetalheQuinzena'
import type { QuinzenaFechada } from '@/hooks/useQuinzenasFechadas'

const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

type Ordenacao = 'recente' | 'maior_valor'

export default function Historico() {
  const { quinzenas, loading } = useQuinzenasFechadas()
  const [detalhe, setDetalhe] = useState<QuinzenaFechada | null>(null)
  const [filtroMes, setFiltroMes] = useState<number | null>(null)
  const [filtroAno, setFiltroAno] = useState<number | null>(null)
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('recente')

  const anos = useMemo(() => {
    const set = new Set(quinzenas.map((q) => new Date(q.data_inicio).getFullYear()))
    return Array.from(set).sort((a, b) => b - a)
  }, [quinzenas])

  const filtradas = useMemo(() => {
    let lista = [...quinzenas]

    if (filtroMes !== null) {
      lista = lista.filter((q) => new Date(q.data_inicio).getMonth() === filtroMes)
    }
    if (filtroAno !== null) {
      lista = lista.filter((q) => new Date(q.data_inicio).getFullYear() === filtroAno)
    }

    if (ordenacao === 'maior_valor') {
      lista.sort((a, b) => (b.payout?.valor_total ?? 0) - (a.payout?.valor_total ?? 0))
    } else {
      lista.sort((a, b) => new Date(b.data_inicio).getTime() - new Date(a.data_inicio).getTime())
    }

    return lista
  }, [quinzenas, filtroMes, filtroAno, ordenacao])

  return (
    <>
      {detalhe && (
        <DetalheQuinzena quinzena={detalhe} onClose={() => setDetalhe(null)} />
      )}

      <div className="space-y-4">
        {/* Filtros */}
        <div className="space-y-2">
          {/* Linha 1: mês */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => setFiltroMes(null)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-sans font-semibold transition-all ${
                filtroMes === null
                  ? 'bg-brand-blue text-white'
                  : 'bg-white border border-black/[0.08] text-brand-dark/50'
              }`}
            >
              Todos
            </button>
            {MESES.map((m, i) => (
              <button
                key={m}
                onClick={() => setFiltroMes(filtroMes === i ? null : i)}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-sans font-semibold transition-all ${
                  filtroMes === i
                    ? 'bg-brand-blue text-white'
                    : 'bg-white border border-black/[0.08] text-brand-dark/50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Linha 2: ano + ordenação */}
          <div className="flex items-center gap-2">
            {/* Anos */}
            <div className="flex gap-1.5 flex-1 overflow-x-auto scrollbar-none">
              {anos.map((a) => (
                <button
                  key={a}
                  onClick={() => setFiltroAno(filtroAno === a ? null : a)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-sans font-semibold transition-all ${
                    filtroAno === a
                      ? 'bg-brand-dark text-white'
                      : 'bg-white border border-black/[0.08] text-brand-dark/50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            {/* Ordenação */}
            <button
              onClick={() => setOrdenacao((o) => o === 'recente' ? 'maior_valor' : 'recente')}
              className="shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-sans font-semibold bg-white border border-black/[0.08] text-brand-dark/50 transition-all hover:border-brand-dark/20"
            >
              {ordenacao === 'recente' ? '↓ Recente' : '↓ Maior valor'}
            </button>
          </div>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-3xl bg-black/[0.04] animate-pulse" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-sm font-sans font-medium text-brand-dark/40">
              Nenhuma quinzena encontrada
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtradas.map((q) => (
              <li key={q.id}>
                <CardQuinzenaFechada quinzena={q} onClick={() => setDetalhe(q)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}
