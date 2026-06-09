import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.user_metadata?.funcao !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
    }

    const { payoutId, contentType } = await request.json()
    if (!payoutId || !contentType) {
      return NextResponse.json({ error: 'payoutId e contentType são obrigatórios' }, { status: 400 })
    }

    const ext = MIME_TO_EXT[contentType] ?? 'jpg'
    const admin = createAdminClient()

    const { data: payout } = await admin
      .from('payouts')
      .select('quinzena_id')
      .eq('id', payoutId)
      .single()

    if (!payout) return NextResponse.json({ error: 'Payout não encontrado' }, { status: 404 })

    const path = `comprovantes/${payout.quinzena_id}/${payoutId}.${ext}`

    const { data, error } = await admin.storage
      .from('documentos-pagamentos')
      .createSignedUploadUrl(path)

    if (error) throw error

    return NextResponse.json({ signedUrl: data.signedUrl, path, token: data.token })
  } catch {
    return NextResponse.json({ error: 'Erro ao gerar URL de upload' }, { status: 500 })
  }
}
