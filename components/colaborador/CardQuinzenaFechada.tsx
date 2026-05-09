'use client'

import { ChevronRight } from 'lucide-react'
import { formatarLabelQuinzena } from '@/lib/format'
import { formatarMoeda } from '@/lib/calculos'
import type { QuinzenaFechada } from '@/hooks/useQuinzenasFechadas'

interface CardQuinzenaFechadaProps {
  quinzena: QuinzenaFechada
  onClick: () => void
}

export function CardQuinzenaFechada({ quinzena, onClick }: CardQuinzenaFechadaProps) {
  const pago = quinzena.payout?.status === 'pago'
  const valorTotal = quinzena.payout?.valor_total ?? 0

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-black/[0.05] rounded-3xl p-5 flex items-center gap-4 active:scale-[0.99] transition-all hover:border-black/10"
    >
      {/* Label + período */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-sans font-bold text-brand-dark tracking-wide">
          {formatarLabelQuinzena(quinzena.data_inicio)}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <div>
            <p className="text-[9px] font-sans font-semibold uppercase tracking-widest text-brand-dark/35">
              Unidades
            </p>
            <p className="font-display font-bold text-brand-dark text-base leading-tight tabular-nums">
              {quinzena.totalUnidades.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="w-px h-8 bg-black/[0.06]" />
          <div>
            <p className="text-[9px] font-sans font-semibold uppercase tracking-widest text-brand-gold/60">
              Valor
            </p>
            <p className="font-display font-bold text-brand-gold text-base leading-tight">
              {valorTotal > 0 ? formatarMoeda(valorTotal) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Status + chevron */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className={`text-[9px] font-sans font-semibold px-2.5 py-1 rounded-full ${
          pago
            ? 'bg-green-50 text-green-700'
            : 'bg-amber-50 text-amber-700'
        }`}>
          {pago ? 'Pago' : 'Pendente'}
        </span>
        <ChevronRight size={14} strokeWidth={2} className="text-brand-dark/25" />
      </div>
    </button>
  )
}
