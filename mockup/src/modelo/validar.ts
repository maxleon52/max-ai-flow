import { isAfter, isValid, parseISO } from 'date-fns'
import { todasAsEtapas } from './esteira.ts'
import type { Esteira, Etapa, Evidencia, Execucao, Id, Instante, Processo, Registro } from './tipos.ts'

/**
 * Regras que os tipos sozinhos não pegam: ids repetidos, conexões para etapas que não existem,
 * verde comprovado sem evidência, mãe feita com filha pendente... Devolve a lista de problemas;
 * vazia = válido.
 */
export interface Problema {
  /** Onde está o problema, legível (ex.: `etapa "verificar"`). */
  onde: string
  mensagem: string
}

export function validarProcesso(processo: Processo): Problema[] {
  const problemas: Problema[] = []
  const erro = (onde: string, mensagem: string) => problemas.push({ onde, mensagem })

  const fontes = new Set<Id>()
  for (const fonte of processo.fontes) {
    if (fontes.has(fonte.id)) erro(`fonte "${fonte.id}"`, 'id repetido')
    fontes.add(fonte.id)
  }

  const ids = new Set<Id>()
  for (const { etapa } of todasAsEtapas(processo.esteira)) {
    const onde = `etapa "${etapa.id}"`
    if (ids.has(etapa.id)) erro(onde, 'id repetido no processo')
    ids.add(etapa.id)
    if (etapa.origens.length === 0) erro(onde, 'sem origem: toda etapa do mapa vem de um trecho de fonte')
    validarEtapa(etapa, fontes, erro)
  }

  validarConexoes(processo.esteira, 'primeiro nível', erro)
  return problemas
}

function validarEtapa(etapa: Etapa, fontes: Set<Id>, erro: (onde: string, msg: string) => void) {
  const onde = `etapa "${etapa.id}"`
  if (!etapa.nome.trim()) erro(onde, 'nome vazio')
  if (etapa.tipo === 'portao-humano' && etapa.ator !== 'voce') {
    erro(onde, `portão humano é executado por "voce", não por "${etapa.ator}"`)
  }
  if (etapa.alvo && etapa.alvo === etapa.ator) erro(onde, 'alvo igual ao ator')
  for (const { fonte, linhas } of etapa.origens) {
    if (!fontes.has(fonte)) erro(onde, `origem aponta para a fonte "${fonte}", que não existe`)
    if (linhas.de < 1 || linhas.ate < linhas.de) erro(onde, `linhas ${linhas.de}–${linhas.ate} inválidas`)
  }
  if (etapa.subpassos) validarConexoes(etapa.subpassos, `sub-passos de "${etapa.id}"`, erro)
}

function validarConexoes(esteira: Esteira, nivel: string, erro: (onde: string, msg: string) => void) {
  const irmas = new Set(esteira.etapas.map((e) => e.id))
  const vistas = new Set<string>()
  for (const { de, para } of esteira.conexoes) {
    const onde = `conexão ${de} → ${para} (${nivel})`
    if (!irmas.has(de)) erro(onde, `"${de}" não é etapa deste nível`)
    if (!irmas.has(para)) erro(onde, `"${para}" não é etapa deste nível`)
    if (vistas.has(`${de}→${para}`)) erro(onde, 'conexão repetida')
    vistas.add(`${de}→${para}`)
  }
}

export function validarExecucao(execucao: Execucao, processo: Processo): Problema[] {
  const problemas: Problema[] = []
  const erro = (onde: string, mensagem: string) => problemas.push({ onde, mensagem })
  const instante = (onde: string, valor: Instante) => {
    if (!isValid(parseISO(valor))) erro(onde, `instante "${valor}" não é ISO 8601 válido`)
  }

  if (execucao.processo !== processo.id) {
    erro('execução', `é do processo "${execucao.processo}", não de "${processo.id}"`)
  }
  instante('execução', execucao.iniciadaEm)
  if (execucao.terminadaEm) {
    instante('execução', execucao.terminadaEm)
    if (!isAfter(parseISO(execucao.terminadaEm), parseISO(execucao.iniciadaEm))) {
      erro('execução', 'termina antes de começar')
    }
  }

  // Etapas conhecidas: as do mapa e as da raia de extras.
  const etapas = new Map<Id, Etapa>()
  const filhas = new Map<Id, Id[]>()
  for (const { etapa } of todasAsEtapas(processo.esteira)) {
    etapas.set(etapa.id, etapa)
    filhas.set(etapa.id, etapa.subpassos?.etapas.map((e) => e.id) ?? [])
  }
  const doMapa = new Set(etapas.keys())

  for (const { etapa, depoisDe } of execucao.extras) {
    const onde = `extra "${etapa.id}"`
    if (etapas.has(etapa.id)) erro(onde, 'id já usado por outra etapa')
    if (!doMapa.has(depoisDe)) erro(onde, `pedido depois de "${depoisDe}", que não existe no mapa`)
    for (const { etapa: e } of todasAsEtapas({ etapas: [etapa], conexoes: [] })) etapas.set(e.id, e)
  }

  for (const bloco of execucao.naoClassificados) {
    const onde = `não classificado "${bloco.id}"`
    if (etapas.has(bloco.id)) erro(onde, 'id já usado por uma etapa')
    if (bloco.evidencias.length === 0) erro(onde, 'sem evidência: o que foi que não se encaixou?')
    bloco.evidencias.forEach((ev) => validarEvidencia(ev, onde, instante, erro))
  }

  for (const [id, registro] of Object.entries(execucao.registros)) {
    const onde = `registro "${id}"`
    if (!etapas.has(id)) {
      erro(onde, 'não há etapa com esse id no mapa nem nos extras')
      continue
    }
    validarRegistro(registro, onde, etapas, instante, erro)

    // O estado se propaga para cima: mãe feita não pode ter filha pendente ou com falha.
    if (registro.situacao.estado === 'feita') {
      for (const filha of filhas.get(id) ?? []) {
        const estado = execucao.registros[filha]?.situacao.estado ?? 'prevista'
        if (!['feita', 'pulada'].includes(estado)) {
          erro(onde, `está feita, mas o sub-passo "${filha}" está "${estado}"`)
        }
      }
    }
  }

  return problemas
}

function validarRegistro(
  registro: Registro,
  onde: string,
  etapas: Map<Id, Etapa>,
  instante: (onde: string, valor: Instante) => void,
  erro: (onde: string, msg: string) => void,
) {
  const { situacao, evidencias } = registro
  if ('desde' in situacao) instante(onde, situacao.desde)
  if ('em' in situacao) instante(onde, situacao.em)
  evidencias.forEach((ev) => validarEvidencia(ev, onde, instante, erro))

  if (situacao.estado === 'desatualizada' && !etapas.has(situacao.causa)) {
    erro(onde, `desatualizada por "${situacao.causa}", que não existe`)
  }
  if (situacao.estado === 'pulada' && !situacao.justificativa.trim()) {
    erro(onde, 'pulada sem justificativa (sem ela, é vermelho, não amarelo)')
  }
  if (situacao.estado === 'feita' && situacao.prova === 'comprovada' && !evidencias.some(comprova)) {
    erro(
      onde,
      'verde comprovado sem evidência que comprove (arquivo, comando com critério atendido ou confirmação do usuário)',
    )
  }
}

/** A evidência sustenta um verde comprovado? (CONCEPCAO §7, "Verde comprovado") */
function comprova(evidencia: Evidencia): boolean {
  switch (evidencia.tipo) {
    case 'arquivo':
    case 'confirmacao':
      return true
    case 'comando':
      return evidencia.codigoDeSaida === 0 && evidencia.criterio?.atendido === true
    case 'link':
    case 'leitura':
      return false
  }
}

function validarEvidencia(
  evidencia: Evidencia,
  onde: string,
  instante: (onde: string, valor: Instante) => void,
  erro: (onde: string, msg: string) => void,
) {
  instante(onde, evidencia.em)
  if (evidencia.tipo === 'comando' && evidencia.criterio?.atendido && evidencia.codigoDeSaida !== 0) {
    erro(onde, `"${evidencia.comando}" saiu com ${evidencia.codigoDeSaida}, mas o critério consta como atendido`)
  }
}
