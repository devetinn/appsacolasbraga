export interface QuinzenaInfo {
  inicio: Date
  fim: Date
  data_pagamento: Date
}

export function getQuinzenaAtiva(hoje: Date = new Date()): QuinzenaInfo {
  const dia = hoje.getDate()
  const mes = hoje.getMonth()
  const ano = hoje.getFullYear()

  if (dia >= 5 && dia <= 19) {
    // Q1: dia 05 ao dia 19, pagamento no dia 20
    return {
      inicio: new Date(ano, mes, 5),
      fim: new Date(ano, mes, 19),
      data_pagamento: new Date(ano, mes, 20),
    }
  } else {
    // Q2: dia 20 ao dia 04 do mês seguinte
    const inicioMes = dia >= 20 ? mes : mes - 1
    const inicioAno = inicioMes < 0 ? ano - 1 : ano
    const mesCorrigido = (inicioMes + 12) % 12
    const fimMes = (mesCorrigido + 1) % 12
    const fimAno = fimMes === 0 ? inicioAno + 1 : inicioAno

    return {
      inicio: new Date(inicioAno, mesCorrigido, 20),
      fim: new Date(fimAno, fimMes, 4),
      data_pagamento: new Date(fimAno, fimMes, 5),
    }
  }
}

export function diasAteProximoPagamento(hoje: Date = new Date()): number {
  const { data_pagamento } = getQuinzenaAtiva(hoje)
  const diff = data_pagamento.getTime() - hoje.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function formatarData(date: Date): string {
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}
