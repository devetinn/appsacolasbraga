import { getQuinzenaAtiva, diasAteProximoPagamento } from '@/lib/quinzena'

// Helpers
function d(ano: number, mes: number, dia: number): Date {
  return new Date(ano, mes - 1, dia) // mes 1-based para legibilidade
}
function iso(date: Date): string {
  return date.toISOString().split('T')[0]
}

describe('getQuinzenaAtiva — 1ª quinzena (dias 5–19)', () => {
  it('09/05/2026 → período 05/05–19/05, pagamento 20/05', () => {
    const q = getQuinzenaAtiva(d(2026, 5, 9))
    expect(iso(q.inicio)).toBe('2026-05-05')
    expect(iso(q.fim)).toBe('2026-05-19')
    expect(iso(q.data_pagamento)).toBe('2026-05-20')
  })

  it('05/01/2026 → período 05/01–19/01, pagamento 20/01', () => {
    const q = getQuinzenaAtiva(d(2026, 1, 5))
    expect(iso(q.inicio)).toBe('2026-01-05')
    expect(iso(q.fim)).toBe('2026-01-19')
    expect(iso(q.data_pagamento)).toBe('2026-01-20')
  })
})

describe('getQuinzenaAtiva — 2ª quinzena (dias 20–4 do mês seguinte)', () => {
  it('25/05/2026 → período 20/05–04/06, pagamento 05/06', () => {
    const q = getQuinzenaAtiva(d(2026, 5, 25))
    expect(iso(q.inicio)).toBe('2026-05-20')
    expect(iso(q.fim)).toBe('2026-06-04')
    expect(iso(q.data_pagamento)).toBe('2026-06-05')
  })

  it('20/12/2026 → período 20/12–04/01/2027, pagamento 05/01/2027', () => {
    const q = getQuinzenaAtiva(d(2026, 12, 20))
    expect(iso(q.inicio)).toBe('2026-12-20')
    expect(iso(q.fim)).toBe('2027-01-04')
    expect(iso(q.data_pagamento)).toBe('2027-01-05')
  })

  it('03/06/2026 (dias 1–4) → pertence à Q2 de maio (20/05–04/06)', () => {
    const q = getQuinzenaAtiva(d(2026, 6, 3))
    expect(iso(q.inicio)).toBe('2026-05-20')
    expect(iso(q.fim)).toBe('2026-06-04')
    expect(iso(q.data_pagamento)).toBe('2026-06-05')
  })
})

describe('diasAteProximoPagamento', () => {
  it('09/05/2026 → pagamento em 20/05 → 11 dias', () => {
    const hoje = d(2026, 5, 9)   // midnight local
    const dias = diasAteProximoPagamento(hoje)
    expect(dias).toBe(11)
  })

  it('19/05/2026 (último dia da Q1) → pagamento amanhã → 1 dia', () => {
    const hoje = d(2026, 5, 19)
    const dias = diasAteProximoPagamento(hoje)
    expect(dias).toBe(1)
  })

  it('20/05/2026 → já está na Q2 (20/05–04/06), pagamento 05/06 → 16 dias', () => {
    // Dia 20 inicia a Q2; o pagamento da Q1 foi ontem. Próximo pagamento = 05/06.
    const hoje = d(2026, 5, 20)
    const dias = diasAteProximoPagamento(hoje)
    expect(dias).toBe(16)
  })

  it('25/05/2026 → pagamento 05/06 → 11 dias', () => {
    const hoje = d(2026, 5, 25)
    const dias = diasAteProximoPagamento(hoje)
    expect(dias).toBe(11)
  })
})
