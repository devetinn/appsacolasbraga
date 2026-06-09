const UNIDADES = [
  '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
  'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove',
]

const DEZENAS = [
  '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa',
]

const CENTENAS = [
  '', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
  'seiscentos', 'setecentos', 'oitocentos', 'novecentos',
]

function grupo(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cem'

  const c = Math.floor(n / 100)
  const resto = n % 100
  const partes: string[] = []

  if (c > 0) partes.push(c === 1 && resto > 0 ? 'cento' : CENTENAS[c])

  if (resto > 0 && resto < 20) {
    partes.push(UNIDADES[resto])
  } else if (resto >= 20) {
    partes.push(DEZENAS[Math.floor(resto / 10)])
    if (resto % 10 > 0) partes.push(UNIDADES[resto % 10])
  }

  return partes.join(' e ')
}

export function valorPorExtenso(valor: number): string {
  if (valor === 0) return 'zero reais'

  const reais = Math.floor(valor)
  const centavos = Math.round((valor - reais) * 100)
  const resultado: string[] = []

  if (reais > 0) {
    const milhares = Math.floor(reais / 1000)
    const resto = reais % 1000
    const partesReais: string[] = []
    if (milhares > 0) partesReais.push(grupo(milhares) + ' mil')
    if (resto > 0) partesReais.push(grupo(resto))
    resultado.push(partesReais.join(' e ') + (reais === 1 ? ' real' : ' reais'))
  }

  if (centavos > 0) {
    resultado.push(grupo(centavos) + (centavos === 1 ? ' centavo' : ' centavos'))
  }

  return resultado.join(' e ')
}
