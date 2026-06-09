'use client'

import { useState } from 'react'
import { FileText, Paperclip, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import type { Payout } from '@/types'
import { formatarMoeda } from '@/lib/calculos'
import { CadernoVirtualModal } from './CadernoVirtualModal'

type PayoutComNome = Payout & { nome_colaborador: string; pix_key?: string | null }
type Filtro = 'todos' | 'pendente' | 'pago'

interface TabelaPagamentosProps {
  payouts: PayoutComNome[]
}

export function TabelaPagamentos({ payouts: initialPayouts }: TabelaPagamentosProps) {
  const [payouts, setPayouts] = useState(initialPayouts)
  const [payoutSelecionadoId, setPayoutSelecionadoId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const pendentes = payouts.filter((p) => p.status !== 'pago')
  const pagos = payouts.filter((p) => p.status === 'pago')
  const totalGeral = payouts.reduce((sum, p) => sum + p.valor_total, 0)
  const totalPago = pagos.reduce((sum, p) => sum + p.valor_total, 0)
  const totalPendente = pendentes.reduce((sum, p) => sum + p.valor_total, 0)

  // Pendentes sempre primeiro no modo "todos"
  const payoutsFiltrados =
    filtro === 'pendente' ? pendentes :
    filtro === 'pago' ? pagos :
    [...pendentes, ...pagos]

  const payoutSelecionado = payouts.find((p) => p.id === payoutSelecionadoId)

  function handlePago(payoutId: string) {
    setPayouts((prev) =>
      prev.map((p) => p.id === payoutId ? { ...p, status: 'pago' as const, pago_em: new Date().toISOString() } : p)
    )
  }

  function handleComprovanteUpload(payoutId: string, path: string) {
    setPayouts((prev) =>
      prev.map((p) => p.id === payoutId ? { ...p, comprovante_url: path } : p)
    )
  }

  const tabs: { key: Filtro; label: string; count: number; color: string }[] = [
    { key: 'todos', label: 'Todos', count: payouts.length, color: 'text-gray-600' },
    { key: 'pendente', label: 'Pendentes', count: pendentes.length, color: 'text-amber-600' },
    { key: 'pago', label: 'Pagos', count: pagos.length, color: 'text-green-600' },
  ]

  return (
    <>
      {payoutSelecionadoId && payoutSelecionado && (
        <CadernoVirtualModal
          payoutId={payoutSelecionadoId}
          nomeColaborador={payoutSelecionado.nome_colaborador}
          onClose={() => setPayoutSelecionadoId(null)}
          onPago={handlePago}
          onComprovanteUpload={handleComprovanteUpload}
        />
      )}

      {/* Tabs + totais */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-black/[0.07] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFiltro(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-sans font-semibold transition-all ${
                filtro === tab.key
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-black/[0.04]'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                filtro === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-black/[0.06] text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Totais rápidos */}
        <div className="flex items-center gap-3 text-xs font-sans">
          {pendentes.length > 0 && (
            <div className="flex items-center gap-1.5 text-amber-600">
              <Clock size={11} />
              <span className="font-semibold">{formatarMoeda(totalPendente)}</span>
              <span className="text-amber-400">a pagar</span>
            </div>
          )}
          {pagos.length > 0 && (
            <div className="flex items-center gap-1.5 text-green-600">
              <CheckCircle2 size={11} />
              <span className="font-semibold">{formatarMoeda(totalPago)}</span>
              <span className="text-green-400">pago</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl border border-black/[0.06] bg-white">
        {payoutsFiltrados.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-sans text-gray-400">
              {filtro === 'pendente' ? 'Nenhum pagamento pendente.' :
               filtro === 'pago' ? 'Nenhum pagamento realizado ainda.' :
               'Nenhum pagamento gerado.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.05] bg-brand-cream/50 text-left">
                <th className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-400">Colaborador</th>
                <th className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-400 text-right">Unidades</th>
                <th className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-400 text-right">Valor</th>
                <th className="px-4 py-3 text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {payoutsFiltrados.map((payout, idx) => {
                const isPago = payout.status === 'pago'
                // Separador visual entre pendentes e pagos no modo "todos"
                const isPrimeiroPago =
                  filtro === 'todos' && isPago && idx > 0 && payoutsFiltrados[idx - 1].status !== 'pago'

                return (
                  <>
                    {isPrimeiroPago && (
                      <tr key={`sep-${payout.id}`}>
                        <td colSpan={5} className="px-4 pt-3 pb-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={11} className="text-green-500" />
                            <span className="text-[10px] font-sans font-semibold uppercase tracking-widest text-green-500">
                              Pagos
                            </span>
                            <div className="flex-1 border-t border-green-100" />
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr
                      key={payout.id}
                      className={`border-b border-black/[0.04] last:border-0 transition-colors ${
                        isPago ? 'bg-green-50/40 hover:bg-green-50/70' : 'hover:bg-brand-cream/40'
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setPayoutSelecionadoId(payout.id)}
                          className={`font-semibold text-left transition-colors hover:underline ${
                            isPago ? 'text-gray-500 hover:text-gray-700' : 'text-gray-800 hover:text-brand-blue'
                          }`}
                        >
                          {payout.nome_colaborador}
                        </button>
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-sans ${isPago ? 'text-gray-400' : 'text-gray-700'}`}>
                        {payout.total_unidades.toLocaleString('pt-BR')}
                      </td>
                      <td className={`px-4 py-3 text-right tabular-nums font-semibold ${isPago ? 'text-gray-400' : 'text-gray-800'}`}>
                        {formatarMoeda(payout.valor_total)}
                      </td>
                      <td className="px-4 py-3">
                        {isPago ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold bg-green-100 text-green-700 border border-green-200/60">
                            <CheckCircle2 size={9} />
                            Pago
                          </span>
                        ) : (
                          <button
                            onClick={() => setPayoutSelecionadoId(payout.id)}
                            className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 active:scale-[0.97] transition-all shadow-sm shadow-green-600/20"
                          >
                            Marcar Pago
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isPago && (
                          <div className="flex items-center justify-end gap-2">
                            {payout.comprovante_url ? (
                              <span title="Comprovante anexado" className="text-green-500">
                                <Paperclip size={12} />
                              </span>
                            ) : (
                              <span title="Sem comprovante" className="text-gray-200">
                                <Paperclip size={12} />
                              </span>
                            )}
                            <Link
                              href={`/admin/recibo/${payout.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-xs font-sans text-gray-400 hover:text-brand-blue transition-colors"
                            >
                              <FileText size={12} />
                              Recibo
                            </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  </>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-black/[0.06] bg-brand-cream/60">
                <td colSpan={2} className="px-4 py-3 text-xs font-sans font-semibold text-gray-500 uppercase tracking-widest">
                  Total geral
                </td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {formatarMoeda(totalGeral)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </>
  )
}
