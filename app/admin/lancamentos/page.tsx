import { createClient } from '@/lib/supabase/server'
import { TabelaLancamentos } from '@/components/admin/TabelaLancamentos'
import type { ProductionEntry } from '@/types'

export default async function LancamentosPage() {
  const supabase = createClient()

  const { data: quinzena } = await supabase
    .from('pay_periods')
    .select('id')
    .eq('status', 'aberta')
    .single()

  const { data: entries } = quinzena
    ? await supabase
        .from('production_entries')
        .select('*, users(nome)')
        .eq('quinzena_id', quinzena.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const entriesComNome = (entries ?? []).map((e) => ({
    ...(e as ProductionEntry),
    nome_colaborador: (e as { users?: { nome: string } | null }).users?.nome ?? e.colaborador_id,
  }))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Lançamentos da Quinzena</h2>
      {!quinzena && (
        <p className="text-sm text-gray-500 bg-gray-100 rounded-lg px-4 py-3">
          Nenhuma quinzena aberta no momento.
        </p>
      )}
      <TabelaLancamentos entries={entriesComNome} mostrarColaborador quinzenaId={quinzena?.id} />
    </div>
  )
}
