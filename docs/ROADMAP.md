# Max AI Flow — roadmap

> Lista de tarefas na ordem de execução. O porquê de cada coisa está em [CONCEPCAO.md](CONCEPCAO.md) (seção indicada entre parênteses).
> Criado em 20/11/2026. Marcar `[x]` com a data ao concluir.
> **Regra:** não se começa uma fase sem fechar o **marco** da anterior.

---

## Fase 0 — Preparação

- [x] ~~**0.1 Referências visuais.** O usuário manda vídeos, sites ou apps de que gosta (opcional, mas acelera a 1.1).~~ *Pulada em 20/11/2026: sem referências no momento. O visual será escolhido olhando as variações da 1.1; se aparecer algo no caminho, um print ou GIF com uma frase do que agradou ("gosto de como o cartão voa no 0:42").*
- [x] **0.2 Esqueleto do mockup.** Vite + React + TypeScript + React Flow + Motion em `mockup/`. *(20/11/2026)*
  *Pronto quando:* `npm run dev` abre um canvas vazio com zoom e arrasto.
  *Versões:* Vite 8, React 19, TypeScript 7, `@xyflow/react` 13, `motion` 14, lint com Oxlint. No React Flow 13 o tema claro/escuro segue o sistema sozinho (`light-dark()`); para forçar, `forceColorMode`.
- [ ] **0.3 Modelo de dados do fluxo.** Processo → etapa → sub-passo, com estado, tipo, ator, arquivos, links e mapa de linhas (trecho da skill que gerou cada bloco). Tudo depende dele, por isso vem antes do visual. (§5, §7, §9.5)
  *Pronto quando:* tipos escritos e um fluxo de exemplo validando contra eles.
- [ ] **0.4 Dados falsos de dois fluxos.** "Resolver ticket" (`ecnh-app`) e "Criar feature" (`frontend-cd-refactory`), transcritos à mão no modelo da 0.3. Dois projetos diferentes já na largada. (§10)

## Fase 1 — Visual (mockup encenado, sem Claude real)

- [ ] **1.1 Linguagem visual.** Cores, tema claro e escuro, ícones dos atores, estilo dos blocos em **duas ou três variações** com uma chave para alternar. (§5)
  *Pronto quando:* o usuário escolhe uma variação.
- [ ] **1.2 Estados dos blocos.** Cinza, animando, verde comprovado, verde declarado, amarelo, laranja, vermelho, "não classificado". (§5)
- [ ] **1.3 Canvas completo.** Minimapa, layout automático (dagre) na primeira abertura, posição salva ao arrastar. (§5 "Base técnica")
- [ ] **1.4 Execução encenada.** Tocar, pausar, velocidade; blocos acendem em sequência; o fluxo corre pelas conexões. (§5 "O mockup")
- [ ] **1.5 Zoom que abre o bloco.** Sub-passos aparecem, os vizinhos abrem espaço sem "pular", progresso agregado no bloco fechado ("3 de 5"). (§5 "Zoom")
- [ ] **1.6 Mini-cenas animadas.** Uma por tipo de etapa: cartão voando ao GitLab, requisição indo e voltando da API, barra de testes, documentos se empilhando. (§5 "Movimento")
- [ ] **1.7 Clique no bloco.** Dropdown com arquivos (abrir e diff, de mentira), comandos com resultado, links. (§5 "Três níveis")
- [ ] **1.8 Segundo fluxo e nível de roadmap.** Seletor entre os dois fluxos da 0.4; zoom out até o roadmap do projeto (roadmap → tarefa → etapa). (§10)
- [ ] **1.9 Chat → canvas, encenado.** Chat falso ao lado; ao enviar um pedido, o cursor do Claude voa, faz shimmer e estrelinhas, e constrói o bloco. Dois cursores de cores diferentes para subagentes. (§9.5 "O caminho de volta")
- [ ] **1.10 Canvas → chat, encenado.** Arrastar um bloco → proposta tracejada → prompt gerado na tela → "Aplicar" → bloco sólido. Carrinho com várias mudanças. (§9.5)
- [ ] **1.11 Raia de extras e bloco tardio.** Bloco "só nesta execução" na raia; bloco incluído em etapa já passada vai para o fim da fila; dependentes ficam laranja. (§9.5)
- [ ] **🏁 Marco 1: visual congelado.** O usuário aprova a linguagem visual; ela não muda mais sem motivo forte.

## Fase 2 — Ligar à execução real (v1: só observa)

- [ ] **2.1 Verificações técnicas.** Lista de tarefas nativa nos hooks (`TaskCreated`/`TaskCompleted`) e sua granularidade; usar o Agent Flow como base da captura ou só como referência. (§4, §11)
- [ ] **2.2 Leitores de fontes de processo.** Um leitor por fonte (skill, comando, regra, `CLAUDE.md`, memória, scripts npm, husky, documento de andamento); gera o modelo da 0.3, com mapa de linhas, como **rascunho para aprovar**. Começar pelos dois fluxos da 0.4. (§9.6, §10)
- [ ] **2.3 Captura de eventos.** Hooks locais → servidor local → canvas ao vivo. Uma sessão, um painel (`session_id`). (§7)
- [ ] **2.4 Evento → etapa.** Mapa + tarefas nativas + dedução (chamou a skill X, rodou `vitest`) + bloco "não classificado". (§7)
- [ ] **2.5 Evidência.** Arquivos editados pelos hooks (o Git só complementa), comandos com **critério de evidência por comando** (código 0 não basta: testes pulados, cobertura das pastas), verde comprovado x declarado. (§7, "Verde comprovado")
- [ ] **2.6 Moldura VS Code.** Canvas numa aba, ao lado do chat; abrir arquivo e diff de verdade. (§6)
- [ ] **2.7 Moldura navegador.** A mesma aplicação em `localhost`. (§6)
- [ ] **2.8 Estado atual ao abrir a sessão.** Ler o que o projeto já registra (roadmap, "Próxima tarefa", "Estado atual", `checklist.json`) e mostrar no zoom out. (§10)
- [ ] **2.9 Demais fluxos dos três projetos, um por um.** Lista em §10. **Sem escrever nada nos projetos de referência**: a ferramenta só lê.
- [ ] **🏁 Marco 2: uma tarefa real acompanhada do início ao fim no canvas, em pelo menos dois dos três projetos.**

## Fase 3 — Conversa nos dois sentidos, com o Claude real

- [ ] **3.1 Canal até o chat.** Área de transferência primeiro; verificar injeção direta no chat do Claude Code. (§9.5)
- [ ] **3.2 Canvas → chat.** Modelos de prompt por ação (reordenar, incluir, retirar), "Aplicar", carrinho. (§9.5)
- [ ] **3.3 Chat → canvas.** `PreToolUse`/`PostToolUse` em skills e regras → cursor, shimmer, diff animado. (§9.5 "O caminho de volta")
- [ ] **3.4 Conferência.** Releitura após aplicar: proposta x resultado; aviso se não bater. (§9.5)
- [ ] **🏁 Marco 3: mudar uma ordem pelo canvas e incluir um passo pelo chat, ambos refletidos certos.**

## Fase 4 — Camadas de processo

- [ ] **4.1 Diagnóstico da leitura.** Apontar trechos ambíguos das skills e onde o zoom fica raso. (§9.6)
- [ ] **4.2 Força das regras.** Mostrar lembrete, regra, procedimento e trava; "promover" com um clique (via prompt, §9.5). (§9.3)
- [ ] **4.3 Vocabulário amigável e travas.** "Não deixar terminar sem…", "Bloquear antes de…" → hooks; as três perguntas para escolher a peça. (§9.1)
- [ ] **4.4 Tipos de bloco e níveis de garantia.** Determinístico, julgamento, portão humano; "bloqueia" x "cobra". (§9.2, §9.4)
- [ ] **4.5 Vínculos em cadeia.** Sub-fluxo por issue ou chamado vinculado; a tarefa só fecha com todos verdes. (§9.10)

## Fase 5 — Trabalho em equipe

- [ ] **5.1 Origem visível.** Seu, do projeto, global, de plugin (`InstructionsLoaded`). (§9.7)
- [ ] **5.2 Switches.** Sólido (garantido) x tracejado (pedido); verificar se dá para desligar regra do repositório localmente; aviso de dependência. (§9.7)
- [ ] **5.3 Alerta pós-pull.** "Chegaram N procedimentos novos": ver, aceitar, ignorar (`ConfigChange`). Teste simulando outro desenvolvedor. (§9.7)
- [ ] **5.4 Duplicatas.** "Estas duas skills fazem quase a mesma coisa." (§9.7)

## Fase 6 — Modo ensaio (sandbox)

- [ ] **6.1 Blocos externos barrados** com resposta falsa, numa worktree isolada. (§9.8)
- [ ] **6.2 Cenários por condição** e o **caso do CEP** como cenário permanente. (§9.8)
- [ ] **6.3 Comparar modelos** (Opus x Sonnet) no mesmo cenário. (§9.8)

## Fase 7 — Expansão

- [ ] **7.1 Portabilidade.** Empacotar (plugin ou comando) e instalar num projeto que não seja dos três de referência. (§9.6)
- [ ] **7.1b Biblioteca pessoal de fluxos.** Fluxos-base do usuário, adaptados por projeto. (§10)
- [ ] **7.2 Mod nativo** como janela no app desktop e no mobile. (§6)
- [ ] **7.3 Outros harnesses** (Codex, Gemini), com os níveis de garantia de cada um. (§9.9)
- [ ] **7.4 Modo desenho** (canvas que cria do zero) e ferramentas manuais de inserção. (§9.12)
- [ ] **7.5 Modo piloto** (agente não interativo, uma etapa por vez). (§9.9)
- [ ] **7.6 Nuvem.** (§9.11)
