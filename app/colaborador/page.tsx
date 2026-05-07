import { createClient } from '@/lib/supabase/server'
import { diasAteProximoPagamento } from '@/lib/quinzena'
import { formatDate } from '@/lib/format'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default async function ColaboradorDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const dias = diasAteProximoPagamento()

  const { data: quinzenaAtiva } = await supabase
    .from('pay_periods')
    .select('id, data_inicio, data_fim')
    .eq('status', 'aberta')
    .single()

  const { data: producoes } = quinzenaAtiva && user
    ? await supabase
        .from('production_entries')
        .select('quantidade, status')
        .eq('quinzena_id', quinzenaAtiva.id)
        .eq('colaborador_id', user.id)
    : { data: [] }

  const totalRegistradas = (producoes ?? []).reduce((s, e) => s + e.quantidade, 0)
  const totalConfirmadas = (producoes ?? [])
    .filter((e) => e.status === 'confirmado')
    .reduce((s, e) => s + e.quantidade, 0)

  const nome = user?.user_metadata?.nome ?? 'Colaborador'

  return (
    <div className="space-y-4 pt-2">
      <p className="text-gray-600 text-sm">
        Olá, <strong>{nome}</strong>!
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
            {quinzenaAtiva ? (
              <p className="text-sm font-medium text-gray-800">
                {formatDate(quinzenaAtiva.data_inicio).slice(0, 5)} –{' '}
                {formatDate(quinzenaAtiva.data_fim).slice(0, 5)}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Nenhuma aberta</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Unidades registradas</p>
            <p className="text-2xl font-bold text-gray-800">{totalRegistradas.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500">Confirmadas</p>
            <p className="text-2xl font-bold text-green-600">{totalConfirmadas.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2 pt-2">
        <Link href="/colaborador/registrar">
          <Button className="w-full" disabled={!quinzenaAtiva}>
            {quinzenaAtiva ? '+ Registrar Produção' : 'Sem quinzena aberta'}
          </Button>
        </Link>
        <Link href="/colaborador/historico">
          <Button variant="outline" className="w-full">Ver Histórico</Button>
        </Link>
      </div>
    </div>
  )
}
