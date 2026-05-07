import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Sacolas Braga</h1>
        <NavAdmin />
      </header>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  )
}
