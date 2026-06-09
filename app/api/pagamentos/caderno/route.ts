import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.funcao !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const payoutId = request.nextUrl.searchParams.get('payoutId')
    if (!payoutId) return NextResponse.json({ error: 'payoutId obrigatório' }, { status: 400 })

    const admin = createAdminClient()

    const [payoutRes, ] = await Promise.all([
      admin
        .from('payouts')
        .select('*, colaborador:users!colaborador_id(nome, funcao, pix_key), quinzena:pay_periods!quinzena_id(data_inicio, data_fim)')
        .eq('id', payoutId)
        .single(),
    ])

    if (payoutRes.error || !payoutRes.data) {
      return NextResponse.json({ error: 'Payout não encontrado' }, { status: 404 })
    }

    const { colaborador_id, quinzena_id } = payoutRes.data

    const { data: entries } = await admin
      .from('production_entries')
      .select('*, parceiro:users!parceiro_id(nome)')
      .eq('quinzena_id', quinzena_id)
      .eq('colaborador_id', colaborador_id)
      .order('data_producao', { ascending: true })

    const payout = payoutRes.data as Record<string, unknown>

    return NextResponse.json({
      payout: {
        id: payout.id,
        quinzena_id: payout.quinzena_id,
        colaborador_id: payout.colaborador_id,
        total_unidades: payout.total_unidades,
        valor_unitario: payout.valor_unitario,
        valor_total: payout.valor_total,
        status: payout.status,
        pago_em: payout.pago_em,
        comprovante_url: payout.comprovante_url,
        recibo_url: payout.recibo_url,
        numero_recibo: payout.numero_recibo,
        created_at: payout.created_at,
      },
      colaborador: payout.colaborador,
      quinzena: payout.quinzena,
      entries: (entries ?? []).map((e) => ({
        ...e,
        nome_parceiro: (e as { parceiro?: { nome: string } | null }).parceiro?.nome ?? null,
      })),
    })
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar caderno' }, { status: 500 })
  }
}
