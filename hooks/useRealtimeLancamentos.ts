'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ProductionEntry } from '@/types'

type Callback = (entry: ProductionEntry) => void

export function useRealtimeLancamentos(quinzenaId: string | undefined, onUpdate: Callback) {
  useEffect(() => {
    if (!quinzenaId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`lancamentos-${quinzenaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'production_entries',
          filter: `quinzena_id=eq.${quinzenaId}`,
        },
        (payload) => {
          if (payload.new && typeof payload.new === 'object') {
            onUpdate(payload.new as ProductionEntry)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [quinzenaId, onUpdate])
}
