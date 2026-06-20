'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calcularPayouts } from '@/lib/calculos'

export interface MetricasQuinzena {
  totalUnidades: number
  valorEstimado: number
  diasAtePagamento: number
  loading: boolean
}

export function useMetricasQuinzena(quinzenaId: string | undefined): MetricasQuinzena & { refresh: () => void } {
  const [totalUnidades, setTotalUnidades] = useState(0)
  const [valorEstimado, setValorEstimado] = useState(0)
  const [diasAtePagamento, setDiasAtePagamento] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!quinzenaId) { setLoading(false); return }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const [{ data: entries }, { data: rates }, { data: quinzena }] = await Promise.all([
      supabase
        .from('production_entries')
        .select('quantidade, cores, status, funcao')
        .eq('quinzena_id', quinzenaId)
        .eq('colaborador_id', user.id),
      supabase
        .from('payment_rates')
        .select('funcao, valor_unitario')
        .is('vigencia_fim', null),
      supabase
        .from('pay_periods')
        .select('data_pagamento')
        .eq('id', quinzenaId)
        .single(),
    ])

    // Usa a mesma lógica do admin (calcularPayouts): agrupa por função do
    // lançamento e aplica a taxa correta de cada função (pintor/ajudante),
    // excluindo divergentes. Garante paridade com o painel ADMIN.
    const entriesComId = (entries ?? []).map((e) => ({ ...e, colaborador_id: user.id }))
    const [meuPayout] = calcularPayouts(entriesComId, rates ?? [])
    setTotalUnidades(meuPayout?.total_unidades ?? 0)
    setValorEstimado(meuPayout?.valor_total ?? 0)

    if (quinzena?.data_pagamento) {
      const diff = new Date(quinzena.data_pagamento).getTime() - Date.now()
      setDiasAtePagamento(Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))))
    }

    setLoading(false)
  }, [quinzenaId])

  useEffect(() => { fetch() }, [fetch])

  return { totalUnidades, valorEstimado, diasAtePagamento, loading, refresh: fetch }
}
