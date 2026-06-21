import {
  auditarPar,
  auditarLancamentoSolo,
  funcoesComplementares,
  descreverMotivos,
  type PerfilColaborador,
} from '@/lib/auditoria'

const PEDRO: PerfilColaborador = { id: 'pedro', nome: 'Pedro', funcao: 'ajudante' }
const EDYNARDO: PerfilColaborador = { id: 'edy', nome: 'Edynardo', funcao: 'pintor' }

describe('funcoesComplementares', () => {
  it('pintor + ajudante → complementares', () => {
    expect(funcoesComplementares('pintor', 'ajudante')).toBe(true)
    expect(funcoesComplementares('ajudante', 'pintor')).toBe(true)
  })

  it('mesma função → não complementares', () => {
    expect(funcoesComplementares('pintor', 'pintor')).toBe(false)
    expect(funcoesComplementares('ajudante', 'ajudante')).toBe(false)
  })

  it('valor fora do conjunto operacional → não complementar', () => {
    expect(funcoesComplementares('pintor', 'admin')).toBe(false)
    expect(funcoesComplementares('pintor', '')).toBe(false)
  })
})

describe('auditarPar — par válido', () => {
  it('pintor + ajudante com mesma quantidade → sem divergência', () => {
    const r = auditarPar(
      { colaborador_id: 'edy', funcao: 'pintor', quantidade: 100 },
      { colaborador_id: 'pedro', funcao: 'ajudante', quantidade: 100 },
      EDYNARDO,
      PEDRO,
    )
    expect(r.divergente).toBe(false)
    expect(r.motivos).toEqual([])
    expect(r.suspeitos).toEqual([])
  })
})

describe('auditarPar — divergência de função (caso Pedro/Edynardo)', () => {
  it('ambos marcaram pintor → divergente, suspeito é quem destoa do perfil (Pedro)', () => {
    const r = auditarPar(
      { colaborador_id: 'edy', funcao: 'pintor', quantidade: 100 },
      { colaborador_id: 'pedro', funcao: 'pintor', quantidade: 100 },
      EDYNARDO,
      PEDRO,
    )
    expect(r.divergente).toBe(true)
    expect(r.motivos).toContain('funcao')
    expect(r.motivos).not.toContain('quantidade')
    expect(r.suspeitos).toHaveLength(1)
    expect(r.suspeitos[0]).toMatchObject({
      colaborador_id: 'pedro',
      esperado: 'ajudante',
      registrado: 'pintor',
    })
  })

  it('descreverMotivos cita o nome e o perfil do suspeito', () => {
    const r = auditarPar(
      { colaborador_id: 'edy', funcao: 'pintor', quantidade: 100 },
      { colaborador_id: 'pedro', funcao: 'pintor', quantidade: 100 },
      EDYNARDO,
      PEDRO,
    )
    const texto = descreverMotivos(r, { pedro: 'Pedro', edy: 'Edynardo' })
    expect(texto).toContain('Pedro')
    expect(texto).toContain('ajudante')
  })
})

describe('auditarPar — divergência de quantidade (regressão)', () => {
  it('funções complementares mas quantidades diferentes → motivo quantidade', () => {
    const r = auditarPar(
      { colaborador_id: 'edy', funcao: 'pintor', quantidade: 100 },
      { colaborador_id: 'pedro', funcao: 'ajudante', quantidade: 95 },
      EDYNARDO,
      PEDRO,
    )
    expect(r.divergente).toBe(true)
    expect(r.motivos).toEqual(['quantidade'])
    expect(r.suspeitos).toEqual([])
  })
})

describe('auditarPar — quantidade E função divergentes', () => {
  it('acumula os dois motivos', () => {
    const r = auditarPar(
      { colaborador_id: 'edy', funcao: 'pintor', quantidade: 100 },
      { colaborador_id: 'pedro', funcao: 'pintor', quantidade: 95 },
      EDYNARDO,
      PEDRO,
    )
    expect(r.divergente).toBe(true)
    expect(r.motivos).toEqual(expect.arrayContaining(['quantidade', 'funcao']))
  })
})

describe('auditarPar — ambos os perfis divergem (ou faltam)', () => {
  it('os dois com perfil = pintor mas registraram ajudante → marca os dois como suspeitos', () => {
    const r = auditarPar(
      { colaborador_id: 'a', funcao: 'ajudante', quantidade: 100 },
      { colaborador_id: 'b', funcao: 'ajudante', quantidade: 100 },
      { id: 'a', nome: 'A', funcao: 'pintor' },
      { id: 'b', nome: 'B', funcao: 'pintor' },
    )
    expect(r.divergente).toBe(true)
    expect(r.suspeitos.map((s) => s.colaborador_id).sort()).toEqual(['a', 'b'])
  })

  it('sem perfis → divergente de função com os dois para conferência', () => {
    const r = auditarPar(
      { colaborador_id: 'a', funcao: 'pintor', quantidade: 100 },
      { colaborador_id: 'b', funcao: 'pintor', quantidade: 100 },
      undefined,
      undefined,
    )
    expect(r.divergente).toBe(true)
    expect(r.suspeitos).toHaveLength(2)
  })
})

describe('auditarLancamentoSolo', () => {
  it('função registrada destoa do perfil → suspeita', () => {
    const s = auditarLancamentoSolo({ colaborador_id: 'pedro', funcao: 'pintor', quantidade: 100 }, PEDRO)
    expect(s).toMatchObject({ colaborador_id: 'pedro', esperado: 'ajudante', registrado: 'pintor' })
  })

  it('função registrada bate com o perfil → sem suspeita', () => {
    const s = auditarLancamentoSolo({ colaborador_id: 'edy', funcao: 'pintor', quantidade: 100 }, EDYNARDO)
    expect(s).toBeNull()
  })
})
