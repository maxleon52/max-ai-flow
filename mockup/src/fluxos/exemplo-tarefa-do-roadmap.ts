import { emSequencia } from '../modelo/esteira.ts'
import type { Execucao, Processo } from '../modelo/tipos.ts'

/**
 * Exemplo da 0.3: o processo deste próprio repositório para fazer uma tarefa do roadmap, lido do
 * `CLAUDE.md` da raiz (as linhas são as de verdade). Tem sub-passos, itens soltos, laço com
 * condição e portão humano. Os fluxos dos projetos de referência vêm na 0.4.
 */
export const tarefaDoRoadmap = {
  id: 'tarefa-do-roadmap',
  nome: 'Fazer uma tarefa do roadmap',
  descricao: 'Da leitura do roadmap até o PR mesclado, uma tarefa por instância.',
  projeto: 'max-ai-flow',
  fontes: [
    { id: 'claude-md', tipo: 'claude-md', caminho: 'CLAUDE.md' },
    { id: 'roadmap', tipo: 'andamento', caminho: 'docs/ROADMAP.md' },
  ],
  nomesDosAtores: { 'plataforma-git': 'GitHub', documentacao: 'Roadmap' },
  esteira: {
    etapas: [
      {
        id: 'descobrir-tarefa',
        nome: 'Descobrir a próxima tarefa',
        descricao: 'Lê o roadmap e a concepção; segue a ordem.',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'documentacao',
        obrigatoria: true,
        origens: [
          { fonte: 'claude-md', linhas: { de: 7, ate: 8 } },
          { fonte: 'roadmap', linhas: { de: 5, ate: 5 } },
        ],
      },
      {
        id: 'criar-branch',
        nome: 'Criar a branch da tarefa',
        descricao: 'tarefa/<número>-<nome-curto>, nunca direto na main.',
        tipo: 'deterministico',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [{ fonte: 'claude-md', linhas: { de: 33, ate: 33 } }],
      },
      {
        id: 'fazer',
        nome: 'Fazer a tarefa',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [{ fonte: 'claude-md', linhas: { de: 30, ate: 32 } }],
        subpassos: {
          etapas: [
            {
              id: 'ler-doc',
              nome: 'Ler a doc das bibliotecas',
              descricao: 'Pelo Context7, em vez de deduzir.',
              tipo: 'julgamento',
              ator: 'claude',
              obrigatoria: false,
              origens: [{ fonte: 'claude-md', linhas: { de: 31, ate: 31 } }],
            },
            {
              id: 'escrever',
              nome: 'Escrever só o escopo pedido',
              tipo: 'julgamento',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [{ fonte: 'claude-md', linhas: { de: 30, ate: 30 } }],
            },
          ],
          conexoes: emSequencia('ler-doc', 'escrever'),
        },
      },
      {
        id: 'verificar',
        nome: 'Verificar',
        descricao: 'Build e lint do mockup.',
        tipo: 'deterministico',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [{ fonte: 'claude-md', linhas: { de: 42, ate: 42 } }],
        subpassos: {
          // Itens soltos: sem conexões, sem ordem entre eles.
          etapas: [
            {
              id: 'build',
              nome: 'Build',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [{ fonte: 'claude-md', linhas: { de: 42, ate: 42 } }],
            },
            {
              id: 'lint',
              nome: 'Lint',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [{ fonte: 'claude-md', linhas: { de: 42, ate: 42 } }],
            },
          ],
          conexoes: [],
        },
      },
      {
        id: 'marcar-roadmap',
        nome: 'Marcar a tarefa no roadmap',
        descricao: '[x] com a data e qual é a próxima.',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'documentacao',
        obrigatoria: true,
        origens: [
          { fonte: 'claude-md', linhas: { de: 10, ate: 10 } },
          { fonte: 'claude-md', linhas: { de: 29, ate: 29 } },
        ],
      },
      {
        id: 'enviar',
        nome: 'Enviar para revisão',
        tipo: 'deterministico',
        ator: 'claude',
        alvo: 'plataforma-git',
        obrigatoria: true,
        origens: [{ fonte: 'claude-md', linhas: { de: 34, ate: 36 } }],
        subpassos: {
          etapas: [
            {
              id: 'commit',
              nome: 'Commit',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [{ fonte: 'claude-md', linhas: { de: 34, ate: 34 } }],
            },
            {
              id: 'push',
              nome: 'Push da branch',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'plataforma-git',
              obrigatoria: true,
              origens: [{ fonte: 'claude-md', linhas: { de: 34, ate: 34 } }],
            },
            {
              id: 'abrir-pr',
              nome: 'Abrir o PR',
              descricao: 'Pela API do GitHub, com a credencial do git.',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'plataforma-git',
              obrigatoria: true,
              origens: [{ fonte: 'claude-md', linhas: { de: 34, ate: 34 } }],
            },
          ],
          conexoes: emSequencia('commit', 'push', 'abrir-pr'),
        },
      },
      {
        id: 'mesclar',
        nome: 'Mesclar o PR',
        descricao: 'Quem mescla é você.',
        tipo: 'portao-humano',
        ator: 'voce',
        alvo: 'plataforma-git',
        obrigatoria: true,
        origens: [{ fonte: 'claude-md', linhas: { de: 35, ate: 35 } }],
      },
      {
        id: 'atualizar-main',
        nome: 'Voltar para a main atualizada',
        tipo: 'deterministico',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [{ fonte: 'claude-md', linhas: { de: 35, ate: 35 } }],
      },
    ],
    conexoes: [
      ...emSequencia('descobrir-tarefa', 'criar-branch', 'fazer', 'verificar'),
      { de: 'verificar', para: 'fazer', condicao: 'falhou' },
      { de: 'verificar', para: 'marcar-roadmap', condicao: 'passou' },
      ...emSequencia('marcar-roadmap', 'enviar', 'mesclar', 'atualizar-main'),
    ],
  },
} satisfies Processo

/**
 * Execução parada no portão humano: o PR está aberto, esperando você. Um ajuste pedido tarde
 * (raia de extras) mexeu no código depois da verificação, então ela e o envio ficaram laranja.
 */
export const execucaoAguardandoMerge = {
  sessao: 'exemplo-aguardando-merge',
  processo: 'tarefa-do-roadmap',
  iniciadaEm: '2026-11-20T14:00:00-03:00',
  registros: {
    'descobrir-tarefa': {
      situacao: { estado: 'feita', em: '2026-11-20T14:02:00-03:00', prova: 'declarada' },
      evidencias: [
        { tipo: 'leitura', em: '2026-11-20T14:01:00-03:00', alvo: 'docs/ROADMAP.md' },
        { tipo: 'leitura', em: '2026-11-20T14:01:30-03:00', alvo: 'docs/CONCEPCAO.md' },
      ],
    },
    'criar-branch': {
      situacao: { estado: 'feita', em: '2026-11-20T14:03:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T14:03:00-03:00',
          comando: 'git switch -c tarefa/0.3-modelo-de-dados',
          codigoDeSaida: 0,
          criterio: { descricao: 'a branch atual é tarefa/0.3-modelo-de-dados', atendido: true },
        },
      ],
    },
    fazer: {
      situacao: { estado: 'feita', em: '2026-11-20T14:40:00-03:00', prova: 'declarada' },
      evidencias: [],
    },
    'ler-doc': {
      situacao: { estado: 'feita', em: '2026-11-20T14:06:00-03:00', prova: 'declarada' },
      evidencias: [{ tipo: 'leitura', em: '2026-11-20T14:05:00-03:00', alvo: 'Context7: date-fns (parseISO, isValid)' }],
      agente: 'pesquisa-1',
    },
    escrever: {
      situacao: { estado: 'feita', em: '2026-11-20T14:40:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-20T14:15:00-03:00', caminho: 'mockup/src/modelo/tipos.ts', operacao: 'criado' },
        { tipo: 'arquivo', em: '2026-11-20T14:30:00-03:00', caminho: 'mockup/src/modelo/validar.ts', operacao: 'criado' },
        { tipo: 'arquivo', em: '2026-11-20T14:10:00-03:00', caminho: 'mockup/package.json', operacao: 'editado', porComando: true },
      ],
    },
    verificar: {
      situacao: {
        estado: 'desatualizada',
        em: '2026-11-20T15:05:00-03:00',
        causa: 'ajustar-nomes',
        motivo: 'o código mudou depois da verificação',
      },
      evidencias: [],
    },
    build: {
      situacao: { estado: 'feita', em: '2026-11-20T14:42:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T14:42:00-03:00',
          comando: 'npm run build',
          codigoDeSaida: 0,
          resumo: 'tsc sem erros; bundle gerado',
          criterio: { descricao: 'tsc sem erros e dist/index.html gerado', atendido: true },
        },
      ],
    },
    lint: {
      situacao: { estado: 'feita', em: '2026-11-20T14:43:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T14:43:00-03:00',
          comando: 'npm run lint',
          codigoDeSaida: 0,
          resumo: '0 avisos, 0 erros',
          criterio: { descricao: '0 avisos e 0 erros', atendido: true },
        },
      ],
    },
    'marcar-roadmap': {
      situacao: { estado: 'feita', em: '2026-11-20T14:45:00-03:00', prova: 'comprovada' },
      evidencias: [{ tipo: 'arquivo', em: '2026-11-20T14:45:00-03:00', caminho: 'docs/ROADMAP.md', operacao: 'editado' }],
    },
    enviar: {
      situacao: {
        estado: 'desatualizada',
        em: '2026-11-20T15:05:00-03:00',
        causa: 'ajustar-nomes',
        motivo: 'o PR não tem o ajuste feito depois',
      },
      evidencias: [],
    },
    commit: {
      situacao: { estado: 'feita', em: '2026-11-20T14:47:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T14:47:00-03:00',
          comando: 'git commit',
          codigoDeSaida: 0,
          criterio: { descricao: 'árvore limpa depois do commit', atendido: true },
        },
      ],
    },
    push: {
      situacao: { estado: 'feita', em: '2026-11-20T14:48:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T14:48:00-03:00',
          comando: 'git push -u origin tarefa/0.3-modelo-de-dados',
          codigoDeSaida: 0,
          criterio: { descricao: 'a branch existe no remoto', atendido: true },
        },
      ],
    },
    'abrir-pr': {
      situacao: { estado: 'feita', em: '2026-11-20T14:49:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T14:49:00-03:00',
          comando: 'POST /repos/maxleon52/max-ai-flow/pulls',
          codigoDeSaida: 0,
          resumo: 'HTTP 201',
          criterio: { descricao: 'resposta 201 com o número do PR', atendido: true },
        },
        {
          tipo: 'link',
          em: '2026-11-20T14:49:00-03:00',
          rotulo: 'PR #3',
          url: 'https://github.com/maxleon52/max-ai-flow/pull/3',
        },
      ],
    },
    mesclar: {
      situacao: { estado: 'aguardando-voce', desde: '2026-11-20T14:49:00-03:00', pergunta: 'Mesclou o PR #3?' },
      evidencias: [],
    },
    'ajustar-nomes': {
      situacao: { estado: 'feita', em: '2026-11-20T15:05:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-20T15:04:00-03:00', caminho: 'mockup/src/modelo/tipos.ts', operacao: 'editado' },
      ],
    },
  },
  extras: [
    {
      // Pedido para depois de "Fazer a tarefa", que já tinha passado: foi para o fim da fila.
      depoisDe: 'fazer',
      etapa: {
        id: 'ajustar-nomes',
        nome: 'Ajustar nomes dos atores',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: false,
        origens: [],
      },
    },
  ],
  naoClassificados: [
    {
      id: 'nc-1',
      resumo: 'Leu a skill comita-e-envia de outro projeto',
      evidencias: [
        {
          tipo: 'leitura',
          em: '2026-11-20T14:46:00-03:00',
          alvo: 'C:/www/projeto-ticket/.claude/skills/comita-e-envia/SKILL.md',
        },
      ],
    },
  ],
} satisfies Execucao

/**
 * Execução que voltou pelo laço: o lint falhou na verificação e o fluxo voltou para
 * "Fazer a tarefa". A leitura da doc foi pulada com justificativa.
 */
export const execucaoComFalha = {
  sessao: 'exemplo-com-falha',
  processo: 'tarefa-do-roadmap',
  iniciadaEm: '2026-11-20T09:00:00-03:00',
  registros: {
    'descobrir-tarefa': {
      situacao: { estado: 'feita', em: '2026-11-20T09:02:00-03:00', prova: 'declarada' },
      evidencias: [{ tipo: 'leitura', em: '2026-11-20T09:01:00-03:00', alvo: 'docs/ROADMAP.md' }],
    },
    'criar-branch': {
      situacao: { estado: 'feita', em: '2026-11-20T09:03:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T09:03:00-03:00',
          comando: 'git switch -c tarefa/0.4-dados-falsos',
          codigoDeSaida: 0,
          criterio: { descricao: 'a branch atual é tarefa/0.4-dados-falsos', atendido: true },
        },
      ],
    },
    fazer: {
      situacao: { estado: 'em-andamento', desde: '2026-11-20T09:31:00-03:00' },
      evidencias: [],
    },
    'ler-doc': {
      situacao: { estado: 'pulada', em: '2026-11-20T09:04:00-03:00', justificativa: 'nenhuma biblioteca nova nesta tarefa' },
      evidencias: [],
    },
    escrever: {
      situacao: { estado: 'em-andamento', desde: '2026-11-20T09:31:00-03:00' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-20T09:20:00-03:00', caminho: 'mockup/src/fluxos/resolver-ticket.ts', operacao: 'criado' },
      ],
    },
    verificar: {
      situacao: { estado: 'falhou', em: '2026-11-20T09:30:00-03:00', motivo: 'o lint acusou 2 erros' },
      evidencias: [],
    },
    build: {
      situacao: { estado: 'feita', em: '2026-11-20T09:29:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T09:29:00-03:00',
          comando: 'npm run build',
          codigoDeSaida: 0,
          criterio: { descricao: 'tsc sem erros e dist/index.html gerado', atendido: true },
        },
      ],
    },
    lint: {
      situacao: { estado: 'falhou', em: '2026-11-20T09:30:00-03:00', motivo: '2 erros' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-20T09:30:00-03:00',
          comando: 'npm run lint',
          codigoDeSaida: 1,
          resumo: '0 avisos, 2 erros (no-unused-vars)',
          criterio: { descricao: '0 avisos e 0 erros', atendido: false },
        },
      ],
    },
  },
  extras: [],
  naoClassificados: [],
} satisfies Execucao
