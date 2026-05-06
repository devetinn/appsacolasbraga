import { createClient } from '@/lib/supabase/server'
import { getQuinzenaAtiva, diasAteProximoPagamento, formatarData } from '@/lib/quinzena'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function ColaboradorDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const quinzena = getQuinzenaAtiva()
  const dias = diasAteProximoPagamento()

  return (
    <div className="space-y-4 pt-2">
      <p className="text-gray-600 text-sm">
        Olá, <strong>{user?.user_metadata?.nome ?? 'Colaborador'}</strong>!
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Pagamento em</p>
            <p className="text-2xl font-bold text-blue-600">{dias}d</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Quinzena</p>
            <p className="text-sm font-medium text-gray-800">
              {formatarData(quinzena.inicio).slice(0, 5)} –{' '}
              {formatarData(quinzena.fim).slice(0, 5)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2 pt-2">
        <Link href="/colaborador/registrar">
          <Button className="w-full">+ Registrar Produção</Button>
        </Link>
        <Link href="/colaborador/historico">
          <Button variant="outline" className="w-full">Ver Histórico</Button>
        </Link>
      </div>
    </div>
  )
}
