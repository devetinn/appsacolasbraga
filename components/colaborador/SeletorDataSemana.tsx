'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

interface SeletorDataSemanaProps {
  dataSelecionada: string | null
  onSelect: (data: string | null) => void
}

export function SeletorDataSemana({ dataSelecionada, onSelect }: SeletorDataSemanaProps) {
  const [offset, setOffset] = useState(0)

  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay() + offset * 7)

  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(inicioSemana.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    const ehHoje = iso === hoje.toISOString().split('T')[0]
    return { iso, num: d.getDate(), diaSemana: DIAS_SEMANA[d.getDay()], ehHoje }
  })

  const labelSemana = offset === 0
    ? 'Esta semana'
    : offset === -1
    ? 'Semana passada'
    : `${dias[0].num}/${String(new Date(dias[0].iso).getMonth() + 1).padStart(2, '0')} – ${dias[6].num}/${String(new Date(dias[6].iso).getMonth() + 1).padStart(2, '0')}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffset(o => o - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-xl text-brand-dark/30 hover:bg-black/5 hover:text-brand-dark/60 transition-all"
        >
          <ChevronLeft size={15} strokeWidth={2} />
        </button>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.1em] text-brand-dark/35">
          {labelSemana}
        </span>
        <button
          onClick={() => setOffset(o => o + 1)}
          disabled={offset >= 0}
          className="w-7 h-7 flex items-center justify-center rounded-xl text-brand-dark/30 hover:bg-black/5 hover:text-brand-dark/60 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {dias.map(({ iso, num, diaSemana, ehHoje }) => {
          const selecionado = dataSelecionada === iso
          return (
            <button
              key={iso}
              onClick={() => onSelect(selecionado ? null : iso)}
              className={`flex flex-col items-center py-2.5 rounded-2xl transition-all ${
                selecionado
                  ? 'bg-brand-blue text-white'
                  : ehHoje
                  ? 'bg-brand-blue/8 text-brand-blue'
                  : 'hover:bg-black/5 text-brand-dark/50'
              }`}
            >
              <span className={`text-[9px] font-sans font-semibold tracking-wide ${
                selecionado ? 'text-white/70' : ''
              }`}>
                {diaSemana}
              </span>
              <span className={`font-display font-bold text-base mt-0.5 leading-none ${
                selecionado ? 'text-white' : ehHoje ? 'text-brand-blue' : 'text-brand-dark'
              }`}>
                {num}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
