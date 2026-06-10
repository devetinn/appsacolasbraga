export type UserRole = 'pintor' | 'ajudante' | 'admin'
export type EntryStatus = 'pendente' | 'confirmado' | 'divergente'
export type PeriodStatus = 'aberta' | 'fechada'
export type PayoutStatus = 'pendente' | 'pago'

export interface User {
  id: string
  nome: string
  funcao: UserRole
  pin?: string
  pix_key?: string
  ativo: boolean
  created_at: string
}

export interface PayPeriod {
  id: string
  data_inicio: string
  data_fim: string
  data_pagamento: string
  status: PeriodStatus
  fechado_por?: string
  fechado_em?: string
  created_at: string
}

export interface PaymentRate {
  id: string
  funcao: 'ajudante' | 'impressor'
  valor_unitario: number
  vigencia_inicio: string
  vigencia_fim?: string
  criado_por?: string
  created_at: string
}

export type Turno = 'manha' | 'tarde' | 'unico'

export interface ProductionEntry {
  id: string
  quinzena_id: string
  colaborador_id: string
  parceiro_id: string
  data_producao: string
  turno: Turno
  funcao: string
  marca: string
  tamanho: string
  cores: number
  quantidade: number
  status: EntryStatus
  observacao?: string
  created_at: string
  updated_at: string
}

export interface Payout {
  id: string
  quinzena_id: string
  colaborador_id: string
  total_unidades: number
  valor_unitario: number
  valor_total: number
  status: PayoutStatus
  pago_em?: string
  pago_por?: string
  observacao?: string
  comprovante_url?: string | null
  recibo_url?: string | null
  numero_recibo?: number
  created_at: string
}

export interface AuditLog {
  id: string
  usuario_id: string
  acao: string
  tabela?: string
  registro_id?: string
  payload?: Record<string, unknown>
  created_at: string
}
