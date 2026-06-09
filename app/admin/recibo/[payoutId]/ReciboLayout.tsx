import { formatDate, formatDateLong } from '@/lib/format'
import { formatarMoeda } from '@/lib/calculos'
import { valorPorExtenso } from '@/lib/extenso'

interface ReciboLayoutProps {
  payout: {
    numero_recibo?: number
    valor_total: number
    total_unidades: number
    valor_unitario: number
    pago_em?: string | null
  }
  colaborador: { nome: string; funcao: string }
  quinzena: { data_inicio: string; data_fim: string }
  empresa: { nome: string; cidade: string }
}

export function ReciboLayout({ payout, colaborador, quinzena, empresa }: ReciboLayoutProps) {
  const dataEmissao = payout.pago_em
    ? formatDateLong(payout.pago_em.split('T')[0])
    : formatDateLong(new Date().toISOString().split('T')[0])

  const referente = `Produção da quinzena de ${formatDate(quinzena.data_inicio)} a ${formatDate(quinzena.data_fim)}`

  return (
    <div
      className="w-full border border-gray-200 rounded-2xl overflow-hidden bg-white print:rounded-none print:border-0 print:shadow-none"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <div className="flex min-h-[200px]">

        {/* Canhoto (esquerda) */}
        <div
          className="w-[30%] shrink-0 border-r border-dashed border-gray-300 px-5 py-6 space-y-4 bg-white"
        >
          <div className="space-y-0.5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500">Valor</p>
            <p className="text-sm font-sans font-semibold text-gray-800">
              {formatarMoeda(payout.valor_total)}
            </p>
          </div>
          <div className="border-t border-gray-200" />

          <div className="space-y-0.5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500">Colaborador</p>
            <p className="text-sm font-sans font-semibold text-gray-800">{colaborador.nome}</p>
          </div>
          <div className="border-t border-gray-200" />

          <div className="space-y-0.5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500">Referente</p>
            <p className="text-xs font-sans text-gray-700 leading-snug">{referente}</p>
          </div>
          <div className="border-t border-gray-200" />

          <div className="space-y-0.5">
            <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500">Data</p>
            <p className="text-sm font-sans text-gray-700">
              {payout.pago_em
                ? formatDate(payout.pago_em.split('T')[0])
                : formatDate(new Date().toISOString().split('T')[0])}
            </p>
          </div>

          {payout.numero_recibo && (
            <>
              <div className="border-t border-gray-200" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-500">Nº Recibo</p>
                <p className="text-sm font-sans font-semibold text-gray-800">#{payout.numero_recibo}</p>
              </div>
            </>
          )}
        </div>

        {/* Recibo principal (direita) */}
        <div className="flex-1 px-8 py-6 flex flex-col justify-between">
          {/* Cabeçalho do recibo */}
          <div>
            <div className="flex items-start justify-between mb-5">
              <h1 className="text-2xl font-sans font-black text-blue-600 tracking-wide">RECIBO</h1>
              <span className="text-2xl font-sans font-black text-green-600">
                {formatarMoeda(payout.valor_total)}
              </span>
            </div>

            <div className="space-y-1.5 text-[15px] text-gray-800 leading-relaxed">
              <p>Recebi de <strong>{empresa.nome}</strong></p>
              <p>A importância de <em>{valorPorExtenso(payout.valor_total)}</em></p>
              <p>
                Referente à produção da quinzena de{' '}
                <strong>{formatDate(quinzena.data_inicio)}</strong> a{' '}
                <strong>{formatDate(quinzena.data_fim)}</strong>
                {' '}·{' '}
                <strong>{payout.total_unidades.toLocaleString('pt-BR')}</strong> unidades
              </p>
            </div>

            <p className="mt-5 text-[14px] text-gray-600 flex items-center gap-2">
              <span className="text-lg">📅</span>
              {empresa.cidade}, {dataEmissao}
            </p>
          </div>

          {/* Linha de assinatura */}
          <div className="mt-8 pt-4">
            <div className="flex items-end gap-2">
              <span className="text-gray-500 text-sm mb-0.5">x</span>
              <div className="flex-1 border-b border-gray-500" />
            </div>
            <p className="text-[11px] font-sans text-gray-400 mt-1 text-center pr-2">
              assinatura do colaborador
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
