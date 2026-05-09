'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PayPeriod, Payout } from '@/types'

export interface QuinzenaFechada extends PayPeriod {
  payout: Payout | null
  totalUnidades: number
}

export function useQuinzenasFechadas() {
  const [quinzenas, setQuinzenas] = useState<QuinzenaFechada[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }

      const [{ data: periods, error: pErr }, { data: payouts }] = await Promise.all([
        supabase
          .from('pay_periods')
          .select('*')
          .eq('status', 'fechada')
          .order('data_inicio', { ascending: false }),
        supabase
          .from('payouts')
          .select('*')
          .eq('colaborador_id', user.id),
      ])

      if (pErr) { setError(new Error('Erro ao buscar quinzenas')); setLoading(false); return }

      const payoutMap = new Map<string, Payout>()
      ;(payouts ?? []).forEach((p) => payoutMap.set(p.quinzena_id, p as Payout))

      const result: QuinzenaFechada[] = (periods ?? []).map((p) => {
        const payout = payoutMap.get(p.id) ?? null
        return {
          ...(p as PayPeriod),
          payout,
          totalUnidades: payout?.total_unidades ?? 0,
        }
      })

      setQuinzenas(result)
      setLoading(false)
    })
  }, [])

  return { quinzenas, loading, error }
}
