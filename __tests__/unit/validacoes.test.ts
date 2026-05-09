import { validarCruzamento } from '@/lib/validacoes'
import type { EntryForValidation } from '@/lib/validacoes'

// Helpers para montar entradas sem repetição
function entry(
  id: string,
  colaborador_id: string,
  parceiro_id: string,
  quantidade: number,
  opts: { turno?: string; marca?: string; tamanho?: string; data_producao?: string } = {}
): EntryForValidation {
  return {
    id,
    colaborador_id,
    parceiro_id,
    quantidade,
    data_producao: opts.data_producao ?? '2026-05-09',
    turno:         opts.turno         ?? 'unico',
    marca:         opts.marca         ?? 'Hering',
    tamanho:       opts.tamanho       ?? '30x45',
  }
}

// IDs de colaboradores
const A = 'colab-A'
const B = 'colab-B'
const C = 'colab-C'

// ─── CASO 1 ──────────────────────────────────────────────────────────────────
// Mesmo par, mesma sacola, turno único → ambos confirmados
describe('Caso 1 — turno único, sacola igual', () => {
  it('confirma os dois registros quando quantidades batem', () => {
    const entries = [
      entry('e1', A, B, 500, { turno: 'unico' }),
      entry('e2', B, A, 500, { turno: 'unico' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('e1')).toBe('confirmado')
    expect(result.get('e2')).toBe('confirmado')
  })

  it('marca divergente quando quantidades diferem', () => {
    const entries = [
      entry('e1', A, B, 500, { turno: 'unico' }),
      entry('e2', B, A, 400, { turno: 'unico' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('e1')).toBe('divergente')
    expect(result.get('e2')).toBe('divergente')
  })
})

// ─── CASO 2 ──────────────────────────────────────────────────────────────────
// Mesmo par, mesma sacola, manhã e tarde → dois pares confirmados separadamente
describe('Caso 2 — mesmo par, turnos manhã e tarde distintos', () => {
  it('confirma cada turno com seu par correspondente', () => {
    const entries = [
      entry('mA1', A, B, 300, { turno: 'manha' }),
      entry('mB1', B, A, 300, { turno: 'manha' }),
      entry('tA1', A, B, 200, { turno: 'tarde' }),
      entry('tB1', B, A, 200, { turno: 'tarde' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('mA1')).toBe('confirmado')
    expect(result.get('mB1')).toBe('confirmado')
    expect(result.get('tA1')).toBe('confirmado')
    expect(result.get('tB1')).toBe('confirmado')
  })
})

// ─── CASO 3 ──────────────────────────────────────────────────────────────────
// Pares diferentes por turno — cada um cruza com seu parceiro correto
describe('Caso 3 — pares diferentes por turno', () => {
  it('A+B confirmam de manhã e A+C confirmam de tarde, sem cruzamento errado', () => {
    const entries = [
      entry('ab_m_A', A, B, 400, { turno: 'manha' }),
      entry('ab_m_B', B, A, 400, { turno: 'manha' }),
      entry('ac_t_A', A, C, 350, { turno: 'tarde' }),
      entry('ac_t_C', C, A, 350, { turno: 'tarde' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('ab_m_A')).toBe('confirmado')
    expect(result.get('ab_m_B')).toBe('confirmado')
    expect(result.get('ac_t_A')).toBe('confirmado')
    expect(result.get('ac_t_C')).toBe('confirmado')
  })

  it('registro sem par no turno correto fica pendente', () => {
    const entries = [
      // A registrou manhã mas B registrou tarde → sem cruzamento
      entry('a_manha', A, B, 400, { turno: 'manha' }),
      entry('b_tarde', B, A, 400, { turno: 'tarde' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('a_manha')).toBe('pendente')
    expect(result.get('b_tarde')).toBe('pendente')
  })
})

// ─── CASO 4 ──────────────────────────────────────────────────────────────────
// Mesmo par, mesma sacola, mas turnos diferentes → pendente (sem par correspondente)
describe('Caso 4 — turnos divergentes entre par', () => {
  it('fica pendente quando A registra manhã e B registra tarde para a mesma sacola', () => {
    const entries = [
      entry('a1', A, B, 500, { turno: 'manha' }),
      entry('b1', B, A, 500, { turno: 'tarde' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('a1')).toBe('pendente')
    expect(result.get('b1')).toBe('pendente')
  })

  it('também fica pendente com sacola igual mas marca diferente', () => {
    const entries = [
      entry('a2', A, B, 500, { turno: 'unico', marca: 'Hering' }),
      entry('b2', B, A, 500, { turno: 'unico', marca: 'Malwee' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('a2')).toBe('pendente')
    expect(result.get('b2')).toBe('pendente')
  })

  it('também fica pendente com tamanho diferente', () => {
    const entries = [
      entry('a3', A, B, 500, { turno: 'unico', tamanho: '30x45' }),
      entry('b3', B, A, 500, { turno: 'unico', tamanho: '40x60' }),
    ]
    const result = validarCruzamento(entries)
    expect(result.get('a3')).toBe('pendente')
    expect(result.get('b3')).toBe('pendente')
  })
})
