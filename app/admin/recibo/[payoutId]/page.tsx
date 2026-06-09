import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ReciboLayout } from './ReciboLayout'
import { PrintButton } from './PrintButton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: { payoutId: string }
}

export default async function ReciboPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.funcao !== 'admin') {
    notFound()
  }

  const admin = createAdminClient()

  const { data: payout } = await admin
    .from('payouts')
    .select('*, colaborador:users!colaborador_id(nome, funcao), quinzena:pay_periods!quinzena_id(data_inicio, data_fim)')
    .eq('id', params.payoutId)
    .single()

  if (!payout) notFound()

  const p = payout as typeof payout & {
    colaborador: { nome: string; funcao: string } | null
    quinzena: { data_inicio: string; data_fim: string } | null
  }

  if (!p.colaborador || !p.quinzena) notFound()

  const empresa = {
    nome: process.env.NEXT_PUBLIC_EMPRESA_NOME ?? 'Sacolas Braga',
    cidade: process.env.NEXT_PUBLIC_EMPRESA_CIDADE ?? 'Fortaleza',
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Barra de ações (oculta na impressão) */}
      <div className="no-print sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link
          href="/admin/pagamentos"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Voltar
        </Link>
        <PrintButton />
      </div>

      {/* Conteúdo do recibo */}
      <main className="max-w-4xl mx-auto px-6 py-8 print:p-0 print:max-w-none">
        <ReciboLayout
          payout={{
            numero_recibo: p.numero_recibo,
            valor_total: p.valor_total,
            total_unidades: p.total_unidades,
            valor_unitario: p.valor_unitario,
            pago_em: p.pago_em,
          }}
          colaborador={p.colaborador}
          quinzena={p.quinzena}
          empresa={empresa}
        />
      </main>
    </div>
  )
}
