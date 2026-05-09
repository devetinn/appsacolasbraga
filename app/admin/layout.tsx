import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/ui/Logo'
import { BotaoLogout } from '@/components/ui/BotaoLogout'
import { NavAdminBottom } from '@/components/admin/NavAdminBottom'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let funcao = user.user_metadata?.funcao
  if (!funcao) {
    const { data: profile } = await supabase
      .from('users')
      .select('funcao')
      .eq('id', user.id)
      .single()
    funcao = profile?.funcao
  }

  if (funcao !== 'admin') redirect('/colaborador')

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <header className="bg-white border-b border-black/[0.06] px-5 h-12 flex items-center justify-between sticky top-0 z-30 shrink-0">
        <Logo size="sm" />
        <BotaoLogout />
      </header>
      <main className="flex-1 px-4 pt-6 pb-28 max-w-6xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
      <NavAdminBottom />
    </div>
  )
}
