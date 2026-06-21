import type { UserRole } from '@/types'

/**
 * Módulo puro de auditoria de lançamentos de produção.
 *
 * Regra de negócio: toda dupla de trabalho é SEMPRE composta por um pintor e
 * um ajudante (funções complementares). A "conferência espelho" já valida a
 * quantidade entre os dois lançamentos do par; aqui adicionamos a validação de
 * função — se os dois marcaram a MESMA função, o par é inválido (caso real:
 * Pedro era ajudante mas anotou-se como pintor, mesma função que o Edynardo).
 *
 * Sem dependência de banco/IO — testável isoladamente.
 */

export type MotivoDivergencia = 'quantidade' | 'funcao'

export interface LancamentoAuditoria {
  colaborador_id: string
  funcao: string
  quantidade: number
}

export interface PerfilColaborador {
  id: string
  nome: string
  funcao: UserRole
}

export interface Suspeito {
  colaborador_id: string
  campo: 'funcao'
  /** função habitual do perfil ('' quando não há perfil para comparar) */
  esperado: string
  /** função registrada no lançamento */
  registrado: string
}

export interface ResultadoAuditoria {
  divergente: boolean
  motivos: MotivoDivergencia[]
  suspeitos: Suspeito[]
}

const FUNCOES_OPERACIONAIS = ['pintor', 'ajudante'] as const

/**
 * Um par é válido quando as funções são complementares: exatamente um pintor
 * e um ajudante. Funções iguais (dois pintores / dois ajudantes) ou valores
 * fora do conjunto operacional são considerados não-complementares.
 */
export function funcoesComplementares(a: string, b: string): boolean {
  return (
    a !== b &&
    (FUNCOES_OPERACIONAIS as readonly string[]).includes(a) &&
    (FUNCOES_OPERACIONAIS as readonly string[]).includes(b)
  )
}

/**
 * Audita um par espelhado (dois lançamentos recíprocos de uma mesma dupla).
 * Acumula motivos de divergência e aponta o(s) suspeito(s) do erro de função
 * cruzando a função registrada com a função habitual do perfil.
 */
export function auditarPar(
  entryA: LancamentoAuditoria,
  entryB: LancamentoAuditoria,
  perfilA: PerfilColaborador | undefined,
  perfilB: PerfilColaborador | undefined,
): ResultadoAuditoria {
  const motivos: MotivoDivergencia[] = []
  const suspeitos: Suspeito[] = []

  // 1. Quantidade (comportamento já existente na conferência espelho)
  if (entryA.quantidade !== entryB.quantidade) {
    motivos.push('quantidade')
  }

  // 2. Função: deve ser complementar (um pintor + um ajudante)
  if (!funcoesComplementares(entryA.funcao, entryB.funcao)) {
    motivos.push('funcao')

    // Aponta o suspeito: quem registrou função diferente da habitual (perfil).
    for (const [entry, perfil] of [
      [entryA, perfilA],
      [entryB, perfilB],
    ] as const) {
      if (perfil && perfil.funcao !== 'admin' && entry.funcao !== perfil.funcao) {
        suspeitos.push({
          colaborador_id: entry.colaborador_id,
          campo: 'funcao',
          esperado: perfil.funcao,
          registrado: entry.funcao,
        })
      }
    }

    // Se nenhum destoa do próprio perfil (ou faltam perfis), marca os dois
    // para conferência manual.
    if (suspeitos.length === 0) {
      suspeitos.push(
        { colaborador_id: entryA.colaborador_id, campo: 'funcao', esperado: '', registrado: entryA.funcao },
        { colaborador_id: entryB.colaborador_id, campo: 'funcao', esperado: '', registrado: entryB.funcao },
      )
    }
  }

  return { divergente: motivos.length > 0, motivos, suspeitos }
}

/**
 * Checagem advisória de um lançamento isolado (sem espelho ainda): sinaliza
 * quando a função registrada destoa da função habitual do perfil. Não é
 * conclusiva — serve de alerta na varredura de pendentes.
 */
export function auditarLancamentoSolo(
  entry: LancamentoAuditoria,
  perfil: PerfilColaborador | undefined,
): Suspeito | null {
  if (perfil && perfil.funcao !== 'admin' && entry.funcao !== perfil.funcao) {
    return {
      colaborador_id: entry.colaborador_id,
      campo: 'funcao',
      esperado: perfil.funcao,
      registrado: entry.funcao,
    }
  }
  return null
}

/**
 * Texto legível do(s) motivo(s) para gravar em `observacao` e nas notificações.
 */
export function descreverMotivos(
  resultado: ResultadoAuditoria,
  nomes: Record<string, string> = {},
): string {
  const partes: string[] = []

  if (resultado.motivos.includes('quantidade')) {
    partes.push('Quantidades não coincidem entre a dupla.')
  }

  if (resultado.motivos.includes('funcao')) {
    const comPerfil = resultado.suspeitos.filter((s) => s.esperado)
    if (comPerfil.length > 0) {
      const desc = comPerfil
        .map((s) => `${nomes[s.colaborador_id] ?? 'Colaborador'} marcou ${s.registrado} (perfil é ${s.esperado})`)
        .join('; ')
      partes.push(`Função em conflito: ${desc}.`)
    } else {
      partes.push('Função em conflito: a dupla marcou a mesma função (deve ser um pintor e um ajudante).')
    }
  }

  return partes.join(' ')
}
