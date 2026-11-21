# Max AI Flow — concepção

> Documento de concepção, nascido do debate de 20/11/2026 (no começo, com o nome provisório "Fluxo Vivo").
> Nasceu dentro da `.claude/` do `ecnh-app` e foi migrado para `C:\www\max-ai-flow` no mesmo dia, quando passou a ter três projetos de referência (seção 10).
> **Nada do que está aqui foi descartado.** O que não entra na v1 está no Roteiro, em ordem.
> **Tarefas em ordem:** ver [ROADMAP.md](ROADMAP.md).

---

## 1. A ideia, em uma frase

Mostrar **ao vivo, em linguagem humana e de forma animada**, o que a instância do Claude Code está fazendo, etapa por etapa, em vez de um texto que rola rápido demais e um resumo "fiz isso, fiz aquilo" no fim.

## 2. Por que existe

- O texto do chat rola rápido. O checklist vivo (o fluxograma do que está acontecendo) não é visto em tempo real; só aparece um resumo no fim.
- Boa parte do texto dos arquivos do harness (skills, regras, memórias) só serve para a IA. O usuário precisa entender **o que o processo vai fazer**, não ler tudo.
- Modelos mais fracos pulam verificações que o processo já tinha. Exemplo real: o Sonnet quis abrir issue pedindo endpoints de CEP ao back-end sem perceber que a busca por CEP já estava implementada em várias telas. O conhecimento existia como lembrança e como código, não como etapa obrigatória.
- O harness tem muitos recursos (hooks e outros) que as pessoas não usam porque os nomes não são claros.

## 3. Princípios

1. **Embrulhar, não reinventar.** A fonte da verdade é o que o harness já usa: skills, `CLAUDE.md`, regras, memórias, hooks, permissões. A ferramenta é uma **lente** sobre esses arquivos. Não existe um "arquivo de processo" próprio; no máximo um arquivo lateral só com o que é visual (posições, nomes amigáveis), também local.
2. **O processo é descoberto, não desenhado.** As regras nascem conversando com a IA, de tropeços reais. A ferramenta acompanha esse jeito de trabalhar, não obriga a desenhar antes.
3. **Local primeiro.** Tudo roda na máquina do usuário. Nada online, nada vai para o repositório por padrão.
4. **Humano primeiro, detalhe sob demanda.** O bloco diz "Criando testes unitários", não "lendo arquivo X". O detalhe aparece só ao clicar.
5. **Honestidade sobre garantias.** O painel nunca dá a entender que algo está garantido quando é só um pedido ao modelo.
6. **Bonito de verdade.** Não é um diagrama de caixas: é uma explicação animada (ver seção 5).
7. **Uma tarefa, uma instância, um painel.** Cada sessão tem o seu fluxo; nada se mistura.

## 4. O que já existe (pesquisa de 20/11/2026)

| Projeto | O que faz | O que falta para o nosso caso |
|---|---|---|
| **Agent Flow** (patoles/agent-flow, Apache-2.0, ~1,8 mil estrelas) | Grafo **ao vivo** do Claude Code e do Codex: chamadas de ferramenta, subagentes, linha do tempo, "mapa de calor" de arquivos. Webview no VS Code e página em `localhost`. Dados vêm de hooks e das transcrições em `~/.claude/projects/`. | Nós são **chamadas cruas de ferramenta**, não etapas do processo. Não lê skills nem monta o mapa do processo. Não lista arquivos por etapa. |
| **CC Workflow Studio** (breaking-brake/cc-wf-studio, extensão AGPL-3.0, pacotes MIT, ~5,5 mil estrelas) | Canvas no VS Code para **desenhar** fluxos (subagente, pergunta, condição, skill, MCP) e exportar como skills, agentes e comandos para vários harnesses. | É o oposto do nosso princípio: **desenha primeiro e gera**, não lê o que existe. Não mostra execução ao vivo. |
| **claude-code-hooks-multi-agent-observability** (disler) | Painel no navegador com cada evento de hook, ao vivo. | Nível de evento, não de etapa. Sem mapa de processo. |
| Outros (Agents Observe, Claude Code Agent Monitor, Observagent, claude-watch, ccboard) | Painéis locais de observabilidade por hooks. | Mesma lacuna: mostram o **mecanismo**, não o **processo**. |

**Conclusão:** capturar eventos e desenhar já está resolvido por vários projetos. Ninguém faz a parte que é o coração desta ideia: **traduzir eventos em etapas do processo do próprio usuário, lidas das skills dele, com evidência e numa linguagem visual explicativa.** O Agent Flow (Apache-2.0) pode servir de base ou referência técnica para a captura; o CC Workflow Studio é referência de vocabulário de nós. Atenção à AGPL: não copiar código da extensão.

### Recursos nativos do Claude Code que mudam o desenho

- **Lista de tarefas nativa** com eventos `TaskCreated` / `TaskCompleted` nos hooks (desde a v2.1.33). É uma fonte pronta de nomes de etapa, sem inventar mecanismo de anúncio.
- **Eventos de hook** relevantes: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `Stop`, `SubagentStart/Stop`, `SessionStart/End`, `UserPromptSubmit`, `InstructionsLoaded`, `ConfigChange`, `FileChanged`, entre outros. Todos trazem `session_id`, `transcript_path`, `cwd`, `prompt_id` e, dentro de subagente, `agent_id`.
  - `InstructionsLoaded` → saber **quais** regras e instruções foram carregadas (base para mostrar a origem de cada bloco).
  - `ConfigChange` → perceber configuração nova (base para o alerta pós-pull).
  - `prompt_id` → agrupar tudo o que aconteceu a partir de um pedido.
- **Mods**: o Claude Code permite desenhar interface própria em **quatro superfícies**: terminal, app desktop, app mobile e a extensão do VS Code (`ui.render`, painéis acoplados). O mod oficial `/diff` já faz um painel com lista de arquivos alterados que se atualiza a cada edição. Os elementos disponíveis incluem `Box`, `Text`, `Button`, `Svg`, `Link`, `Markdown`. **A verificar:** se suportam animação rica (ver seção 6).

## 5. Linguagem visual

A referência são os vídeos curtos que explicam uma tecnologia, como o clássico "como funciona o Redis": o usuário pede, a requisição viaja, o banco aparece, o cache se forma, o segundo pedido volta do cache. **Não serve** um diagrama de retângulos com texto e cor.

### Atores

Cada participante tem um ícone ou ilustração em SVG próprio e um lugar fixo na cena:

- **Você** (o desenvolvedor)
- **Claude** (a instância)
- **Código** (o repositório)
- **Testes**
- **GitLab** (issues, MRs)
- **API / back-end**
- **Documentação interna** (status, painel, massas, manual)
- **Chamados**

### Movimento

O que acontece entre os atores **anda na tela**:
- "Atualizando a issue" → um cartão sai do Claude e voa até o GitLab; o GitLab acende ao receber.
- "Medindo na API" → a requisição vai e a resposta volta (verde ou vermelha).
- "Rodando testes" → a barra dos testes enche; cada teste que passa vira um ✓.
- "Atualizando documentações" → os documentos se empilham, um a um, com check.

### Um canvas só: a esteira e a cena juntas (decidido em 20/11/2026)

O painel é um **canvas infinito**, no estilo Figma ou n8n: zoom, arrasto, minimapa, toda a esteira do processo numa área só. A cena e a trilha não são duas telas; o **zoom** as junta:

- **De longe:** a esteira inteira, com os blocos acendendo e o fluxo correndo pelas conexões (a trilha).
- **Zoom no bloco ativo:** ele se abre e mostra a **mini-cena animada** daquela etapa, com atores e movimento (ex.: o cartão saindo do Claude e voando até o GitLab).
- **Mais zoom:** arquivos e comandos.

O mesmo canvas serve depois ao modo desenho (9.12).

### Três níveis de detalhe

- **Nível 1, a etapa:** "Criando testes unitários".
- **Nível 2, os itens da etapa:** "Status do sistema ✓ · Painel ⏳ · Manual de QA ○".
- **Nível 3, ao clicar:** dropdown com os **arquivos alterados** (abrem em outra aba do VS Code; oferecer também o **diff**), os comandos rodados com o resultado, e os **links** das ações externas (issue, MR, página publicada).

Leituras, buscas e o "agora vou olhar o arquivo X" **não viram bloco**: ficam guardados no nível 3.

### Zoom: processo, etapa, sub-passo

Um processo pode ser pequeno ou enorme. Os três níveis acima são o mínimo; na prática a profundidade é livre, e o usuário navega com **zoom**, como num mapa:

- **Zoom out:** o processo inteiro em poucos blocos (ex.: Tarefa no Jira → Criar tela → Integrar → Testar → Entregar).
- **Zoom in** num bloco: ele se abre nos sub-passos (ex.: "Criar tela" → espelho do Figma, design system, testes de componente, e2e, acessibilidade).
- **Zoom in de novo:** até chegar nos arquivos e comandos.

O estado se propaga para cima: um bloco fechado mostra o progresso agregado dos sub-passos ("3 de 5", com o que falhou em destaque). Sub-passos podem ser incluídos ou retirados em qualquer nível, conforme o processo evolui (regras da seção 9.5).

A linguagem visual dos mapas mentais vale aqui: na prática são fluxogramas encapsulados, que se abrem e fecham, bonitos e animados.

### Estados visuais

| Estado | Significado |
|---|---|
| Cinza | Etapa prevista, ainda não começou |
| Animando | Em andamento |
| Verde **comprovado** | Veio de evidência: o comando saiu com código 0, o arquivo foi alterado |
| Verde **declarado** | Só o modelo disse que fez |
| Amarelo | Pulada **com justificativa** registrada |
| Laranja | Desatualizada: algo depois dela mudou o que ela tinha produzido |
| Vermelho | Falhou, ou etapa obrigatória não feita |
| Bloco "não classificado" | Atividade que não se encaixou em nenhuma etapa; o buraco fica visível |

### Base técnica do canvas

| Biblioteca | Papel |
|---|---|
| **React Flow** (xyflow, núcleo MIT) | Canvas de nós e conexões: zoom, arrasto, minimapa, grupos aninhados. Cada nó é um componente React, então cabe SVG e animação. **Escolhida.** |
| **Motion** (antiga Framer Motion) | Animação dentro dos nós e nas conexões |
| **dagre ou ELK** | Layout automático: posição dos blocos na primeira vez |

Descartadas: **tldraw** (quadro branco de desenho livre; uso em produção exige licença própria, a confirmar), **Excalidraw** (estética de esboço) e **Konva/PixiJS** (baixo nível, tudo à mão).

**Posições dos blocos, como no n8n:** o texto das skills dá a ordem e as conexões, mas não a posição na tela. Na primeira vez, o layout automático calcula. Se o usuário arrasta um bloco, a posição fica salva no arquivo lateral visual (local) e é respeitada dali em diante.

### Complexidade (estimativa de 20/11/2026)

| Parte | Dificuldade | Por quê |
|---|---|---|
| Canvas com zoom, arrasto e minimapa | Baixa | A biblioteca entrega pronto |
| Nós bonitos e animados | Média | Trabalho de design, não de técnica |
| Posicionamento automático | Baixa a média | Linha reta é trivial; ramificações ficam com dagre/ELK; depois o usuário ajusta e salva |
| Abrir o bloco nos sub-passos (zoom) | Média | Os vizinhos precisam se afastar sem a tela "pular" |
| Editar no canvas (arrastar, conectar) | Baixa | A biblioteca já faz |
| Transformar a edição em alteração na skill | Baixa | O canvas só redige um prompt por tipo de ação; quem reescreve a skill é a instância do Claude (9.5) |
| Fazer o prompt chegar ao chat | A verificar | Área de transferência funciona sempre; injeção direta depende da extensão |

### Fases

1. **Fase 1: só o visual.** Mockup encenado, sem Claude real, sem hooks, sem ações. Só avança quando o visual estiver bem definido.
2. **Fase 2: as ações.** Ligar à execução real (seção 7) e, depois, as camadas do roteiro (seção 9).

### O mockup (fase 1)

Aplicação React + React Flow em `mockup/` (na raiz deste repositório), rodando localmente (`npm run dev`), que **encena** uma execução com dados falsos, como um vídeo que pode ser pausado:

1. **Linguagem visual:** estilo dos blocos e de cada estado da tabela acima, ícones dos atores, cores, tema claro e escuro. **Duas ou três variações de estilo** com uma chave para alternar, para escolher olhando.
2. **Canvas com um fluxo:** resolver ticket, com zoom, arrasto e minimapa.
3. **Execução encenada:** tocar, pausar e velocidade. Os blocos acendem e o fluxo corre pelas conexões.
4. **Zoom no bloco ativo:** abre nos sub-passos e mostra a mini-cena.
5. **Clique no bloco:** dropdown com arquivos e links falsos.
6. **Segundo fluxo, de outro projeto** ("Criar feature" do `frontend-cd-refactory`, seção 10): prova que o visual não é sob medida para um projeto só.
7. **Pedido no chat, encenado:** uma caixa de chat falsa ao lado do canvas. Ao "enviar" um pedido ("adiciona teste e2e depois dos unitários"), o cursor do Claude voa até o ponto, faz o shimmer e constrói o bloco novo (seção 9.5, "O caminho de volta").
8. **Mudança no canvas, encenada:** arrastar um bloco, ver a proposta tracejada e o prompt gerado, apertar "Aplicar".

## 6. Onde o painel aparece (molduras)

**Uma interface, várias molduras.** O painel é uma única aplicação web; cada ambiente só a emoldura.

| Ambiente | Moldura |
|---|---|
| VS Code | Aba própria, ao lado do chat do Claude Code (esquerda: a cena; direita: o chat). Modelo do Pencil: um editor visual que abre como aba. |
| Terminal puro | Página em `localhost` no navegador |
| App desktop | Pelo **mod nativo** (superfície `desktop`) ou pelo painel de navegador do app, que abre páginas locais. A verificar. |
| Sessão na nuvem | **Último passo, fora do foco atual.** O `localhost` de lá não é o do usuário. |

**Decidido em 20/11/2026: aplicação web (canvas React Flow) como principal.** A exigência visual da seção 5 pede liberdade total de animação, e a aplicação web é agnóstica de harness. O canvas roda numa aba do VS Code (modelo Pencil) e no navegador.
- **Mod nativo:** fica para depois, como "janela" leve para a aplicação ou resumo nas superfícies onde ela não chega (desktop, mobile). Prende ao Claude Code e talvez não aguente animação rica.

## 7. Como funciona por baixo (v1)

### Três fontes que se combinam

1. **O mapa**, lido das **fontes de processo** do projeto (seção 10): os nomes das etapas e a ordem esperada (os blocos cinza).
2. **A transição de etapa**: a lista de tarefas nativa (`TaskCreated`/`TaskCompleted`) e, quando faltar, um anúncio explícito do modelo. **Nunca como fonte única**, porque é justamente o tipo de instrução que modelo fraco esquece. O painel também **deduz sozinho**: chamou a skill de ticket, então começou o fluxo de ticket; rodou `vitest`, então está em testes.
3. **Os hooks, como evidência**: cada arquivo editado e cada comando rodado fica pendurado no bloco atual. É isso que alimenta o nível 3 e o verde comprovado.

Tarefas sem processo mapeado também funcionam: os blocos surgem conforme a execução anda (modo livre).

### Arquivos do dropdown: não depender só do Git

- No `ecnh-app`, a `.claude/` está no `.gitignore`, e é ali que ficam os controles: status, massas, chamados. Pelo Git, a etapa "atualizar documentações" apareceria vazia. Registrar os arquivos **pelo que os hooks viram ser editados**, usando o Git só como complemento. Isso inclui arquivos escritos por comando, como os scripts de painel e status.

### Verde comprovado: código de saída 0 não basta

O `projeto-ticket` documenta três vezes o "verde falso":
- `vitest` com "124 skipped" saindo com código 0, porque o `.env` não foi carregado;
- `tsc` abortando num arquivo gerado em `.next/` e nunca chegando em `src/`;
- 947 testes unitários e 206 e2e passando com o endpoint principal quebrado.

Por isso a evidência precisa de **critério por comando**, configurável: código 0 **e** zero testes pulados, **e** a saída cobrindo as pastas esperadas, e assim por diante. Sem critério definido, o verde fica **declarado**, não comprovado.
- Etapas sem arquivo (atualizar issue, abrir MR, publicar) mostram **links**.

### Paralelismo

O modelo roda coisas em paralelo e delega a subagentes (`agent_id` nos hooks). A cena precisa aceitar **vários atores ativos ao mesmo tempo**. Não é exigência da v1, mas o formato não pode impedir.

### Estado

- O estado da execução é local, um por sessão (`session_id`), fora do Git.
- O arquivo lateral visual, se existir, também fica local.

## 8. V1: escopo estreito

- Só **Claude Code**, só **VS Code** (com `localhost` de graça, pela mesma aplicação).
- **Só observa e mostra.** Não grava nada no projeto, não trava nada.
- Cena animada + trilha, três níveis, dropdown de arquivos e links.
- Verde comprovado separado de verde declarado; bloco "não classificado".
- **Um fluxo mapeado primeiro**: resolver ticket ou resolver issue. Depois os outros, um por um.
- **Antes da v1: o mockup animado** (seção 5, "O mockup"). A v1 é a fase 2; a fase 1 é só visual.

## 9. Roteiro (tudo o que foi debatido, em camadas)

### 9.1 Vocabulário amigável: a ponte entre intenção e peça nativa

| Nome amigável | Peça nativa | Para que serve |
|---|---|---|
| Regra permanente | `CLAUDE.md` / `.claude/rules` | O que vale sempre |
| Lembrança | Memória | Fatos e preferências aprendidos |
| Procedimento | Skill | Receita passo a passo de um tipo de tarefa |
| Especialista | Subagente (`.claude/agents`) | Delegar uma parte |
| Verificação | Script | Checagem sem IA: passou ou não |
| Trava | Hook + script | O script verifica; o hook decide **quando** e **bloqueia** |
| Gatilho automático | Hook (início de sessão, após editar…) | Algo que acontece sozinho num momento fixo |
| Permissão | Regras de permissão | O que pode sem perguntar e o que nunca pode |
| Conexão externa | Servidor MCP | GitLab, documentação, sistemas de fora |
| Pacote | Plugin | Levar tudo para outro projeto |

Intenções em português, traduzidas para hooks pelo adaptador:

| O usuário escolhe | Vira (Claude Code) |
|---|---|
| "Não deixar terminar sem…" | `Stop` |
| "Bloquear antes de…" | `PreToolUse` |
| "Marcar como feito quando…" | `PostToolUse` |
| "Pedir minha aprovação" | Regra de permissão |
| "Lembrar o modelo de… no início" | `UserPromptSubmit` / `SessionStart` |

Para escolher a peça certa (ex.: "quero uma camada de teste"), a ferramenta faz três perguntas: **precisa de julgamento?** (sim → passo na skill; não → script) · **pode ser pulada?** (não → trava) · **quando acontece?** (define o gatilho). Sempre mostra o que vai gravar antes de gravar.

Revelar recursos nativos que o projeto não usa: modo de planejamento, checkpoints, worktrees, tarefas em segundo plano e agendadas, subagentes.

### 9.2 Tipos de bloco

| Tipo | Quem executa | Verde quando |
|---|---|---|
| Determinístico | Script, sem IA | Script sai com código 0 |
| Julgamento | O modelo | Entrega a saída no formato exigido |
| Portão humano | O usuário | O usuário confirma |

Quanto mais etapas determinísticas, menos importa a força do modelo. Boa parte do fechamento do `ecnh-app` (status, painel, issues do GitLab, apagar branch) pode ser script puro.

### 9.3 Força das regras e "promover"

```
memória  →  regra  →  procedimento (skill)  →  trava (hook + script)
lembrete    sempre     passo a passo            não deixa passar
```

O painel mostra a força de cada regra e aponta: "esta memória se comporta como etapa obrigatória, mas é só lembrete; quer virar trava?". Exemplo do `ecnh-app`: "atualizar os controles no fim de toda tarefa" vive numa memória, mas na prática é etapa de todo fluxo. Promover com um clique, sem reescrever o processo do zero.

### 9.4 Níveis de garantia (agnóstico)

- **Bloqueia:** o harness permite travar.
- **Cobra:** só dá para observar; o painel acusa, mas não trava.

O nível de cada bloco fica visível. O que cada harness (Codex, Gemini) permite precisa ser verificado um por um.

### 9.5 Editar o processo pelo painel

- **Perguntar sempre:** "só nesta execução", "salvar no processo" ou ambos.
- **Só nesta execução** → o bloco entra numa **raia de extras**, ao lado da árvore principal, e some no fim da tarefa.
- **Salvar no processo** → o bloco passa para a árvore.
- **Bloco incluído numa etapa já passada** → vai para o **fim da fila** (ex.: incluir e2e antes do unitário quando os testes já rodaram).
- **Impacto:** cada bloco declara o que altera. Se o bloco tardio **não muda nada** (o e2e passou), nada volta. Se **muda algo** (achou defeito e corrigiu código), as etapas que dependem disso ficam **laranja** e o usuário escolhe refazer. O motor nunca refaz sozinho.
- **O canvas não reescreve nada: ele redige o pedido.** Toda alteração no desenho (ordem, condição, bloco novo, bloco retirado) vira um **prompt em texto**, que a instância do Claude em execução lê e aplica. O Claude interpreta texto melhor do que desenho; ele nunca lê o visual. O fluxo:
  1. O usuário muda o desenho. A mudança aparece como **proposta** (tracejada), ainda não real.
  2. O canvas monta o texto por baixo, a partir de um modelo por tipo de ação. Ex.: "Na skill `resolve-ticket`, inverta a ordem: execute B antes de A."
  3. Botão **"Aplicar"** → o texto vai para o chat, e o Claude edita a skill como qualquer pedido, com a aprovação de sempre.
  4. O canvas **relê os arquivos** e redesenha. Bateu com a proposta → o tracejado vira sólido. Não bateu → aviso de que a alteração não ficou como foi pedida.
  - O prompt é **autossuficiente**: arquivo, nomes das etapas, resultado final desejado. Assim até modelo mais fraco acerta.
  - Várias mudanças podem ir num único "Aplicar" (carrinho de alterações).
  - **Como o texto chega ao chat:** o mínimo, que funciona em qualquer ambiente, é copiar para a área de transferência. Injetar direto no chat do Claude Code depende do que a extensão permite: **a verificar**. Na fase 1, basta mostrar o prompt gerado.
  - Visual e texto nunca divergem por muito tempo: a releitura do passo 4 é a conferência.

#### O caminho de volta: chat → canvas (o Claude "construindo" ao vivo)

A outra metade do ciclo. O usuário **pede no chat** ("adiciona nessa parte do fluxo tal coisa"), o Claude edita a skill, e o canvas mostra a mudança **sendo construída**, como no Pencil: o cursor indo até lá, estrelinhas de "trabalhando", shimmer na cor do cursor, o retângulo surgindo.

- **Antes da edição** (`PreToolUse` numa skill ou regra): o cursor do Claude voa até o bloco do trecho que vai mudar; a área entra em shimmer.
- **Depois da edição** (`PostToolUse`): o canvas relê o arquivo, compara o desenho antigo com o novo e **anima só a diferença**: o bloco surge do shimmer, as setas se reconectam, os vizinhos abrem espaço.
- **Mapa de linhas:** ao ler a skill, o canvas guarda que trecho do texto gerou cada bloco, para saber para onde mandar o cursor. Edição sem bloco correspondente → o cursor vai ao grupo da skill.
- **Vários cursores:** cada subagente tem o seu, com cor própria (estilo multiplayer do Figma). Tarefas em paralelo aparecem como cursores trabalhando em lugares diferentes, o que resolve visualmente o paralelismo (seção 7).
- **Layout de longo prazo:** canvas de um lado e chat do outro, sempre se comunicando nos dois sentidos. As ferramentas para inserir elementos à mão vêm depois; primeiro, conversar e ver refletir.
- **Diferença para o CC Workflow Studio:** lá, a IA edita o desenho e o desenho gera os arquivos. Aqui, a IA edita os **arquivos de verdade** e o desenho reflete. O princípio do wrap continua.
- **Segurança:** o motor valida a estrutura (bloco solto, condição sem saída, laço sem fim); o modelo valida o sentido (ex.: "esse check chama um script que não existe"); tudo é versionado e pode ser desfeito.
- **Mudança durante a execução** só vale na fronteira da próxima etapa.
- **A interface conversa com o chat.** O que o usuário altera no painel chega à instância em execução como instrução que ela entende e executa (ex.: "o usuário incluiu a etapa e2e depois dos testes unitários"), e a resposta do modelo volta para o painel. **A verificar:** por qual canal o painel injeta isso na sessão. Candidatos: contexto adicional devolvido por hook (`UserPromptSubmit`, `PostToolUse`) ou uma ferramenta MCP que o modelo consulta a cada etapa.

### 9.6 Ler o projeto existente

- Ao instalar, ler o `.claude` (skills, regras, memórias, hooks) e propor o desenho do processo como **rascunho para aprovar**, não como verdade.
- Onde o modelo não consegue decidir o caminho, o texto da skill está ambíguo. **A leitura vira diagnóstico** das próprias skills: é ali que modelos fracos se perdem.
- Portabilidade de graça: como só lê o que é nativo, levar para outro projeto é instalar e abrir.

### 9.7 Trabalho em equipe: origem, switches e pull

**O problema:** com o `.claude` comitado, cada desenvolvedor injeta skills; no pull, as dos outros chegam sem ninguém perceber, e o modelo passa a obedecê-las, mesmo quando só faziam sentido na máquina de quem criou. Skills duplicadas se acumulam.

**O que o Claude Code já tem:** escopos. Global do usuário (`~/.claude`), projeto compartilhado (`.claude/` comitado, `settings.json`), projeto só do usuário (`settings.local.json`, `CLAUDE.local.md`, ou a pasta inteira no `.gitignore`, como no piloto).

**O que falta, e a ferramenta dá:**
- **Origem visível** em cada bloco: seu (local), do projeto (veio do Git), global seu, de um plugin.
- **Alerta pós-pull:** "chegaram 3 procedimentos novos do repositório: ver, aceitar, ignorar".
- **Switch por bloco** (válvula de bypass), com estado num arquivo local fora do Git. A skill continua no repositório e só sai com commit.
- **Detecção de duplicatas:** "estas duas skills fazem quase a mesma coisa".
- **Dependência:** antes de desligar, avisar "o procedimento Y usa este bloco" e mostrar o caminho alternativo.

**Garantia do switch, por tipo:**

| O que chegou | Switch desligado faz | Garantia |
|---|---|---|
| Skill inteira | Hook local barra a chamada da skill | Forte (a descrição ainda aparece para o modelo) |
| Hook, permissão, MCP | Configuração local sobrepondo a do projeto | Forte, a confirmar caso a caso |
| Regra em texto (`CLAUDE.md`, rules) | É carregada como contexto, não chamada | A verificar se dá para excluir localmente; senão, só nota pedindo para ignorar |
| Um passo dentro de uma skill | É prosa | Fraca: vira pedido ao modelo |

Na interface: **switch sólido** (garantido) e **switch tracejado** (só pedido).

**Teste planejado:** simular outro desenvolvedor injetando uma skill e fazendo pull.

### 9.8 Modo ensaio (sandbox)

- Mesmo fluxo, mas os blocos **externos** (git push, GitLab, API) são barrados por uma trava e devolvem resposta falsa do cenário. Roda numa cópia isolada (worktree).
- **Testar o fluxo:** um cenário por condição ("back-end respondeu", "não respondeu", "há chamado vinculado") e ver se cada caminho chega aonde deve.
- **Testar modelos contra o fluxo:** o mesmo ticket falso com Opus e com Sonnet, para ver qual guardrail cada um derruba. O caso do CEP vira **cenário permanente**: "a busca por CEP existe no código; o modelo deve achá-la antes de pedir endpoint".
- Na instalação: pré-configuração em sandbox que lê o projeto, entende o fluxo e simula sem falar com nada externo.

### 9.9 Outros harnesses

Motor e painel únicos; um adaptador por harness (Codex, Gemini). Os três aceitam MCP. A capacidade de travar varia e precisa ser verificada em cada um (ver 9.4). Existe também o modelo **piloto**: a ferramenta roda o agente em modo não interativo (`claude -p`, `codex exec`, `gemini -p`) e envia uma etapa por vez. É o controle mais forte, mas sem conversa ao vivo. Fica para depois; o modelo da v1 é "ao lado da conversa".

### 9.10 Vínculos em cadeia

Um bloco busca as ligações (issues, chamados vinculados) e abre um sub-fluxo **para cada item encontrado**. A tarefa só fecha com todos os ramos verdes.

### 9.11 Nuvem

Por último. Fora do foco atual.

### 9.12 Futuro: modo desenho (canvas)

Um segundo cenário, para **usuários avançados**, que já sabem o processo que querem:

- O usuário **desenha** o processo num canvas de blocos (estilo low-code, a mesma linguagem visual animada da seção 5).
- O Claude Code **lê o desenho e cria o que for necessário** nas peças nativas: skills, hooks, scripts, subagentes (seção 9.1).
- O canvas **evolui com as sugestões da IA**: conforme a conversa revela o tamanho do projeto, a escalabilidade e a melhor arquitetura, as sugestões viram blocos propostos no próprio canvas, para o usuário aceitar.

Assim a ferramenta cobre os dois caminhos:
- **Modo vivo (v1):** o processo nasce na conversa, e o painel o mostra.
- **Modo desenho (futuro):** o processo nasce no canvas, e o Claude o materializa.

Nos dois, a fonte da verdade continua sendo os arquivos nativos. O canvas é só outra forma de editá-los, com as mesmas regras de diff e aprovação da seção 9.5.

Referência: **CC Workflow Studio** (seção 4) já faz o "desenha e gera". O que falta nele, e seria o diferencial aqui, é o caminho de volta: ler o que existe, reconhecer o que a conversa mudou e manter o canvas sincronizado com os arquivos.

## 10. Projetos de referência

Três projetos reais do usuário, em `C:\www\`, **somente leitura** (lidos em 20/11/2026). A ferramenta tem de funcionar nos três sem ser sob medida para nenhum.

| | `ecnh-app` | `frontend-cd-refactory` | `projeto-ticket` |
|---|---|---|---|
| Onde está o processo | Skills + ~100 memórias + scripts, tudo na `.claude/` **ignorada pelo Git** (pessoal) | `.claude/rules/*.md` e `.claude/commands/*.md` **comitados**, importados pelo `CLAUDE.md` com `@` | `CLAUDE.md` longo e **comitado** + 2 skills (`tarefa`, `comita-e-envia`) + ~40 memórias |
| Onde está o andamento | Issues do GitLab; controles em `.claude/temp` | **`checklist.json` por tela**, validado contra o código por script; `docs/roadmap.md` | **`docs/specs/roadmap.md`** com status 🔲📝🚧✅; uma spec por tarefa |
| O que garante as regras | Instrução para a IA (memórias, skills) | **Máquina**: validadores npm, husky, commitlint, CI, plugin ESLint próprio | Quality gate de 5 comandos em ordem; ESLint `boundaries` |
| Transição entre instâncias | Memórias | Seção "Próxima tarefa" do roadmap | Seção "Estado atual" + aviso "tarefa finalizada, merge aberto" |
| Portão humano | Teste em tela pelo usuário | Itens † do checklist: "só o dev marca" | "Nunca mesclar: quem mescla é ele" |

### O que isso muda no desenho

1. **Fontes de processo plugáveis.** "Ler o projeto" não é só ler a `.claude/`. O processo pode estar em skills, comandos, regras, `CLAUDE.md`, memórias, scripts npm, hooks do Git (husky), CI e documentos de andamento (roadmap, checklist, spec). Cada fonte é um leitor; o projeto diz quais usa. O princípio do wrap (§3) vale também para a maquinaria que o projeto construiu fora do Claude.
2. **Zoom com um nível acima.** Os três têm backlog visível. O zoom completo é **roadmap → tarefa → etapa → sub-passo**. O `checklist.json` do cd-refactory já é um modelo de progresso pronto para ser lido como estado.
3. **Evidência por comando** (§7, "Verde comprovado").
4. **Portão humano é real nos três** e precisa de forma visual própria (§9.2).
5. **Transição entre instâncias** é um padrão comum: a ferramenta pode mostrar, ao abrir uma sessão, o "estado atual" que o projeto já registra.
6. **Biblioteca pessoal de fluxos.** O usuário repete processos entre projetos (há uma `comita-e-envia` no `ecnh-app` e outra no `projeto-ticket`, com conteúdos diferentes). Além dos fluxos de cada projeto, uma biblioteca de fluxos-base do usuário, que cada projeto adapta.
7. **Escopos convivem:** processo pessoal ignorado pelo Git (`ecnh-app`), processo comitado e compartilhado (cd-refactory, ticket) e memória pessoal sobre processo comitado (ticket). Valida a "origem visível" (§9.7).

### Fluxos a mapear no `ecnh-app`

Um por um, nesta ordem sugerida:

1. **Resolver ticket** (skill `resolve-ticket` + fechamento)
2. **Resolver issue** (skill `resolve-pendencias` + ciclo completo: branch, MR, atualizar issue)
3. **Fechar integração de tela** (skill `comita-e-envia`)
4. **Criar tela** (skill `criar-tela`)
5. **Fase por perfil**
6. **Fechamento comum**, o subprocesso que se repete em todos: status do sistema, painel, issues do GitLab, massas, chamados, manual de QA, apagar a branch depois do merge

Também serve para testar a seção 9.6: várias regras desse projeto vivem em memórias que se comportam como etapas.

### Fluxos a mapear no `frontend-cd-refactory`

- **Criar feature** (`/criar-feature`): coleta → análise do legado → rascunho → **aprovação** → checklist → UI → traduções → integração → testes → responsividade (portão humano).
- **Verificar tela** (`/verificar-tela`): seis travas automáticas → o que a máquina não pega → resumo.

### Fluxos a mapear no `projeto-ticket`

- **Tarefa** (`/tarefa`): consultar o roadmap → entender → id → spec → cenários → índice e roadmap 📝.
- **Comitar e enviar** (`/comita-e-envia`): branch → quality gate de 5 → commit → PR → merge pelo usuário → fechamento (roadmap ✅, "Estado atual") → sinal de fim de sessão.

### Caso de referência sem projeto aqui: front-end com Jira

Um processo de outro projeto em que o usuário trabalhou, para garantir que a ferramenta não fique sob medida só para o e-CNH:

1. **Tarefa definida no Jira** → chega ao desenvolvedor.
2. **Criar a tela**, que não é só sair codando:
   - espelho: há Figma? Seguir o Figma;
   - design system: aplicar os componentes que já existem;
   - testes unitários e de componente;
   - teste e2e, se houver;
   - acessibilidade: tags e propriedades corretas;
   - responsividade testada.
3. **Integrar:**
   - arquivos na camada de service;
   - tudo que fala com o back-end passa por um mapper, que traduz os dados e formata a exibição;
   - datas: transformar ou não; valores: formatar ou deixar para a tela.
4. **Testar a integração:** unitário e e2e, simulando estado vazio, carregamento e erro.

Mostra bem o zoom (seção 5): de longe são quatro blocos; de perto, cada um tem de quatro a seis sub-passos.

## 11. Em aberto / a verificar

- [ ] Mod nativo aguenta animação (SVG animado)? Define o papel do mod como janela (seção 6). Não bloqueia a fase 1.
- [ ] Licença do tldraw (só para registro; React Flow já escolhido).
- [ ] Usar o Agent Flow como base da captura ou só como referência?
- [ ] A lista de tarefas nativa está ativa nesta versão e com que granularidade aparece nos hooks?
- [ ] Dá para desligar localmente uma skill ou regra que veio do repositório sem apagar o arquivo?
- [ ] Estilo dos blocos: escolher entre as variações do mockup.
- [ ] Nome definitivo. "Max AI Flow" é o nome de trabalho; atenção: no `projeto-ticket`, "Max" está reservado para o assistente de IA do produto Maxwell.

## 12. Fontes

- Agent Flow: https://github.com/patoles/agent-flow
- CC Workflow Studio: https://github.com/breaking-brake/cc-wf-studio · https://dev.to/_46ea277e677b888e0cd13/cc-workflow-studio-visual-workflow-editor-for-claude-code-ai-agents-41bo
- Claude Code Hooks Multi-Agent Observability: https://github.com/disler/claude-code-hooks-multi-agent-observability
- Outros painéis: https://github.com/simple10/agents-observe · https://hoangsonww.github.io/Claude-Code-Agent-Monitor/ · https://darshannere.github.io/observagent · https://github.com/NirDiamant/claude-watch
- Claude Code (eventos de hook, tarefas, mods): https://github.com/anthropics/claude-code (`mods/types/claude-code.d.ts`, `mods/diff/README.md`, `CHANGELOG.md` v2.1.33)
