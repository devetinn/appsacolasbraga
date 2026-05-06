'use client'

import { useEffect, useState } from 'react'
import { diasAteProximoPagamento } from '@/lib/quinzena'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ContadorPagamento() {
  const [dias, setDias] = useState<number | null>(null)

  useEffect(() => {
    setDias(diasAteProximoPagamento())
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-500">Próximo Pagamento</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-blue-600">
          {dias !== null ? `${dias}d` : '—'}
        </p>
        <p className="text-xs text-gray-500 mt-1">até o fechamento da quinzena</p>
      </CardContent>
    </Card>
  )
}
