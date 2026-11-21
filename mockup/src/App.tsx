import { Background, BackgroundVariant, Controls, Panel, ReactFlow } from '@xyflow/react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import '@xyflow/react/dist/style.css'
import './visual/tema.css'
import './visual/variacoes.css'
import { criarFeature, execucaoBudget } from './fluxos/criar-feature.ts'
import { montarCanvas } from './visual/montar-canvas.ts'
import { tiposDeNo } from './visual/tipos-de-no.ts'
import { VariacaoContexto } from './visual/variacao-contexto.ts'
import { ehTema, ehVariacao, temas, type Tema, type Variacao } from './visual/variacoes.ts'

const parametros = new URLSearchParams(window.location.search)

/** Estilo do bloco: Nítido. `?bloco=cena` mostra a Cena, guardada para a 1.5. */
const variacao: Variacao = ehVariacao(parametros.get('bloco')) ? (parametros.get('bloco') as Variacao) : 'nitido'

/**
 * Só a esteira entra no enquadramento inicial; o catálogo fica embaixo, a um arrasto.
 * `?ver=tudo` enquadra o canvas inteiro.
 */
const verTudo = parametros.get('ver') === 'tudo'
const entraNoEnquadramento = (id: string) => verTudo || !/^(estado|ator|titulo)-/.test(id)

const fundo = {
  nitido: { vao: 24, tamanho: 1.5 },
  cena: { vao: 36, tamanho: 2.5 },
}[variacao]

/** Tema: da URL (`?tema=dark`), do que ficou guardado neste navegador, ou o do sistema. */
function temaInicial(): Tema {
  const daUrl = parametros.get('tema')
  if (ehTema(daUrl)) return daUrl
  try {
    const guardado = localStorage.getItem('max-ai-flow:tema')
    if (ehTema(guardado)) return guardado
  } catch {
    // Armazenamento bloqueado: segue com o do sistema.
  }
  return 'system'
}

export default function App() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  const { nos, conexoes } = useMemo(() => montarCanvas(criarFeature, execucaoBudget, variacao), [])

  useEffect(() => {
    try {
      localStorage.setItem('max-ai-flow:tema', tema)
    } catch {
      // Sem armazenamento, a escolha só não sobrevive ao recarregar.
    }
    if (tema === 'system') delete document.documentElement.dataset.tema
    else document.documentElement.dataset.tema = tema
  }, [tema])

  return (
    <VariacaoContexto.Provider value={variacao}>
      <ReactFlow
        className={`variacao-${variacao}`}
        nodes={nos}
        edges={conexoes}
        nodeTypes={tiposDeNo}
        forceColorMode={tema === 'system' ? undefined : tema}
        nodesConnectable={false}
        onlyRenderVisibleElements
        fitView
        fitViewOptions={{
          padding: { top: '100px', bottom: '48px', left: '48px', right: '48px' },
          nodes: nos.filter((n) => entraNoEnquadramento(n.id)),
        }}
        minZoom={0.15}
        maxZoom={2.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={fundo.vao} size={fundo.tamanho} color="var(--dots)" />
        <Controls showInteractive={false} />
        <Panel position="top-right">
          <motion.div
            className="chave"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="chave-grupo pequeno" role="radiogroup" aria-label="Tema">
              {temas.map((t) => (
                <button
                  key={t.id}
                  role="radio"
                  aria-checked={t.id === tema}
                  className={t.id === tema ? 'ativo' : undefined}
                  onClick={() => setTema(t.id)}
                >
                  {t.id === tema && <motion.span layoutId="marcador-tema" className="chave-marcador" />}
                  <span className="chave-rotulo">{t.nome}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </Panel>
        <Panel position="top-left" className="titulo-do-fluxo">
          <strong>{criarFeature.nome}</strong>
          <span>{criarFeature.projeto} · execução de exemplo</span>
        </Panel>
      </ReactFlow>
    </VariacaoContexto.Provider>
  )
}
