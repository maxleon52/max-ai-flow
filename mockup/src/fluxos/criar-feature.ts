import { emSequencia } from '../modelo/esteira.ts'
import type { Execucao, Processo, Trecho } from '../modelo/tipos.ts'

/**
 * "Criar feature" do `frontend-cd-refactory` (tarefa 0.4), transcrito à mão do comando
 * `/criar-feature` e das duas regras que ele chama (`planning.md`, `migration-checklist.md`).
 * Linhas conferidas por `npm run validar`. Processo comitado e garantido por máquina.
 *
 * A ordem segue o texto do comando: a responsividade vem logo depois da UI (linha 93,
 * "Após implementar os componentes de UI"), não no fim, como resumia a CONCEPCAO §10.
 */

const comando = (de: number, ate = de): Trecho => ({ fonte: 'criar-feature', linhas: { de, ate } })
const planejamento = (de: number, ate = de): Trecho => ({ fonte: 'planning', linhas: { de, ate } })
const checklist = (de: number, ate = de): Trecho => ({ fonte: 'checklist', linhas: { de, ate } })

export const criarFeature = {
  id: 'criar-feature',
  nome: 'Criar feature',
  descricao: 'Do levantamento ao porte fechado, sem código antes da aprovação do rascunho.',
  projeto: 'frontend-cd-refactory',
  fontes: [
    { id: 'criar-feature', tipo: 'comando', caminho: '.claude/commands/criar-feature.md' },
    { id: 'planning', tipo: 'regra', caminho: '.claude/rules/planning.md' },
    { id: 'checklist', tipo: 'regra', caminho: '.claude/rules/migration-checklist.md' },
  ],
  nomesDosAtores: { 'plataforma-git': 'GitHub', api: 'Back-end', documentacao: 'Checklist e fichas' },
  esteira: {
    etapas: [
      {
        id: 'coleta',
        nome: 'Coletar as informações iniciais',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'voce',
        obrigatoria: true,
        origens: [comando(9, 24)],
        subpassos: {
          etapas: [
            {
              id: 'perguntar',
              nome: 'Perguntar tudo numa mensagem',
              descricao: 'Nome, domains, recursos próprios, o que já existe, contexto.',
              tipo: 'julgamento',
              ator: 'claude',
              alvo: 'voce',
              obrigatoria: true,
              origens: [comando(11, 22)],
            },
            {
              id: 'responder-coleta',
              nome: 'Responder as perguntas',
              tipo: 'portao-humano',
              ator: 'voce',
              alvo: 'claude',
              obrigatoria: true,
              origens: [comando(24)],
            },
          ],
          conexoes: emSequencia('perguntar', 'responder-coleta'),
        },
      },
      {
        id: 'legado',
        nome: 'Analisar o sistema legado',
        descricao: 'Só leitura, a partir de origin/DEVELOPMENT. Referência de comportamento, nunca de código.',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [comando(28, 41), planejamento(7, 16)],
        subpassos: {
          etapas: [
            {
              id: 'trava-legado',
              nome: 'Trava do legado',
              descricao: 'npm run check:legacy; na saída 1 para e pede o fetch.',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [planejamento(11), checklist(53)],
            },
            {
              id: 'localizar',
              nome: 'Localizar a tela no índice do legado',
              tipo: 'julgamento',
              ator: 'claude',
              alvo: 'documentacao',
              obrigatoria: true,
              origens: [planejamento(12)],
            },
            {
              id: 'analisar',
              nome: 'Levantar dados, filtros, ações e API',
              tipo: 'julgamento',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [planejamento(13), comando(32, 37)],
            },
            {
              id: 'anotar-sha',
              nome: 'Anotar o SHA analisado',
              tipo: 'julgamento',
              ator: 'claude',
              obrigatoria: true,
              origens: [planejamento(14), comando(39)],
            },
            {
              id: 'levantamento',
              nome: 'Levantar com você',
              descricao: 'Legado inacessível: checklist de perguntas ao dev.',
              tipo: 'portao-humano',
              ator: 'voce',
              alvo: 'claude',
              obrigatoria: false,
              origens: [planejamento(18, 49), comando(41)],
            },
          ],
          conexoes: [
            { de: 'trava-legado', para: 'localizar', condicao: 'legado acessível' },
            { de: 'trava-legado', para: 'levantamento', condicao: 'legado inacessível' },
            ...emSequencia('localizar', 'analisar', 'anotar-sha'),
          ],
        },
      },
      {
        id: 'rascunho',
        nome: 'Montar o rascunho',
        descricao: 'O que existia, o que fazer, o que está desbloqueado e bloqueado, estrutura e dúvidas.',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'voce',
        obrigatoria: true,
        origens: [comando(45, 74), planejamento(53, 74)],
      },
      {
        id: 'aprovacao',
        nome: 'Aprovar o rascunho',
        descricao: 'Nenhum código antes disso.',
        tipo: 'portao-humano',
        ator: 'voce',
        alvo: 'claude',
        obrigatoria: true,
        origens: [comando(76), planejamento(78, 82)],
      },
      {
        id: 'checklist',
        nome: 'Criar o checklist da tela',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'documentacao',
        obrigatoria: true,
        origens: [comando(82), checklist(54, 56)],
        subpassos: {
          etapas: [
            {
              id: 'gerar-tela',
              nome: 'Gerar a base da tela',
              descricao: 'npm run gen:tela, para listagem com domain novo.',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: false,
              origens: [comando(5), checklist(54)],
            },
            {
              id: 'preencher-checklist',
              nome: 'Preencher a triagem',
              tipo: 'julgamento',
              ator: 'claude',
              alvo: 'documentacao',
              obrigatoria: true,
              origens: [checklist(55)],
            },
            {
              id: 'aprovar-triagem',
              nome: 'Aprovar a triagem',
              descricao: 'Item †: só você marca.',
              tipo: 'portao-humano',
              ator: 'voce',
              alvo: 'documentacao',
              obrigatoria: true,
              origens: [checklist(56), checklist(30)],
            },
            {
              id: 'gerar-docs',
              nome: 'Gerar o docs/features.md',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'documentacao',
              obrigatoria: true,
              origens: [comando(82), checklist(6)],
            },
          ],
          conexoes: emSequencia('gerar-tela', 'preencher-checklist', 'aprovar-triagem', 'gerar-docs'),
        },
      },
      {
        id: 'ui',
        nome: 'Construir a UI',
        descricao: 'Só o que está desbloqueado; dados de mentira onde falta API.',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [comando(83, 84)],
        subpassos: {
          etapas: [
            { id: 'header', nome: 'Header', tipo: 'julgamento', ator: 'claude', alvo: 'codigo', obrigatoria: true, origens: [comando(84)] },
            { id: 'filtros', nome: 'Filtros com mock', tipo: 'julgamento', ator: 'claude', alvo: 'codigo', obrigatoria: true, origens: [comando(84)] },
            { id: 'tabela', nome: 'Tabela com mock', tipo: 'julgamento', ator: 'claude', alvo: 'codigo', obrigatoria: true, origens: [comando(84)] },
          ],
          conexoes: emSequencia('header', 'filtros', 'tabela'),
        },
      },
      {
        id: 'responsividade',
        nome: 'Validar a responsividade',
        descricao: 'Você confere no navegador, em mobile e desktop. Item †.',
        tipo: 'portao-humano',
        ator: 'voce',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [comando(91, 99), checklist(30)],
      },
      {
        id: 'traducoes',
        nome: 'Traduzir',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'codigo',
        obrigatoria: true,
        origens: [comando(85)],
        subpassos: {
          etapas: [
            {
              id: 'mensagens',
              nome: 'Escrever pt, en e es',
              tipo: 'julgamento',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [comando(85)],
            },
            {
              id: 'validar-i18n',
              nome: 'Validar as chaves',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [comando(85)],
            },
          ],
          conexoes: emSequencia('mensagens', 'validar-i18n'),
        },
      },
      {
        id: 'integracao',
        nome: 'Integrar com o back-end',
        descricao: 'Quando você trouxer o que falta (endpoint, contrato).',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'api',
        obrigatoria: true,
        origens: [comando(86)],
      },
      {
        id: 'testes',
        nome: 'Escrever os testes',
        tipo: 'julgamento',
        ator: 'claude',
        alvo: 'testes',
        obrigatoria: true,
        origens: [comando(87), checklist(44, 46)],
        subpassos: {
          etapas: [
            { id: 'testes-unitarios', nome: 'Unitários', tipo: 'julgamento', ator: 'claude', alvo: 'testes', obrigatoria: true, origens: [checklist(45)] },
            { id: 'testes-componente', nome: 'De componente', tipo: 'julgamento', ator: 'claude', alvo: 'testes', obrigatoria: true, origens: [checklist(44)] },
            { id: 'testes-e2e', nome: 'E2E', tipo: 'julgamento', ator: 'claude', alvo: 'testes', obrigatoria: true, origens: [checklist(46)] },
          ],
          conexoes: [],
        },
      },
      {
        id: 'fechar-porte',
        nome: 'Fechar o porte',
        tipo: 'deterministico',
        ator: 'claude',
        alvo: 'documentacao',
        obrigatoria: true,
        origens: [comando(89), planejamento(84), checklist(58)],
        subpassos: {
          etapas: [
            {
              id: 'ficha-legado',
              nome: 'Atualizar a ficha do legado',
              descricao: 'Base (SHA analisado) e status.',
              tipo: 'julgamento',
              ator: 'claude',
              alvo: 'documentacao',
              obrigatoria: true,
              origens: [comando(89), planejamento(84)],
            },
            {
              id: 'indice-legado',
              nome: 'Regenerar o índice do legado',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'documentacao',
              obrigatoria: true,
              origens: [comando(89)],
            },
            {
              id: 'verificar-tela',
              nome: 'Verificar a tela',
              descricao: '/verificar-tela: os validadores e o que a máquina não pega.',
              tipo: 'deterministico',
              ator: 'claude',
              alvo: 'codigo',
              obrigatoria: true,
              origens: [checklist(58)],
            },
          ],
          conexoes: emSequencia('ficha-legado', 'indice-legado', 'verificar-tela'),
        },
      },
    ],
    conexoes: [
      ...emSequencia('coleta', 'legado', 'rascunho', 'aprovacao'),
      { de: 'aprovacao', para: 'rascunho', condicao: 'pediu ajuste' },
      { de: 'aprovacao', para: 'checklist', condicao: 'aprovado' },
      ...emSequencia('checklist', 'ui', 'responsividade'),
      { de: 'responsividade', para: 'ui', condicao: 'achou problema' },
      { de: 'responsividade', para: 'traducoes', condicao: 'ok' },
      ...emSequencia('traducoes', 'integracao', 'testes', 'fechar-porte'),
    ],
  },
} satisfies Processo

/**
 * Feature fictícia "Budget", no meio do caminho: UI e traduções prontas, integração bloqueada
 * esperando o endpoint, testes em andamento. Dados de mentira.
 */
export const execucaoBudget = {
  sessao: 'exemplo-budget',
  processo: 'criar-feature',
  iniciadaEm: '2026-11-18T14:00:00-03:00',
  registros: {
    coleta: {
      situacao: { estado: 'feita', em: '2026-11-18T14:09:00-03:00', prova: 'declarada' },
      evidencias: [],
    },
    perguntar: {
      situacao: { estado: 'feita', em: '2026-11-18T14:01:00-03:00', prova: 'declarada' },
      evidencias: [],
    },
    'responder-coleta': {
      situacao: { estado: 'feita', em: '2026-11-18T14:09:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'confirmacao',
          em: '2026-11-18T14:09:00-03:00',
          mensagem: 'Budget; consome o domain cost-models; API ainda sem contrato; tenho o Figma.',
        },
      ],
    },
    legado: {
      situacao: { estado: 'feita', em: '2026-11-18T14:31:00-03:00', prova: 'declarada' },
      evidencias: [],
    },
    'trava-legado': {
      situacao: { estado: 'feita', em: '2026-11-18T14:10:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-18T14:10:00-03:00',
          comando: 'npm run check:legacy',
          codigoDeSaida: 0,
          resumo: 'legado em dia',
          criterio: { descricao: 'saída 0 da tabela de .claude/rules/legacy.md', atendido: true },
        },
      ],
    },
    localizar: {
      situacao: { estado: 'feita', em: '2026-11-18T14:12:00-03:00', prova: 'declarada' },
      evidencias: [{ tipo: 'leitura', em: '2026-11-18T14:11:00-03:00', alvo: 'docs/legacy/README.md' }],
    },
    analisar: {
      situacao: { estado: 'feita', em: '2026-11-18T14:30:00-03:00', prova: 'declarada' },
      evidencias: [
        { tipo: 'leitura', em: '2026-11-18T14:15:00-03:00', alvo: 'origin/DEVELOPMENT: src/pages/budget/index.tsx' },
        { tipo: 'leitura', em: '2026-11-18T14:20:00-03:00', alvo: 'origin/DEVELOPMENT: src/services/budget.ts' },
      ],
    },
    'anotar-sha': {
      situacao: { estado: 'feita', em: '2026-11-18T14:31:00-03:00', prova: 'declarada' },
      evidencias: [],
    },
    rascunho: {
      situacao: { estado: 'feita', em: '2026-11-18T14:40:00-03:00', prova: 'declarada' },
      evidencias: [],
    },
    aprovacao: {
      situacao: { estado: 'feita', em: '2026-11-18T14:52:00-03:00', prova: 'comprovada' },
      evidencias: [{ tipo: 'confirmacao', em: '2026-11-18T14:52:00-03:00', mensagem: 'aprovado, pode seguir' }],
    },
    checklist: {
      situacao: { estado: 'feita', em: '2026-11-18T15:10:00-03:00', prova: 'comprovada' },
      evidencias: [],
    },
    'gerar-tela': {
      situacao: { estado: 'feita', em: '2026-11-18T14:54:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-18T14:54:00-03:00',
          comando: 'npm run gen:tela',
          codigoDeSaida: 0,
          criterio: { descricao: 'checklist.json criado com todos os itens pendentes', atendido: true },
        },
        { tipo: 'arquivo', em: '2026-11-18T14:54:00-03:00', caminho: 'src/app/[locale]/(app)/budget/checklist.json', operacao: 'criado', porComando: true },
      ],
    },
    'preencher-checklist': {
      situacao: { estado: 'feita', em: '2026-11-18T15:00:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-18T15:00:00-03:00', caminho: 'src/app/[locale]/(app)/budget/checklist.json', operacao: 'editado' },
      ],
    },
    'aprovar-triagem': {
      situacao: { estado: 'feita', em: '2026-11-18T15:08:00-03:00', prova: 'comprovada' },
      evidencias: [{ tipo: 'confirmacao', em: '2026-11-18T15:08:00-03:00', mensagem: 'triagem ok' }],
    },
    'gerar-docs': {
      situacao: { estado: 'feita', em: '2026-11-18T15:10:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-18T15:10:00-03:00',
          comando: 'npm run checklists:docs',
          codigoDeSaida: 0,
          criterio: { descricao: 'docs/features.md regenerado', atendido: true },
        },
      ],
    },
    ui: {
      situacao: { estado: 'feita', em: '2026-11-18T16:05:00-03:00', prova: 'comprovada' },
      evidencias: [],
    },
    header: {
      situacao: { estado: 'feita', em: '2026-11-18T15:25:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-18T15:25:00-03:00', caminho: 'src/features/budget/components/budget-header.tsx', operacao: 'criado' },
      ],
    },
    filtros: {
      situacao: { estado: 'feita', em: '2026-11-18T15:45:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-18T15:45:00-03:00', caminho: 'src/features/budget/components/budget-filters.tsx', operacao: 'criado' },
      ],
    },
    tabela: {
      situacao: { estado: 'feita', em: '2026-11-18T16:05:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-18T16:05:00-03:00', caminho: 'src/features/budget/components/budget-table.tsx', operacao: 'criado' },
      ],
    },
    responsividade: {
      situacao: { estado: 'feita', em: '2026-11-18T16:20:00-03:00', prova: 'comprovada' },
      evidencias: [{ tipo: 'confirmacao', em: '2026-11-18T16:20:00-03:00', mensagem: 'responsividade ok no mobile e no desktop' }],
    },
    traducoes: {
      situacao: { estado: 'feita', em: '2026-11-18T16:35:00-03:00', prova: 'comprovada' },
      evidencias: [],
    },
    mensagens: {
      situacao: { estado: 'feita', em: '2026-11-18T16:33:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-18T16:31:00-03:00', caminho: 'messages/pt.json', operacao: 'editado' },
        { tipo: 'arquivo', em: '2026-11-18T16:32:00-03:00', caminho: 'messages/en.json', operacao: 'editado' },
        { tipo: 'arquivo', em: '2026-11-18T16:33:00-03:00', caminho: 'messages/es.json', operacao: 'editado' },
      ],
    },
    'validar-i18n': {
      situacao: { estado: 'feita', em: '2026-11-18T16:35:00-03:00', prova: 'comprovada' },
      evidencias: [
        {
          tipo: 'comando',
          em: '2026-11-18T16:35:00-03:00',
          comando: 'npm run validate:i18n',
          codigoDeSaida: 0,
          criterio: { descricao: 'as três línguas com as mesmas chaves', atendido: true },
        },
      ],
    },
    integracao: {
      situacao: { estado: 'bloqueada', em: '2026-11-18T16:36:00-03:00', dependeDe: 'endpoint de Budget no back-end' },
      evidencias: [],
    },
    testes: {
      situacao: { estado: 'em-andamento', desde: '2026-11-18T16:37:00-03:00' },
      evidencias: [],
    },
    'testes-unitarios': {
      situacao: { estado: 'feita', em: '2026-11-18T16:50:00-03:00', prova: 'comprovada' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-18T16:45:00-03:00', caminho: 'src/features/budget/mappers/budget.mapper.unit.test.ts', operacao: 'criado' },
        {
          tipo: 'comando',
          em: '2026-11-18T16:50:00-03:00',
          comando: 'npm run test:ci -- src/features/budget',
          codigoDeSaida: 0,
          resumo: '14 testes, 0 pulados',
          criterio: { descricao: 'código 0 e nenhum teste pulado', atendido: true },
        },
      ],
    },
    'testes-componente': {
      situacao: { estado: 'em-andamento', desde: '2026-11-18T16:51:00-03:00' },
      evidencias: [
        { tipo: 'arquivo', em: '2026-11-18T16:55:00-03:00', caminho: 'src/features/budget/components/budget-header.component.test.tsx', operacao: 'criado' },
      ],
    },
  },
  extras: [],
  naoClassificados: [],
} satisfies Execucao
