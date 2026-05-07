'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function BotaoLogout() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-sans font-semibold uppercase tracking-wider text-brand-dark/40 hover:text-red-500 transition-colors px-2 py-1"
    >
      Sair
    </button>
  )
}
