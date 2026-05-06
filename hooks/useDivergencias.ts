'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProductionEntry } from '@/types'

export function useDivergencias(quinzenaId: string | undefined) {
  const [divergencias, setDivergencias] = useState<ProductionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!quinzenaId) { setLoading(false); return }

    const supabase = createClient()

    supabase
      .from('production_entries')
      .select('*')
      .eq('quinzena_id', quinzenaId)
      .eq('status', 'divergente')
      .then(({ data, error }) => {
        if (error) setError(new Error('Erro ao buscar divergências'))
        else setDivergencias(data ?? [])
        setLoading(false)
      })
  }, [quinzenaId])

  return { divergencias, loading, error }
}
