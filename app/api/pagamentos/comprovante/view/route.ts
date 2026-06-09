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

    const path = request.nextUrl.searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'path obrigatório' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.storage
      .from('documentos-pagamentos')
      .createSignedUrl(path, 60 * 60) // 1 hora de validade

    if (error) throw error

    return NextResponse.redirect(data.signedUrl)
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar URL do comprovante' }, { status: 500 })
  }
}
