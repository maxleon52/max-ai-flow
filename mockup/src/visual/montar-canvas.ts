import { MarkerType, type BuiltInEdge, type Node } from '@xyflow/react'
import { format, parseISO } from 'date-fns'
import { estadoVisual, type EstadoVisual } from '../modelo/estado-visual.ts'
import type { Etapa, Execucao, Processo, Situacao, TipoDeAtor } from '../modelo/tipos.ts'
import { nomePadraoDoAtor, tiposDeAtor } from './atores.ts'
import { estaAtivo, estaConcluido, estadosVisuais } from './estados.ts'
import type { Variacao } from './variacoes.ts'

export interface AtorExibido extends Record<string, unknown> {
  tipo: TipoDeAtor
  nome: string
}

export interface DadosDoBloco extends Record<string, unknown> {
  etapa: Etapa
  estado: EstadoVisual
  ator: AtorExibido
  alvo?: AtorExibido
  /** Estado de cada sub-passo, na ordem: vira as bolinhas de progresso. */
  filhos: EstadoVisual[]
  /** Uma linha a mais, tirada da situação (justificativa, do que depende, desde quando...). */
  detalhe?: string
}

export type NoBloco = Node<DadosDoBloco, 'bloco'>
export type NoAtor = Node<AtorExibido, 'ator'>
export type NoTitulo = Node<{ texto: string; subtitulo?: string }, 'titulo'>
export type NoDoCanvas = NoBloco | NoAtor | NoTitulo

export interface DadosDaConexao extends Record<string, unknown> {
  /** Já passou por ela. */
  percorrida: boolean
  /** Chega num bloco ativo agora. */
  ativa: boolean
}

/** Conexão nativa do React Flow (curva ou em ângulo reto), com `DadosDaConexao` em `data`. */
export type ConexaoDoCanvas = BuiltInEdge

/** Tamanho do bloco em cada variação; o layout provisório depende dele. */
export const tamanhoDoBloco: Record<Variacao, { largura: number; altura: number }> = {
  nitido: { largura: 264, altura: 112 },
  cena: { largura: 248, altura: 196 },
}

const tamanhoDaSeta: Record<Variacao, number> = { nitido: 24, cena: 16 }

const POR_LINHA = 4
const VAO_X = 100
const VAO_Y = 120

type Lado = 'esq' | 'dir' | 'cima' | 'baixo'

function detalheDa(situacao: Situacao): string | undefined {
  const hora = (iso: string) => format(parseISO(iso), 'HH:mm')
  switch (situacao.estado) {
    case 'prevista':
      return undefined
    case 'em-andamento':
      return `desde ${hora(situacao.desde)}`
    case 'aguardando-voce':
      return situacao.pergunta ?? `desde ${hora(situacao.desde)}`
    case 'feita':
      return `às ${hora(situacao.em)}`
    case 'pulada':
      return situacao.justificativa
    case 'bloqueada':
      return `depende de: ${situacao.dependeDe}`
    case 'desatualizada':
      return situacao.motivo
    case 'falhou':
      return situacao.motivo
  }
}

function atorExibido(tipo: TipoDeAtor, processo?: Processo): AtorExibido {
  return { tipo, nome: processo?.nomesDosAtores?.[tipo] ?? nomePadraoDoAtor[tipo] }
}

/**
 * Layout provisório (o automático é a 1.3): linhas de 4 em zigue-zague, para a esteira caber na
 * tela sem conexões cruzando a linha inteira.
 */
function posicaoNaGrade(indice: number, variacao: Variacao) {
  const { largura, altura } = tamanhoDoBloco[variacao]
  const linha = Math.floor(indice / POR_LINHA)
  const coluna = indice % POR_LINHA
  const colunaReal = linha % 2 === 0 ? coluna : POR_LINHA - 1 - coluna
  return { x: colunaReal * (largura + VAO_X), y: linha * (altura + VAO_Y), linha, coluna: colunaReal }
}

/** De que lado sai e por onde entra a conexão, conforme a posição das duas pontas na grade. */
function lados(de: { linha: number; coluna: number }, para: { linha: number; coluna: number }): [Lado, Lado] {
  if (de.linha === para.linha) {
    const sentido = de.linha % 2 === 0 ? 1 : -1 // linha par anda para a direita
    const avanca = (para.coluna - de.coluna) * sentido > 0
    if (!avanca) return ['cima', 'cima'] // laço: arco por cima
    return sentido > 0 ? ['dir', 'esq'] : ['esq', 'dir']
  }
  return para.linha > de.linha ? ['baixo', 'cima'] : ['cima', 'baixo']
}

export function montarCanvas(processo: Processo, execucao: Execucao, variacao: Variacao) {
  const nos: NoDoCanvas[] = []
  const conexoes: ConexaoDoCanvas[] = []

  const estadoDe = (id: string): EstadoVisual =>
    estadoVisual(execucao.registros[id]?.situacao ?? { estado: 'prevista' })

  // ─── A esteira do processo (primeiro nível) ───
  const grade = new Map<string, ReturnType<typeof posicaoNaGrade>>()
  processo.esteira.etapas.forEach((etapa, indice) => {
    const posicao = posicaoNaGrade(indice, variacao)
    grade.set(etapa.id, posicao)
    const situacao = execucao.registros[etapa.id]?.situacao ?? { estado: 'prevista' }
    nos.push({
      id: etapa.id,
      type: 'bloco',
      position: { x: posicao.x, y: posicao.y },
      data: {
        etapa,
        estado: estadoVisual(situacao),
        ator: atorExibido(etapa.ator, processo),
        alvo: etapa.alvo ? atorExibido(etapa.alvo, processo) : undefined,
        filhos: etapa.subpassos?.etapas.map((filha) => estadoDe(filha.id)) ?? [],
        detalhe: detalheDa(situacao),
      },
    })
  })

  for (const { de, para, condicao } of processo.esteira.conexoes) {
    const origem = grade.get(de)
    const destino = grade.get(para)
    if (!origem || !destino) continue
    const [saida, entrada] = lados(origem, destino)
    const laco = saida === 'cima' && entrada === 'cima'
    const estadoDeOrigem = estadoDe(de)
    const estadoDeDestino = estadoDe(para)
    const percorrida = estaConcluido(estadoDeOrigem) && estadoDeDestino !== 'cinza'
    const ativa = estaConcluido(estadoDeOrigem) && estaAtivo(estadoDeDestino)
    const cor = ativa ? 'var(--cor-claude)' : percorrida ? 'var(--conexao-percorrida)' : 'var(--borda-forte)'
    const comum = {
      id: `${de}->${para}`,
      source: de,
      target: para,
      sourceHandle: `${saida}-s`,
      targetHandle: `${entrada}-t`,
      // O tamanho da seta acompanha a espessura da linha; linha fina pede seta maior.
      markerEnd: { type: MarkerType.ArrowClosed, color: cor, width: tamanhoDaSeta[variacao], height: tamanhoDaSeta[variacao] },
      label: condicao,
      animated: ativa,
      className: [percorrida && 'percorrida', ativa && 'ativa'].filter(Boolean).join(' '),
      data: { percorrida, ativa } satisfies DadosDaConexao,
    }
    conexoes.push(
      // Laço: colchete por cima dos blocos; o resto, curva.
      laco
        ? { ...comum, type: 'smoothstep', pathOptions: { offset: 34, borderRadius: 18 } }
        : { ...comum, type: 'default' },
    )
  }

  // ─── Catálogo: um bloco em cada estado e os atores ───
  const { largura, altura } = tamanhoDoBloco[variacao]
  const linhasDaEsteira = Math.ceil(processo.esteira.etapas.length / POR_LINHA)
  let y = linhasDaEsteira * (altura + VAO_Y) + 80

  nos.push({
    id: 'titulo-estados',
    type: 'titulo',
    position: { x: 0, y },
    data: { texto: 'Estados', subtitulo: 'Um bloco em cada estado.' },
    draggable: false,
  })
  y += 90
  estadosVisuais.forEach((estado, indice) => {
    const exemplo = exemplosDeEstado[estado]
    const coluna = indice % 5
    const linha = Math.floor(indice / 5)
    nos.push({
      id: `estado-${estado}`,
      type: 'bloco',
      position: { x: coluna * (largura + 48), y: y + linha * (altura + 56) },
      data: {
        etapa: {
          id: `estado-${estado}`,
          nome: exemplo.nome,
          tipo: exemplo.ator === 'voce' ? 'portao-humano' : 'julgamento',
          ator: exemplo.ator,
          alvo: exemplo.alvo,
          obrigatoria: true,
          origens: [],
        },
        estado,
        ator: atorExibido(exemplo.ator),
        alvo: exemplo.alvo ? atorExibido(exemplo.alvo) : undefined,
        filhos: exemplo.filhos ?? [],
        detalhe: exemplo.detalhe,
      },
    })
  })
  y += 2 * (altura + 56) + 40

  nos.push({
    id: 'titulo-atores',
    type: 'titulo',
    position: { x: 0, y },
    data: { texto: 'Atores', subtitulo: 'Cada participante tem um ícone e um lugar fixo na cena.' },
    draggable: false,
  })
  y += 90
  tiposDeAtor.forEach((tipo, indice) => {
    nos.push({
      id: `ator-${tipo}`,
      type: 'ator',
      position: { x: indice * 150, y },
      data: atorExibido(tipo),
    })
  })

  return { nos, conexoes }
}

const exemplosDeEstado: Record<
  EstadoVisual,
  { nome: string; ator: TipoDeAtor; alvo?: TipoDeAtor; detalhe?: string; filhos?: EstadoVisual[] }
> = {
  cinza: { nome: 'Fechar o porte', ator: 'claude', alvo: 'documentacao', filhos: ['cinza', 'cinza', 'cinza'] },
  animando: {
    nome: 'Escrever os testes',
    ator: 'claude',
    alvo: 'testes',
    detalhe: 'desde 16:37',
    filhos: ['verde-comprovado', 'animando', 'cinza'],
  },
  'aguardando-voce': { nome: 'Aprovar o rascunho', ator: 'voce', alvo: 'claude', detalhe: 'Mesclou o PR #3?' },
  'verde-comprovado': {
    nome: 'Medir na API',
    ator: 'claude',
    alvo: 'api',
    detalhe: 'às 10:20',
    filhos: ['verde-comprovado', 'verde-comprovado'],
  },
  'verde-declarado': { nome: 'Dar o veredito', ator: 'claude', alvo: 'codigo', detalhe: 'às 10:26' },
  amarelo: { nome: 'Republicar o painel', ator: 'claude', alvo: 'documentacao', detalhe: 'o status não mudou' },
  bloqueado: { nome: 'Integrar com o back-end', ator: 'claude', alvo: 'api', detalhe: 'depende de: endpoint de Budget' },
  laranja: { nome: 'Verificar', ator: 'claude', alvo: 'codigo', detalhe: 'o código mudou depois' },
  vermelho: {
    nome: 'Rodar o lint',
    ator: 'claude',
    alvo: 'codigo',
    detalhe: '2 erros',
    filhos: ['verde-comprovado', 'vermelho'],
  },
  'nao-classificado': { nome: 'Leu uma skill de outro projeto', ator: 'claude', detalhe: 'não se encaixou em nenhuma etapa' },
}
