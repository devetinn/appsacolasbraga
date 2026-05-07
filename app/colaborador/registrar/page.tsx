'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FormRegistro } from '@/components/colaborador/FormRegistro'
import { useQuinzenaAtiva } from '@/hooks/useQuinzenaAtiva'
import { Toast } from '@/components/ui/Toast'
import { useToast } from '@/hooks/useToast'
import { useState, useEffect } from 'react'
import type { User } from '@/types'

export default function RegistrarProducao() {
  const router = useRouter()
  const { quinzena } = useQuinzenaAtiva()
  const [parceiros, setParceiros] = useState<Pick<User, 'id' | 'nome'>[]>([])
  const { toast, showToast, hideToast } = useToast()

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('users')
      .select('id, nome')
      .eq('ativo', true)
      .neq('funcao', 'admin')
      .then(({ data }) => setParceiros(data ?? []))
  }, [])

  async function handleSubmit(data: {
    data_producao: string
    marca: string
    tamanho: string
    cores: number
    quantidade: number
    parceiro_id: string
  }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !quinzena) throw new Error('Sessão ou quinzena inválida')

    const { error } = await supabase.from('production_entries').insert({
      quinzena_id: quinzena.id,
      colaborador_id: user.id,
      ...data,
      status: 'pendente',
    })

    if (error) throw error

    showToast(`${data.quantidade} unidades registradas com sucesso!`, 'success')
    setTimeout(() => router.push('/colaborador/historico'), 1500)
  }

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar Produção</h2>
      <FormRegistro parceiros={parceiros} onSubmit={handleSubmit} />
    </div>
  )
}
