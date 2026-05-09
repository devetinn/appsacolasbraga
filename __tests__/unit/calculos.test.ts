import { calcularValorProducao } from '@/lib/calculos'

const AJUDANTE  = 20.00 // R$/milheiro
const IMPRESSOR = 25.00 // R$/milheiro

describe('calcularValorProducao — ajudante (R$20,00/milheiro)', () => {
  it('300 unidades → proporcional → R$6,00', () => {
    expect(calcularValorProducao(300, AJUDANTE)).toBeCloseTo(6.00, 2)
  })

  it('499 unidades → proporcional → R$9,98', () => {
    expect(calcularValorProducao(499, AJUDANTE)).toBeCloseTo(9.98, 2)
  })

  it('500 unidades → benefício (início da faixa) → R$20,00', () => {
    expect(calcularValorProducao(500, AJUDANTE)).toBe(20.00)
  })

  it('800 unidades → benefício (meio da faixa) → R$20,00', () => {
    expect(calcularValorProducao(800, AJUDANTE)).toBe(20.00)
  })

  it('999 unidades → benefício (fim da faixa) → R$20,00', () => {
    expect(calcularValorProducao(999, AJUDANTE)).toBe(20.00)
  })

  it('1.000 unidades → proporcional exato → R$20,00', () => {
    expect(calcularValorProducao(1000, AJUDANTE)).toBeCloseTo(20.00, 2)
  })

  it('1.500 unidades → proporcional → R$30,00', () => {
    expect(calcularValorProducao(1500, AJUDANTE)).toBeCloseTo(30.00, 2)
  })

  it('2.300 unidades → proporcional → R$46,00', () => {
    expect(calcularValorProducao(2300, AJUDANTE)).toBeCloseTo(46.00, 2)
  })
})

describe('calcularValorProducao — impressor (R$25,00/milheiro)', () => {
  it('300 unidades → proporcional → R$7,50', () => {
    expect(calcularValorProducao(300, IMPRESSOR)).toBeCloseTo(7.50, 2)
  })

  it('800 unidades → benefício → R$25,00', () => {
    expect(calcularValorProducao(800, IMPRESSOR)).toBe(25.00)
  })

  it('1.500 unidades → proporcional → R$37,50', () => {
    expect(calcularValorProducao(1500, IMPRESSOR)).toBeCloseTo(37.50, 2)
  })
})

describe('calcularValorProducao — limites da faixa de benefício', () => {
  it('499 → fora da faixa (abaixo)', () => {
    expect(calcularValorProducao(499, AJUDANTE)).toBeLessThan(AJUDANTE)
  })

  it('500 → dentro da faixa', () => {
    expect(calcularValorProducao(500, AJUDANTE)).toBe(AJUDANTE)
  })

  it('999 → dentro da faixa', () => {
    expect(calcularValorProducao(999, AJUDANTE)).toBe(AJUDANTE)
  })

  it('1000 → fora da faixa (acima) — paga exato 1 milheiro proporcional', () => {
    expect(calcularValorProducao(1000, AJUDANTE)).toBe(AJUDANTE)
  })
})
