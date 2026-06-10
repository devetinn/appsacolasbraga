'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Copy, Check, FileText, ExternalLink } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { formatarMoeda } from '@/lib/calculos'
import { UploadComprovante } from './UploadComprovante'
import type { ProductionEntry } from '@/types'

interface EntryComParceiro extends ProductionEntry {
  nome_parceiro?: string | null
}

interface CadernoData {
  payout: {
    id: string
    total_unidades: number
    valor_unitario: number
    valor_total: number
    status: 'pendente' | 'pago'
    pago_em?: string | null
    comprovante_url?: string | null
    numero_recibo?: number
  }
  colaborador: { nome: string; funcao: string; pix_key?: string | null }
  quinzena: { data_inicio: string; data_fim: string }
  entries: EntryComParceiro[]
}

const STATUS_PILL: Record<string, string> = {
  pendente: 'bg-amber-50 text-amber-700',
  confirmado: 'bg-green-50 text-green-700',
  divergente: 'bg-red-50 text-red-600',
}
const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pend.', confirmado: 'Conf.', divergente: 'Div.',
}
const TURNO_LABEL: Record<string, string> = { unico: '—', manha: 'M', tarde: 'T' }

interface Props {
  payoutId: string
  nomeColaborador: string
  onClose: () => void
  onPago: (payoutId: string) => void
  onComprovanteUpload?: (payoutId: string, path: string) => void
}

export function CadernoVirtualModal({ payoutId, nomeColaborador, onClose, onPago, onComprovanteUpload }: Props) {
  const [data, setData] = useState<CadernoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [marcando, setMarcando] = useState(false)
  const [pixCopiado, setPixCopiado] = useState(false)
  const [erro, setErro] = useState('')

  const buscarCaderno = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/pagamentos/caderno?payoutId=${payoutId}`)
    if (res.ok) {
      setData(await res.json())
    }
    setLoading(false)
  }, [payoutId])

  useEffect(() => {
    buscarCaderno()
  }, [buscarCaderno])

  async function handleMarcarPago() {
    setMarcando(true)
    setErro('')
    const res = await fetch('/api/pagamentos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: payoutId }),
    })
    if (res.ok) {
      onPago(payoutId)
      await buscarCaderno()
    } else {
      setErro('Erro ao marcar pagamento. Tente novamente.')
    }
    setMarcando(false)
  }

  function copiarPix(pix: string) {
    navigator.clipboard.writeText(pix).then(() => {
      setPixCopiado(true)
      setTimeout(() => setPixCopiado(false), 2000)
    })
  }

  const payout = data?.payout
  const colaborador = data?.colaborador
  const quinzena = data?.quinzena

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl max-h-[92dvh] bg-white rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-black/[0.06]">
          <div>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-gray-400">
              Caderno Virtual
            </p>
            <h2 className="text-lg font-semibold text-gray-900">{nomeColaborador}</h2>
            {quinzena && (
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(quinzena.data_inicio)} – {formatDate(quinzena.data_fim)}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-2xl bg-black/[0.05] text-gray-500 hover:bg-black/10 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : data ? (
            <>
              {/* Tabela de lançamentos */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  Lançamentos
                </p>
                <div className="bg-gray-50 rounded-2xl border border-black/[0.05] overflow-hidden">
                  <div className="grid grid-cols-[52px_16px_1fr_44px_24px_44px_28px] gap-x-2 px-3 py-2 border-b border-black/[0.06]">
                    {['Data', 'T', 'Marca', 'Parce.', 'Cor', 'Qtd', 'St.'].map((h) => (
                      <span key={h} className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                        {h}
                      </span>
                    ))}
                  </div>
                  <ul className="divide-y divide-black/[0.04]">
                    {data.entries.length === 0 ? (
                      <li className="px-3 py-4 text-center text-xs text-gray-400">
                        Nenhum lançamento encontrado
                      </li>
                    ) : data.entries.map((e) => {
                      const isDivergente = e.status === 'divergente'
                      return (
                        <li
                          key={e.id}
                          className={`grid grid-cols-[52px_16px_1fr_44px_24px_44px_28px] gap-x-2 px-3 py-2.5 items-center ${isDivergente ? 'opacity-40' : ''}`}
                        >
                          <span className="text-[10px] text-gray-500 tabular-nums">
                            {formatDate(e.data_producao).slice(0, 5)}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400 text-center">
                            {TURNO_LABEL[e.turno] ?? '—'}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold text-gray-800 truncate ${isDivergente ? 'line-through' : ''}`}>{e.marca}</p>
                            <p className="text-[10px] text-gray-400 truncate">{e.tamanho}</p>
                          </div>
                          <span className="text-[10px] text-gray-500 truncate">
                            {e.nome_parceiro ?? '—'}
                          </span>
                          <span className="text-[10px] text-gray-500 tabular-nums">{e.cores}</span>
                          <span className={`text-xs font-bold tabular-nums ${isDivergente ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                            {e.quantidade.toLocaleString('pt-BR')}
                          </span>
                          <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-full ${STATUS_PILL[e.status]}`}>
                            {STATUS_LABEL[e.status]}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
                {/* Aviso de divergentes não contabilizados */}
                {data.entries.some((e) => e.status === 'divergente') && (
                  <p className="text-[10px] text-red-500 mt-1.5 px-1">
                    ⚠ {data.entries.filter((e) => e.status === 'divergente').length} lançamento(s) divergente(s) não foram contabilizados no pagamento.
                  </p>
                )}
              </div>

              {/* Resumo do cálculo */}
              <div className="rounded-2xl border border-black/[0.06] bg-white p-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  Resumo do Cálculo
                </p>
                <div className="space-y-1.5 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Total de unidades</span>
                    <span className="font-semibold tabular-nums">
                      {payout!.total_unidades.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Valor por milheiro</span>
                    <span className="font-semibold tabular-nums">
                      {payout!.valor_unitario > 0 ? formatarMoeda(payout!.valor_unitario) : 'Variável'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-black/[0.06]">
                    <span className="font-semibold text-gray-900">Total a pagar</span>
                    <span className="font-bold text-green-700 text-base tabular-nums">
                      {formatarMoeda(payout!.valor_total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chave PIX */}
              {colaborador?.pix_key && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-1.5">
                    Chave PIX
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-sm font-semibold text-blue-900 font-mono break-all">
                      {colaborador.pix_key}
                    </span>
                    <button
                      onClick={() => copiarPix(colaborador.pix_key!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-all shrink-0"
                    >
                      {pixCopiado ? <Check size={12} /> : <Copy size={12} />}
                      {pixCopiado ? 'Copiado!' : 'Copiar'}
                    </button>
                  </div>
                </div>
              )}
              {!colaborador?.pix_key && (
                <p className="text-xs text-gray-400 text-center py-1">
                  Chave PIX não cadastrada para este colaborador.
                </p>
              )}

              {/* Status de pagamento */}
              {payout?.status === 'pago' && (
                <div className="rounded-2xl border border-green-100 bg-green-50 p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-600" />
                    <p className="text-sm font-semibold text-green-800">
                      Pago em {payout.pago_em ? formatDate(payout.pago_em.split('T')[0]) : '—'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`/admin/recibo/${payoutId}`}
                      target="_blank"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-green-200 text-xs font-semibold text-green-700 hover:bg-green-50 transition-all"
                    >
                      <FileText size={12} />
                      Gerar Recibo
                    </a>
                    <UploadComprovante
                      payoutId={payoutId}
                      comprovanteUrl={payout.comprovante_url ?? null}
                      onUpload={(path) => {
                        buscarCaderno()
                        onComprovanteUpload?.(payoutId, path)
                      }}
                    />
                    {payout.comprovante_url && (
                      <a
                        href={`/api/pagamentos/comprovante/view?path=${encodeURIComponent(payout.comprovante_url)}`}
                        target="_blank"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                      >
                        <ExternalLink size={12} />
                        Ver Comprovante
                      </a>
                    )}
                  </div>
                </div>
              )}

              {erro && (
                <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-2 border border-red-100">
                  {erro}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">Erro ao carregar dados.</p>
          )}
        </div>

        {/* Footer */}
        {payout?.status === 'pendente' && !loading && (
          <div className="px-4 pb-6 pt-3 border-t border-black/[0.06]">
            <button
              onClick={handleMarcarPago}
              disabled={marcando}
              className="w-full bg-green-600 text-white font-semibold rounded-2xl py-3.5 text-sm hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {marcando ? 'Registrando...' : `Marcar como Pago · ${payout ? formatarMoeda(payout.valor_total) : ''}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
