'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { criarOuObterQuinzenaAtiva } from '@/app/actions/quinzena'
import type { PayPeriod } from '@/types'

export function useQuinzenaAtiva() {
  const [quinzena, setQuinzena] = useState<PayPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('pay_periods')
      .select('*')
      .eq('status', 'aberta')
      .maybeSingle()
      .then(async ({ data, error: err }) => {
        if (err) {
          setError(new Error('Erro ao buscar quinzena ativa'))
          setLoading(false)
          return
        }

        if (data) {
          setQuinzena(data as PayPeriod)
          setLoading(false)
          return
        }

        // Nenhuma quinzena aberta → auto-criar via server action
        const nova = await criarOuObterQuinzenaAtiva()
        setQuinzena(nova)
        setLoading(false)
      })
  }, [])

  return { quinzena, loading, error }
}
