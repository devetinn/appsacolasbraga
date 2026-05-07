import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Logo } from '@/components/ui/Logo'
import { NavAdmin } from '@/components/admin/NavAdmin'

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
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-white border-b border-black/[0.06] px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <Logo size="sm" />
        <NavAdmin />
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
