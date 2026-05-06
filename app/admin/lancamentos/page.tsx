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
        .select('*')
        .eq('quinzena_id', quinzena.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Lançamentos da Quinzena</h2>
      <TabelaLancamentos entries={(entries ?? []) as ProductionEntry[]} />
    </div>
  )
}
