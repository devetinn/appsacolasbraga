'use client'

import { formatarMoeda } from '@/lib/calculos'
import type { MetricasQuinzena } from '@/hooks/useMetricasQuinzena'

interface BannerMetricasProps extends MetricasQuinzena {}

export function BannerMetricas({ totalUnidades, valorEstimado, diasAtePagamento, loading }: BannerMetricasProps) {
  if (loading) {
    return <div className="h-14 rounded-2xl bg-black/[0.04] animate-pulse" />
  }

  return (
    <div className="flex items-stretch gap-2">
      {/* Pagamento em X dias */}
      <div className="flex-1 bg-brand-blue rounded-2xl px-4 py-3 flex flex-col justify-center">
        <p className="text-[9px] font-sans font-semibold uppercase tracking-widest text-white/55 leading-none mb-0.5">
          Pagamento em
        </p>
        <p className="font-display font-bold text-white text-xl leading-none">
          {diasAtePagamento}
          <span className="text-sm font-sans font-semibold opacity-60 ml-0.5">d</span>
        </p>
      </div>

      {/* Unidades */}
      <div className="flex-1 bg-white border border-black/[0.06] rounded-2xl px-4 py-3 flex flex-col justify-center">
        <p className="text-[9px] font-sans font-semibold uppercase tracking-widest text-brand-dark/35 leading-none mb-0.5">
          Unidades
        </p>
        <p className="font-display font-bold text-brand-dark text-xl leading-none">
          {totalUnidades.toLocaleString('pt-BR')}
        </p>
      </div>

      {/* Estimativa */}
      <div className="flex-1 bg-white border border-brand-gold/25 rounded-2xl px-4 py-3 flex flex-col justify-center">
        <p className="text-[9px] font-sans font-semibold uppercase tracking-widest text-brand-gold/60 leading-none mb-0.5">
          Estimativa
        </p>
        <p className="font-display font-bold text-brand-gold text-xl leading-none">
          {formatarMoeda(valorEstimado)}
        </p>
      </div>
    </div>
  )
}
