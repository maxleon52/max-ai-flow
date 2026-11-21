/**
 * Modelo de dados do fluxo (tarefa 0.3 do roadmap).
 *
 * Duas metades, de propósito separadas:
 * - **Processo** (o mapa): lido das fontes de processo do projeto (skill, comando, regra...).
 *   É o mesmo em toda sessão. Dá os blocos cinza, a ordem e o trecho de texto que gerou cada bloco.
 * - **Execução**: o que aconteceu numa sessão (`session_id`). Estado e evidência de cada etapa,
 *   a raia de extras e os blocos "não classificados". Local, fora do Git (CONCEPCAO §7, "Estado").
 *
 * Profundidade livre: processo → etapa → sub-passo → ... (CONCEPCAO §5, "Zoom").
 */

/** Identificador de etapa. Único no processo inteiro, em qualquer nível (a execução indexa por ele). */
export type Id = string

/** Data e hora em ISO 8601, com fuso (ex.: `2026-11-20T14:32:00-03:00`). */
export type Instante = string

// ─── Processo (o mapa) ───────────────────────────────────────────────────────

/**
 * Participantes da cena, cada um com ícone e lugar fixo (CONCEPCAO §5, "Atores").
 * O nome exibido varia por projeto (ver `Processo.nomesDosAtores`): `plataforma-git` é GitLab num
 * projeto e GitHub noutro.
 */
export type TipoDeAtor =
  | 'voce' // o desenvolvedor
  | 'claude' // a instância
  | 'codigo' // o repositório local
  | 'testes'
  | 'plataforma-git' // GitLab, GitHub: issues, MR/PR
  | 'api' // back-end
  | 'documentacao' // status, painel, massas, manual, roadmap
  | 'chamados' // sistema de tickets, Jira

/** Quem executa a etapa e, portanto, quando ela fica verde (CONCEPCAO §9.2). */
export type TipoDeEtapa =
  | 'deterministico' // script, sem IA: verde quando o script sai certo
  | 'julgamento' // o modelo: verde quando entrega no formato exigido
  | 'portao-humano' // o usuário: verde quando ele confirma

/** De que tipo de arquivo o processo foi lido. Um leitor por tipo na fase 2 (CONCEPCAO §10, item 1). */
export type TipoDeFonte =
  | 'skill'
  | 'comando' // .claude/commands
  | 'regra' // .claude/rules
  | 'claude-md'
  | 'memoria'
  | 'script' // scripts npm e afins
  | 'git-hook' // husky
  | 'ci'
  | 'andamento' // roadmap, checklist.json, spec

export interface Fonte {
  id: Id
  tipo: TipoDeFonte
  /** Caminho relativo à raiz do projeto, ou absoluto (memórias ficam fora do projeto). */
  caminho: string
}

/**
 * Mapa de linhas: o trecho de uma fonte que gerou o bloco. Serve para o cursor do Claude saber
 * para onde voar quando a fonte for editada (CONCEPCAO §9.5, "O caminho de volta").
 */
export interface Trecho {
  fonte: Id
  /** Linhas de 1 em diante, inclusivas. */
  linhas: { de: number; ate: number }
}

/**
 * Ligação entre duas etapas **irmãs** (do mesmo nível). Ramificação = duas conexões saindo da
 * mesma etapa, cada uma com sua condição; laço = conexão voltando para uma etapa anterior.
 */
export interface Conexao {
  de: Id
  para: Id
  /** Rótulo humano do caminho, quando há escolha (ex.: "relato não claro"). */
  condicao?: string
}

/**
 * Um nível de etapas com as ligações entre elas. Etapas sem nenhuma conexão são itens soltos,
 * sem ordem (ex.: "Status ✓ · Painel ⏳ · Manual ○"). Para o caso comum, ver `emSequencia`.
 */
export interface Esteira {
  etapas: Etapa[]
  conexoes: Conexao[]
}

export interface Etapa {
  id: Id
  /** Em linguagem humana, curto: "Criar testes unitários", não "lendo arquivo X". */
  nome: string
  /** Uma frase a mais, para o zoom. */
  descricao?: string
  tipo: TipoDeEtapa
  /** Quem age. */
  ator: TipoDeAtor
  /** Quem recebe, quando há movimento entre atores (o cartão voa de `ator` até `alvo`). */
  alvo?: TipoDeAtor
  /** Obrigatória não feita no fim da execução vira vermelho. */
  obrigatoria: boolean
  /** Pode vir de mais de uma fonte (ex.: passo da skill + memória que o complementa). */
  origens: Trecho[]
  subpassos?: Esteira
}

export interface Processo {
  id: Id
  /** Ex.: "Resolver ticket". */
  nome: string
  descricao?: string
  /** Nome curto do projeto (ex.: `ecnh-app`). */
  projeto: string
  fontes: Fonte[]
  /** Nome exibido de cada ator neste projeto. Ausente = nome padrão do tipo. */
  nomesDosAtores?: Partial<Record<TipoDeAtor, string>>
  esteira: Esteira
}

// ─── Execução (uma sessão) ───────────────────────────────────────────────────

/**
 * Situação de uma etapa numa execução. Etapa sem registro está `prevista`.
 * Correspondência com os estados visuais da CONCEPCAO §5: ver `estadoVisual`.
 */
export type Situacao =
  | { estado: 'prevista' }
  | { estado: 'em-andamento'; desde: Instante }
  /** Portão humano esperando: o Claude parou e a vez é do usuário. */
  | { estado: 'aguardando-voce'; desde: Instante; pergunta?: string }
  /** `comprovada` = veio de evidência que atende ao critério; `declarada` = só o modelo disse. */
  | { estado: 'feita'; em: Instante; prova: 'comprovada' | 'declarada' }
  | { estado: 'pulada'; em: Instante; justificativa: string }
  /**
   * Não dá para fazer agora: depende de algo de fora (ex.: "endpoint do back-end"). Diferente de
   * pulada (não vai ser feita) e de aguardando-voce (a vez é do usuário). Vem do `bloqueado` com
   * `dependeDe` do checklist.json do frontend-cd-refactory.
   */
  | { estado: 'bloqueada'; em: Instante; dependeDe: string }
  /** Algo depois dela mudou o que ela tinha produzido (CONCEPCAO §9.5, "Impacto"). */
  | { estado: 'desatualizada'; em: Instante; causa: Id; motivo: string }
  | { estado: 'falhou'; em: Instante; motivo: string }

export type Estado = Situacao['estado']

/**
 * O que os hooks viram acontecer. Fica pendurado no bloco e alimenta o nível 3 (dropdown)
 * e o verde comprovado. Leituras e buscas não viram bloco: ficam aqui (CONCEPCAO §5).
 */
export type Evidencia =
  | {
      tipo: 'arquivo'
      em: Instante
      caminho: string
      operacao: 'criado' | 'editado' | 'apagado'
      /** Escrito por um comando (script de status, painel), não pela ferramenta de edição. */
      porComando?: boolean
    }
  | {
      tipo: 'comando'
      em: Instante
      comando: string
      codigoDeSaida: number
      /** Resumo da saída, em linguagem humana (ex.: "124 testes, 0 pulados"). */
      resumo?: string
      /**
       * Critério de evidência do comando (CONCEPCAO §7): código 0 não basta.
       * Sem critério, a etapa só pode ficar verde **declarado**.
       */
      criterio?: { descricao: string; atendido: boolean }
    }
  | { tipo: 'link'; em: Instante; rotulo: string; url: string }
  /** O usuário confirmou no chat ("aprovado", "merge feito"): é a evidência do portão humano. */
  | { tipo: 'confirmacao'; em: Instante; mensagem: string }
  | { tipo: 'leitura'; em: Instante; alvo: string }

export interface Registro {
  situacao: Situacao
  evidencias: Evidencia[]
  /** `agent_id` do subagente que executou; ausente = a instância principal. Dá a cor do cursor. */
  agente?: string
}

/** Bloco "só nesta execução", na raia de extras (CONCEPCAO §9.5). Some no fim da tarefa. */
export interface Extra {
  etapa: Etapa
  /**
   * Onde o usuário pediu para incluir. Se essa etapa já tinha passado, o bloco vai para o fim
   * da fila, e é por este campo que o painel sabe que ele é tardio.
   */
  depoisDe: Id
}

/** Atividade que não se encaixou em nenhuma etapa: o buraco fica visível. */
export interface NaoClassificado {
  id: Id
  resumo: string
  evidencias: Evidencia[]
}

export interface Execucao {
  /** `session_id` do Claude Code. */
  sessao: string
  processo: Id
  iniciadaEm: Instante
  terminadaEm?: Instante
  /** Por id de etapa (do processo ou dos extras), em qualquer nível. */
  registros: Record<Id, Registro>
  extras: Extra[]
  naoClassificados: NaoClassificado[]
}
