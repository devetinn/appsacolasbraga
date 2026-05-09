'use server'

import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getQuinzenaAtiva } from '@/lib/quinzena'
import type { PayPeriod } from '@/types'

function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function criarOuObterQuinzenaAtiva(): Promise<PayPeriod | null> {
  const supabase = serviceClient()

  const { data: existente } = await supabase
    .from('pay_periods')
    .select('*')
    .eq('status', 'aberta')
    .maybeSingle()

  if (existente) return existente as PayPeriod

  const { inicio, fim, data_pagamento } = getQuinzenaAtiva()

  const toISO = (d: Date) => d.toISOString().split('T')[0]

  const { data: nova, error } = await supabase
    .from('pay_periods')
    .insert({
      data_inicio: toISO(inicio),
      data_fim: toISO(fim),
      data_pagamento: toISO(data_pagamento),
      status: 'aberta',
    })
    .select('*')
    .single()

  if (error) {
    console.error('Erro ao criar quinzena:', error)
    return null
  }

  return nova as PayPeriod
}
