import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enviarPushParaUsuario, notificarAdmins } from '@/lib/push'
import { logAudit } from '@/lib/audit'
import {
  auditarPar,
  descreverMotivos,
  type PerfilColaborador,
  type ResultadoAuditoria,
} from '@/lib/auditoria'

type ServerClient = ReturnType<typeof createClient>

export interface ConferirResultado {
  matched: boolean
  novoStatus?: 'confirmado' | 'divergente'
  observacao?: string | null
}

/**
 * Conferência automática de um par de lançamentos (a "conferência espelho").
 *
 * Centraliza a lógica antes duplicada entre POST /api/producao e
 * PATCH /api/producao/[id]: localiza o lançamento espelho do parceiro, audita
 * quantidade E função (via lib/auditoria), atualiza o status + observação dos
 * dois lançamentos e dispara as notificações. Quando há divergência, registra
 * em audit_logs.
 */
export async function conferirEAtualizarPar(
  supabase: ServerClient,
  entryId: string,
): Promise<ConferirResultado> {
  const { data: entry } = await supabase
    .from('production_entries')
    .select('id, colaborador_id, parceiro_id, quinzena_id, data_producao, marca, tamanho, funcao, quantidade')
    .eq('id', entryId)
    .single()

  if (!entry) return { matched: false }

  // Casa com o espelho pendente OU divergente: assim, quando o colaborador
  // corrige a função num lançamento travado, o par é re-auditado e pode voltar
  // a 'confirmado' automaticamente. (limit(1) evita erro caso haja duplicidade.)
  const { data: espelho } = await supabase
    .from('production_entries')
    .select('id, colaborador_id, funcao, quantidade')
    .eq('quinzena_id', entry.quinzena_id)
    .eq('colaborador_id', entry.parceiro_id)
    .eq('parceiro_id', entry.colaborador_id)
    .eq('data_producao', entry.data_producao)
    .eq('marca', entry.marca)
    .eq('tamanho', entry.tamanho)
    .in('status', ['pendente', 'divergente'])
    .neq('id', entry.id)
    .order('status', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!espelho) return { matched: false }

  // Perfis (função habitual) — admin client para não depender de RLS entre usuários
  const db = createAdminClient()
  const { data: perfisData } = await db
    .from('users')
    .select('id, nome, funcao')
    .in('id', [entry.colaborador_id, espelho.colaborador_id])

  const perfis = new Map<string, PerfilColaborador>(
    (perfisData ?? []).map((p) => [p.id, p as PerfilColaborador]),
  )
  const nomes: Record<string, string> = {}
  for (const p of perfisData ?? []) nomes[p.id] = p.nome

  const resultado = auditarPar(
    { colaborador_id: entry.colaborador_id, funcao: entry.funcao, quantidade: entry.quantidade },
    { colaborador_id: espelho.colaborador_id, funcao: espelho.funcao, quantidade: espelho.quantidade },
    perfis.get(entry.colaborador_id),
    perfis.get(espelho.colaborador_id),
  )

  const novoStatus: 'confirmado' | 'divergente' = resultado.divergente ? 'divergente' : 'confirmado'
  const observacao = resultado.divergente ? descreverMotivos(resultado, nomes) : null

  await supabase
    .from('production_entries')
    .update({ status: novoStatus, observacao })
    .in('id', [entry.id, espelho.id])

  await notificarPar(
    entry.colaborador_id,
    espelho.colaborador_id,
    resultado,
    nomes,
    entry.quantidade,
    espelho.quantidade,
  )

  if (resultado.divergente) {
    await logAudit('divergencia_detectada', {
      tabela: 'production_entries',
      registroId: entry.id,
      payload: { motivos: resultado.motivos, suspeitos: resultado.suspeitos },
    })
  }

  return { matched: true, novoStatus, observacao }
}

/**
 * Notifica os dois colaboradores e (quando há divergência) os administradores,
 * com mensagens específicas por tipo de divergência.
 */
async function notificarPar(
  idA: string,
  idB: string,
  resultado: ResultadoAuditoria,
  nomes: Record<string, string>,
  qtdA: number,
  qtdB: number,
) {
  if (!resultado.divergente) {
    await Promise.all([
      enviarPushParaUsuario(
        idA,
        '✅ Registro confirmado!',
        `Seu lançamento de ${qtdA} unidades foi confirmado automaticamente.`,
        '/colaborador/producoes',
      ),
      enviarPushParaUsuario(
        idB,
        '✅ Registro confirmado!',
        `Seu lançamento de ${qtdB} unidades foi confirmado automaticamente.`,
        '/colaborador/producoes',
      ),
    ])
    return
  }

  const temFuncao = resultado.motivos.includes('funcao')
  const corpoColab = temFuncao
    ? 'Confira a função anotada no lançamento com seu parceiro — pode haver troca de pintor/ajudante. O admin irá verificar.'
    : 'As quantidades registradas com seu parceiro não coincidem. O admin irá verificar.'

  await Promise.all([
    enviarPushParaUsuario(idA, '⚠️ Divergência encontrada', corpoColab, '/colaborador/producoes'),
    enviarPushParaUsuario(idB, '⚠️ Divergência encontrada', corpoColab, '/colaborador/producoes'),
  ])

  const tituloAdmin = temFuncao ? '⚠️ Possível erro de função' : '⚠️ Divergência de quantidade'
  const corpoAdmin = `${nomes[idA] ?? 'Colaborador'} × ${nomes[idB] ?? 'parceiro'}: ${descreverMotivos(resultado, nomes)}`
  await notificarAdmins(tituloAdmin, corpoAdmin, '/admin/lancamentos')
}
