import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calcularPayouts } from '@/lib/calculos'

export async function POST() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.funcao !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { data: quinzena, error: qError } = await supabase
      .from('pay_periods')
      .select('id')
      .eq('status', 'aberta')
      .single()

    if (qError || !quinzena) {
      return NextResponse.json({ error: 'Nenhuma quinzena aberta' }, { status: 400 })
    }

    const [{ data: entries }, { data: users }, { data: rates }] = await Promise.all([
      supabase
        .from('production_entries')
        .select('colaborador_id, quantidade, status')
        .eq('quinzena_id', quinzena.id),
      supabase.from('users').select('id, funcao'),
      supabase.from('payment_rates').select('funcao, valor_unitario').is('vigencia_fim', null),
    ])

    const payouts = calcularPayouts(entries ?? [], rates ?? [], users ?? [])

    const { error: insertError } = await supabase
      .from('payouts')
      .insert(payouts.map((p) => ({ ...p, quinzena_id: quinzena.id })))

    if (insertError) throw insertError

    const { error: updateError } = await supabase
      .from('pay_periods')
      .update({ status: 'fechada', fechado_por: user.id, fechado_em: new Date().toISOString() })
      .eq('id', quinzena.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, payouts_gerados: payouts.length })
  } catch {
    return NextResponse.json({ error: 'Erro ao fechar quinzena' }, { status: 500 })
  }
}
