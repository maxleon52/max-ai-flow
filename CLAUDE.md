# Max AI Flow

Ferramenta própria do usuário: um **painel visual animado** (canvas no estilo Figma ou n8n) que mostra ao vivo, em linguagem humana, o que a instância do Claude Code está fazendo, etapa por etapa. É um **wrap** sobre o que o harness já tem (skills, regras, memórias, hooks, scripts do projeto), agnóstico de projeto.

## Leia antes de qualquer coisa

1. [docs/ROADMAP.md](docs/ROADMAP.md): **em que tarefa estamos.** Seguir a ordem; se o usuário pedir algo fora dela, avisar e seguir o que ele decidir.
2. [docs/CONCEPCAO.md](docs/CONCEPCAO.md): o porquê de tudo. As decisões estão lá, com data; não rediscutir o que já foi decidido sem motivo novo.

Ao concluir uma tarefa: marcar `[x]` com a data no roadmap e dizer qual é a próxima.

## Projetos de referência: SOMENTE LEITURA

| Projeto | O que tem de útil |
|---|---|
| `C:\www\ecnh-app` | Processo pessoal e rico: skills, memórias e scripts na `.claude/` (ignorada pelo Git). Memórias em `C:\Users\maxle\.claude\projects\c--www-ecnh-app\memory\`. |
| `C:\www\frontend-cd-refactory` | Processo garantido por máquina: `.claude/rules`, `.claude/commands`, `checklist.json` por tela, validadores npm, husky, CI. |
| `C:\www\projeto-ticket` | Processo spec-first: `CLAUDE.md`, skills `tarefa` e `comita-e-envia`, `docs/specs/roadmap.md`. Memórias em `C:\Users\maxle\.claude\projects\c--www-projeto-ticket\memory\`. |

- **Nunca** criar, editar, apagar, comitar ou rodar comando que altere qualquer coisa nesses projetos (nem `git checkout`, nem `npm install`, nem instalar hooks neles). Ler arquivos e rodar `git log`/`git show` é permitido.
- A edição pelas ferramentas de arquivo está **negada** em `.claude/settings.local.json`. Comandos de terminal não são cobertos por essa trava: a regra acima vale do mesmo jeito.
- Quando a ferramenta precisar de hooks para acompanhar uma sessão real (fase 2), eles vão no escopo do **usuário** ou num plugin, **nunca** dentro de um projeto de referência, e só com aval explícito.
- Esses projetos servem para a ferramenta ser **genérica**: o que funciona num e falha noutro é informação, não exceção a contornar.

## Como o usuário trabalha

- Tudo em **PT-BR**. Ele é front-end sênior e muito visual: prefere ver a explicar, e "bonito" é requisito (animação, SVG, nada de caixa com texto só).
- Quer **opinião honesta**, inclusive discordando. Apontar o que ele não está vendo.
- **Uma tarefa por instância.** Ao fechar uma, deixar o roadmap dizendo onde paramos.
- **Alterar só o escopo pedido.** Algo parecido fora do escopo: apontar em texto, não mexer.
- **Medir em vez de deduzir:** se dá para verificar (rodar, ler a doc pelo Context7), verificar.
- Datas no código: **date-fns**.
- **Git:** remoto em `github.com/maxleon52/max-ai-flow`. Só `main` + uma branch por tarefa do roadmap (`tarefa/<número>-<nome-curto>`). Nunca comitar direto na `main`.
  - Ao fechar a tarefa: commit, push da branch e PR simples aberto **pela API do GitHub**, com a credencial que o `git` já usa (`git credential fill`, sem `gh`; mesmo fluxo da skill `comita-e-envia` do `projeto-ticket`). Token só em variável, nunca impresso.
  - **Quem mescla é ele.** Depois que ele avisar: `git switch main && git pull`.
  - Nunca mencionar IA em commit, PR ou MR.
- Nada de segredo (token, senha, `.env`) em arquivo comitado.

## Estado do repositório

- `docs/`: concepção e roadmap.
- `mockup/`: Vite + React + TypeScript + React Flow + Motion (`npm run dev`, `npm run build`, `npm run lint`). Por enquanto, canvas vazio.
