import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.funcao !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('payouts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar pagamentos' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.funcao !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const body = await request.json()
    const { id, comprovante_url } = body
    const admin = createAdminClient()

    // Atualização parcial: só comprovante_url
    if (comprovante_url !== undefined) {
      const { data, error } = await admin
        .from('payouts')
        .update({ comprovante_url })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }

    // Marcar como pago
    const { data, error } = await admin
      .from('payouts')
      .update({ status: 'pago', pago_em: new Date().toISOString(), pago_por: user.id })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar pagamento' }, { status: 500 })
  }
}
