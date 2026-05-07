import { createClient } from '@/lib/supabase/server'
import { diasAteProximoPagamento } from '@/lib/quinzena'
import { formatDate } from '@/lib/format'
import Link from 'next/link'

export default async function ColaboradorDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dias = diasAteProximoPagamento()

  const { data: quinzenaAtiva } = await supabase
    .from('pay_periods')
    .select('id, data_inicio, data_fim')
    .eq('status', 'aberta')
    .single()

  const { data: producoes } = quinzenaAtiva && user
    ? await supabase
        .from('production_entries')
        .select('quantidade, status')
        .eq('quinzena_id', quinzenaAtiva.id)
        .eq('colaborador_id', user.id)
    : { data: [] }

  const totalRegistradas = (producoes ?? []).reduce((s, e) => s + e.quantidade, 0)
  const totalConfirmadas = (producoes ?? [])
    .filter((e) => e.status === 'confirmado')
    .reduce((s, e) => s + e.quantidade, 0)

  const nome = user?.user_metadata?.nome ?? 'Colaborador'

  return (
    <div className="space-y-5">

      {/* Saudação */}
      <div>
        <p className="text-xs font-sans font-semibold uppercase tracking-widest text-brand-dark/35">
          Bem-vindo
        </p>
        <h2 className="font-display font-bold text-brand-dark text-xl mt-0.5">{nome}</h2>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 gap-3">

        {/* Pagamento */}
        <div className="bg-brand-blue rounded-3xl p-5 col-span-1">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-white/60">
            Pagamento em
          </p>
          <p className="font-display font-bold text-white text-4xl mt-2 leading-none">
            {dias}
            <span className="text-xl ml-1 font-sans font-semibold opacity-70">d</span>
          </p>
        </div>

        {/* Quinzena */}
        <div className="bg-white rounded-3xl p-5 border border-black/[0.05]">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-dark/35">
            Quinzena
          </p>
          {quinzenaAtiva ? (
            <p className="font-display font-bold text-brand-dark text-sm mt-2 leading-tight">
              {formatDate(quinzenaAtiva.data_inicio).slice(0, 5)}
              <span className="text-brand-dark/30 mx-1">–</span>
              {formatDate(quinzenaAtiva.data_fim).slice(0, 5)}
            </p>
          ) : (
            <p className="text-xs font-sans text-brand-dark/30 mt-2">Nenhuma aberta</p>
          )}
        </div>

        {/* Registradas */}
        <div className="bg-white rounded-3xl p-5 border border-black/[0.05]">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-dark/35">
            Registradas
          </p>
          <p className="font-display font-bold text-brand-dark text-3xl mt-2 leading-none">
            {totalRegistradas.toLocaleString('pt-BR')}
          </p>
        </div>

        {/* Confirmadas */}
        <div className="bg-white rounded-3xl p-5 border border-brand-gold/20">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-brand-gold/70">
            Confirmadas
          </p>
          <p className="font-display font-bold text-brand-gold text-3xl mt-2 leading-none">
            {totalConfirmadas.toLocaleString('pt-BR')}
          </p>
        </div>

      </div>

      {/* CTA principal */}
      {quinzenaAtiva ? (
        <Link href="/colaborador/registrar">
          <div className="w-full bg-brand-dark text-white rounded-3xl py-4 px-5 flex items-center justify-between group hover:bg-brand-dark/90 transition-all active:scale-[0.99]">
            <span className="font-sans font-semibold text-sm">Registrar Produção</span>
            <span className="text-white/40 group-hover:text-white/70 transition-colors text-lg leading-none">→</span>
          </div>
        </Link>
      ) : (
        <div className="w-full bg-brand-dark/5 rounded-3xl py-4 px-5 border border-dashed border-brand-dark/15">
          <p className="font-sans font-medium text-sm text-brand-dark/40 text-center">
            Nenhuma quinzena aberta
          </p>
        </div>
      )}

    </div>
  )
}
