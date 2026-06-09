import { NextResponse, NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { assertAdmin } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await assertAdmin()
    if (!authUser) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })

    const path = request.nextUrl.searchParams.get('path')
    if (!path) return NextResponse.json({ error: 'path obrigatório' }, { status: 400 })

    const db = createAdminClient()
    const { data, error } = await db.storage
      .from('documentos-pagamentos')
      .createSignedUrl(path, 60 * 60) // 1 hora de validade

    if (error) throw error

    return NextResponse.redirect(data.signedUrl)
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar URL do comprovante' }, { status: 500 })
  }
}
