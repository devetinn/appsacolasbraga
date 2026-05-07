import { createClient } from '@/lib/supabase/server'
import { TabelaLancamentos } from '@/components/admin/TabelaLancamentos'
import { notFound } from 'next/navigation'
import type { ProductionEntry } from '@/types'
import { formatDate } from '@/lib/format'

interface Props {
  params: { id: string }
}

export default async function QuinzenaDetalhesPage({ params }: Props) {
  const supabase = createClient()

  const { data: quinzena } = await supabase
    .from('pay_periods')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!quinzena) notFound()

  const { data: entries } = await supabase
    .from('production_entries')
    .select('*')
    .eq('quinzena_id', params.id)
    .order('data_producao', { ascending: false })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Quinzena {formatDate(quinzena.data_inicio)} – {formatDate(quinzena.data_fim)}
        </h2>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mt-1">
          {quinzena.status === 'fechada' ? 'Fechada' : 'Aberta'}
        </span>
      </div>
      <TabelaLancamentos
        entries={(entries ?? []) as ProductionEntry[]}
        readOnly={quinzena.status === 'fechada'}
      />
    </div>
  )
}
