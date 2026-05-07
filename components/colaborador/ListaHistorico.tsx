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
  pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
  confirmado: { label: 'Confirmado', className: 'bg-green-100 text-green-700' },
  divergente: { label: 'Divergente', className: 'bg-red-100 text-red-700' },
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

  if (loading) return <p className="text-gray-500 text-sm text-center py-4">Carregando...</p>

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 space-y-2">
        <p className="text-gray-400 text-sm">Nenhum lançamento nesta quinzena.</p>
        <p className="text-gray-400 text-xs">Registre sua produção para ela aparecer aqui.</p>
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
      <ul className="space-y-3">
        {entries.map((entry) => {
          const status = STATUS_CONFIG[entry.status]
          return (
            <li key={entry.id} className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="text-sm font-medium text-gray-700">{formatDate(entry.data_producao)}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${status.className}`}>
                    {status.label}
                  </span>
                </div>
                {entry.status === 'pendente' && (
                  <button
                    onClick={() => setModalId(entry.id)}
                    disabled={deletando === entry.id}
                    className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Excluir lançamento"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500">
                {entry.marca} · {entry.tamanho} · {entry.cores} cor{entry.cores > 1 ? 'es' : ''}
              </p>
              {entry.nome_parceiro && (
                <p className="text-xs text-gray-400 mt-0.5">Parceiro: {entry.nome_parceiro}</p>
              )}
              <p className="text-base font-semibold text-gray-900 mt-1">
                {entry.quantidade.toLocaleString('pt-BR')} unidades
              </p>
            </li>
          )
        })}
      </ul>
    </>
  )
}
