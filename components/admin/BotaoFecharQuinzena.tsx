'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ModalConfirmacao } from '@/components/ui/ModalConfirmacao'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'

export function BotaoFecharQuinzena() {
  const router = useRouter()
  const [mostrarModal, setMostrarModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const { toast, showToast, hideToast } = useToast()

  async function handleFechar() {
    setLoading(true)
    setErro('')

    const res = await fetch('/api/quinzena/fechar', { method: 'POST' })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error ?? 'Erro ao fechar quinzena.')
      setLoading(false)
      setMostrarModal(false)
      return
    }

    setMostrarModal(false)
    const msg = json.aviso
      ? `Quinzena fechada! ⚠️ ${json.aviso}`
      : 'Quinzena fechada com sucesso!'
    showToast(msg, json.aviso ? 'error' : 'success')
    router.refresh()
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      {mostrarModal && (
        <ModalConfirmacao
          titulo="Fechar quinzena"
          descricao="Esta ação calculará os pagamentos e encerrará a quinzena. Não pode ser desfeita."
          textoBotaoConfirmar="Fechar Quinzena"
          onConfirmar={handleFechar}
          onCancelar={() => setMostrarModal(false)}
          carregando={loading}
        />
      )}
      {erro && <p className="text-sm text-red-600 bg-red-50 rounded p-2">{erro}</p>}
      <button
        onClick={() => setMostrarModal(true)}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        Fechar Quinzena
      </button>
    </>
  )
}
