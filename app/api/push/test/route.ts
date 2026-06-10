import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enviarPushParaUsuario } from '@/lib/push'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  await enviarPushParaUsuario(
    user.id,
    '🎉 Notificação de teste',
    'As notificações estão funcionando! Você receberá avisos de pagamento aqui.',
    '/'
  )

  return NextResponse.json({ success: true })
}
