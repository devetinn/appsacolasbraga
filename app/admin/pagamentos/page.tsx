import { createClient } from '@/lib/supabase/server'
import { TabelaPagamentos } from '@/components/admin/TabelaPagamentos'
import { BotaoExportarCSV } from '@/components/admin/BotaoExportarCSV'
import type { Payout } from '@/types'
import { formatDate } from '@/lib/format'

export default async function PagamentosPage() {
  const supabase = createClient()

  const { data: quinzena } = await supabase
    .from('pay_periods')
    .select('id, data_fim')
    .eq('status', 'fechada')
    .order('data_fim', { ascending: false })
    .limit(1)
    .single()

  const { data: payouts } = quinzena
    ? await supabase
        .from('payouts')
        .select('*, users(nome)')
        .eq('quinzena_id', quinzena.id)
    : { data: [] }

  const payoutsComNome = (payouts ?? []).map((p) => ({
    ...(p as Payout),
    nome_colaborador: (p as { users?: { nome: string } | null }).users?.nome ?? p.colaborador_id,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Pagamentos</h2>
        <BotaoExportarCSV payouts={payoutsComNome} quinzenaLabel={quinzena?.data_fim} />
      </div>
      {quinzena && (
        <p className="text-sm text-gray-500">Quinzena encerrada em {formatDate(quinzena.data_fim)}</p>
      )}
      {!quinzena && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
          <p className="text-gray-600 font-medium">Nenhuma quinzena fechada ainda</p>
          <p className="text-sm text-gray-400 mt-1">Os pagamentos aparecerão aqui após o fechamento de uma quinzena.</p>
        </div>
      )}
      <TabelaPagamentos payouts={payoutsComNome} />
    </div>
  )
}
