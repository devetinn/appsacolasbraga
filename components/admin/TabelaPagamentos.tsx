'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import type { Payout } from '@/types'
import { formatarMoeda } from '@/lib/calculos'
import { CadernoVirtualModal } from './CadernoVirtualModal'

type PayoutComNome = Payout & { nome_colaborador: string; pix_key?: string | null }

interface TabelaPagamentosProps {
  payouts: PayoutComNome[]
}

export function TabelaPagamentos({ payouts: initialPayouts }: TabelaPagamentosProps) {
  const [payouts, setPayouts] = useState(initialPayouts)
  const [payoutSelecionadoId, setPayoutSelecionadoId] = useState<string | null>(null)

  const totalGeral = payouts.reduce((sum, p) => sum + p.valor_total, 0)
  const payoutSelecionado = payouts.find((p) => p.id === payoutSelecionadoId)

  function handlePago(payoutId: string) {
    setPayouts((prev) =>
      prev.map((p) => p.id === payoutId ? { ...p, status: 'pago' as const, pago_em: new Date().toISOString() } : p)
    )
  }

  return (
    <>
      {payoutSelecionadoId && payoutSelecionado && (
        <CadernoVirtualModal
          payoutId={payoutSelecionadoId}
          nomeColaborador={payoutSelecionado.nome_colaborador}
          onClose={() => setPayoutSelecionadoId(null)}
          onPago={handlePago}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3">Colaborador</th>
              <th className="px-4 py-3 text-right">Unidades</th>
              <th className="px-4 py-3 text-right">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => (
              <tr key={payout.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <button
                    onClick={() => setPayoutSelecionadoId(payout.id)}
                    className="font-medium text-gray-800 hover:text-blue-600 hover:underline text-left transition-colors"
                  >
                    {payout.nome_colaborador}
                  </button>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {payout.total_unidades.toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-right font-medium tabular-nums">
                  {formatarMoeda(payout.valor_total)}
                </td>
                <td className="px-4 py-3">
                  {payout.status === 'pago' ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Pago
                    </span>
                  ) : (
                    <button
                      onClick={() => setPayoutSelecionadoId(payout.id)}
                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors"
                    >
                      Marcar Pago
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {payout.status === 'pago' && (
                    <Link
                      href={`/admin/recibo/${payout.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <FileText size={12} />
                      Recibo
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {payouts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Nenhum pagamento gerado
                </td>
              </tr>
            )}
          </tbody>
          {payouts.length > 0 && (
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-600">Total</td>
                <td className="px-4 py-3 text-right font-bold text-gray-900 tabular-nums">
                  {formatarMoeda(totalGeral)}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </>
  )
}
