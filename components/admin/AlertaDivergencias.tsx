'use client'

import type { ProductionEntry } from '@/types'
import { AlertTriangle } from 'lucide-react'

interface AlertaDivergenciasProps {
  divergencias: ProductionEntry[]
}

export function AlertaDivergencias({ divergencias }: AlertaDivergenciasProps) {
  if (divergencias.length === 0) return null

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
        <p className="font-medium text-red-700">
          {divergencias.length} divergência{divergencias.length > 1 ? 's' : ''} pendente{divergencias.length > 1 ? 's' : ''}
        </p>
      </div>
      <p className="text-sm text-red-600 ml-6">
        Resolva antes de fechar a quinzena.
      </p>
    </div>
  )
}
