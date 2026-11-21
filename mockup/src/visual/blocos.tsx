import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'motion/react'
import { useContext } from 'react'
import type { EstadoVisual } from '../modelo/estado-visual.ts'
import { corDoAtor } from './atores.ts'
import { estaAtivo, estaConcluido, rotuloDoEstado } from './estados.ts'
import { IconeDoAtor } from './icone-do-ator.tsx'
import { IconeDoEstado } from './icone-do-estado.tsx'
import type { AtorExibido, DadosDoBloco, NoAtor, NoBloco, NoTitulo } from './montar-canvas.ts'
import { tamanhoDoBloco } from './montar-canvas.ts'
import { VariacaoContexto } from './variacao-contexto.ts'

/** Quatro alças, cada uma de entrada e de saída; a montagem do canvas escolhe qual usar. */
function Alcas() {
  const lados = [
    ['esq', Position.Left],
    ['dir', Position.Right],
    ['cima', Position.Top],
    ['baixo', Position.Bottom],
  ] as const
  return lados.flatMap(([id, posicao]) => [
    <Handle key={`${id}-t`} id={`${id}-t`} type="target" position={posicao} isConnectable={false} />,
    <Handle key={`${id}-s`} id={`${id}-s`} type="source" position={posicao} isConnectable={false} />,
  ])
}

function Bolinhas({ filhos }: { filhos: EstadoVisual[] }) {
  if (filhos.length === 0) return null
  const feitos = filhos.filter(estaConcluido).length
  return (
    <span className="bolinhas" title={`${feitos} de ${filhos.length} sub-passos`}>
      {filhos.map((estado, i) => (
        <span key={i} className="bolinha" data-estado={estado} />
      ))}
      <span className="bolinhas-conta">
        {feitos}/{filhos.length}
      </span>
    </span>
  )
}

function Selo({ estado }: { estado: EstadoVisual }) {
  return (
    <span className="selo" data-estado={estado}>
      <IconeDoEstado estado={estado} tamanho={12} />
      {rotuloDoEstado[estado]}
    </span>
  )
}

// ─── Nítido: o bloco de longe (escolhido na 1.1) ─────────────────────────────

function BlocoNitido({ etapa, estado, ator, alvo, filhos, detalhe }: DadosDoBloco) {
  return (
    <div className="bloco nitido" data-estado={estado} data-tipo={etapa.tipo}>
      <div className="nitido-topo">
        <span className="nitido-atores">
          <span className="nitido-ator" style={{ color: corDoAtor(ator.tipo) }} title={ator.nome}>
            <IconeDoAtor tipo={ator.tipo} tamanho={18} />
          </span>
          {alvo && (
            <>
              <svg className="nitido-seta" width="14" height="8" viewBox="0 0 14 8" aria-hidden>
                <path d="M0 4h12M9 1l3 3-3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <span className="nitido-alvo" style={{ color: corDoAtor(alvo.tipo) }} title={alvo.nome}>
                <IconeDoAtor tipo={alvo.tipo} tamanho={15} />
              </span>
            </>
          )}
        </span>
        <Selo estado={estado} />
      </div>
      <div className="nitido-nome">{etapa.nome}</div>
      <div className="nitido-rodape">
        <span className="detalhe">{detalhe}</span>
        <Bolinhas filhos={filhos} />
      </div>
    </div>
  )
}

// ─── Cena: o bloco aberto pelo zoom (guardado para a 1.5) ────────────────────

function Personagem({ ator, chamando }: { ator: AtorExibido; chamando?: boolean }) {
  return (
    <span className={`personagem${chamando ? ' chamando' : ''}`} style={{ color: corDoAtor(ator.tipo) }}>
      <span className="personagem-corpo">
        <IconeDoAtor tipo={ator.tipo} tamanho={26} />
      </span>
      <span className="personagem-nome">{ator.nome}</span>
    </span>
  )
}

function Trajeto({ estado }: { estado: EstadoVisual }) {
  const ativo = estaAtivo(estado)
  return (
    <span className="trajeto" data-estado={estado}>
      <svg className="trajeto-linha" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden>
        <path d="M0 6 Q 25 0 50 6 T 100 6" fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      {ativo ? (
        <>
          <span className="pacote-trilho">
            <span className="pacote" />
          </span>
          <span className="pacote-trilho atrasado">
            <span className="pacote" />
          </span>
        </>
      ) : (
        estado !== 'cinza' && (
          <span className="trajeto-marca">
            <IconeDoEstado estado={estado} tamanho={12} />
          </span>
        )
      )}
    </span>
  )
}

function BlocoCena({ etapa, estado, ator, alvo, filhos, detalhe }: DadosDoBloco) {
  const vezDoAtor = estado === 'aguardando-voce'
  return (
    <div className="bloco cena" data-estado={estado} data-tipo={etapa.tipo}>
      <div className="cena-palco">
        <Personagem ator={ator} chamando={vezDoAtor} />
        {alvo ? (
          <>
            <Trajeto estado={estado} />
            <Personagem ator={alvo} />
          </>
        ) : (
          <span className="cena-sozinho">
            <IconeDoEstado estado={estado} tamanho={14} />
          </span>
        )}
      </div>
      <div className="cena-texto">
        <div className="cena-nome">{etapa.nome}</div>
        <div className="cena-rodape">
          <Selo estado={estado} />
          <Bolinhas filhos={filhos} />
        </div>
        {detalhe && <div className="detalhe">{detalhe}</div>}
      </div>
    </div>
  )
}

// ─── Nós do React Flow ───────────────────────────────────────────────────────

const porVariacao = { nitido: BlocoNitido, cena: BlocoCena }

export function NoDeBloco({ data }: NodeProps<NoBloco>) {
  const variacao = useContext(VariacaoContexto)
  const Bloco = porVariacao[variacao]
  const { largura } = tamanhoDoBloco[variacao]
  return (
    <motion.div
      key={variacao}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
      style={{ width: largura }}
    >
      <Bloco {...data} />
      <Alcas />
    </motion.div>
  )
}

export function NoDeAtor({ data }: NodeProps<NoAtor>) {
  const variacao = useContext(VariacaoContexto)
  return (
    <div className={`ator-cartao ator-${variacao}`} style={{ color: corDoAtor(data.tipo) }}>
      <IconeDoAtor tipo={data.tipo} tamanho={34} />
      <span>{data.nome}</span>
    </div>
  )
}

export function NoDeTitulo({ data }: NodeProps<NoTitulo>) {
  return (
    <div className="titulo-secao">
      <div>{data.texto}</div>
      {data.subtitulo && <small>{data.subtitulo}</small>}
    </div>
  )
}
