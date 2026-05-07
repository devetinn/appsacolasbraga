'use client'

import { useState } from 'react'
import type { EntryComParceiro } from '@/hooks/useProducaoColaborador'
import { formatDate } from '@/lib/format'
import { ModalConfirmacao } from '@/components/ui/ModalConfirmacao'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { Trash2 } from 'lucide-react'

interface ListaHistoricoProps {
  entries: EntryComParceiro[]
  loading?: boolean
}

const STATUS_CONFIG = {
  pendente:   { label: 'Pendente',   className: 'bg-amber-50 text-amber-700 border border-amber-200/60' },
  confirmado: { label: 'Confirmado', className: 'bg-green-50 text-green-700 border border-green-200/60' },
  divergente: { label: 'Divergente', className: 'bg-red-50 text-red-600 border border-red-200/60' },
}

export function ListaHistorico({ entries: initialEntries, loading }: ListaHistoricoProps) {
  const [entries, setEntries] = useState(initialEntries)
  const [deletando, setDeletando] = useState<string | null>(null)
  const [modalId, setModalId] = useState<string | null>(null)
  const { toast, showToast, hideToast } = useToast()

  async function confirmarDelete(id: string) {
    setDeletando(id)
    const res = await fetch(`/api/producao/${id}`, { method: 'DELETE' })
    const json = await res.json()
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
      showToast('Lançamento excluído.', 'success')
    } else {
      showToast(json.error ?? 'Erro ao excluir.', 'error')
    }
    setDeletando(null)
    setModalId(null)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/60 rounded-3xl h-20 animate-pulse" />
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-14 space-y-2">
        <p className="font-sans font-medium text-brand-dark/40">Nenhum lançamento encontrado.</p>
        <p className="text-sm font-sans text-brand-dark/25">
          Registre sua produção para ela aparecer aqui.
        </p>
      </div>
    )
  }

  const entradaModal = entries.find((e) => e.id === modalId)

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {modalId && entradaModal && (
        <ModalConfirmacao
          titulo="Excluir lançamento"
          descricao={`Deseja excluir ${entradaModal.quantidade} unidades de ${entradaModal.marca} registradas em ${formatDate(entradaModal.data_producao)}? Esta ação não pode ser desfeita.`}
          textoBotaoConfirmar="Excluir"
          onConfirmar={() => confirmarDelete(modalId)}
          onCancelar={() => setModalId(null)}
          carregando={deletando === modalId}
        />
      )}

      <ul className="space-y-2.5">
        {entries.map((entry) => {
          const status = STATUS_CONFIG[entry.status]
          return (
            <li key={entry.id} className="rounded-3xl bg-white border border-black/[0.05] p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-semibold text-brand-dark/40">
                      {formatDate(entry.data_producao)}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="font-display font-bold text-brand-dark text-lg leading-tight">
                    {entry.quantidade.toLocaleString('pt-BR')}
                    <span className="text-sm font-sans font-normal text-brand-dark/40 ml-1">unid.</span>
                  </p>
                  <p className="text-xs font-sans text-brand-dark/45">
                    {entry.marca} · {entry.tamanho} · {entry.cores} cor{entry.cores > 1 ? 'es' : ''}
                    {entry.nome_parceiro ? ` · ${entry.nome_parceiro}` : ''}
                  </p>
                </div>
                {entry.status === 'pendente' && (
                  <button
                    onClick={() => setModalId(entry.id)}
                    disabled={deletando === entry.id}
                    className="ml-3 mt-0.5 p-2 rounded-xl text-brand-dark/20 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-30"
                    title="Excluir"
                  >
                    <Trash2 size={14} strokeWidth={1.75} />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
