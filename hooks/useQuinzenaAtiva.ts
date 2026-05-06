'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
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
      .single()
      .then(({ data, error }) => {
        if (error) setError(new Error('Erro ao buscar quinzena ativa'))
        else setQuinzena(data)
        setLoading(false)
      })
  }, [])

  return { quinzena, loading, error }
}
