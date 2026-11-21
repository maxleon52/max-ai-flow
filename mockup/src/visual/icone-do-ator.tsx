import type { ReactNode, SVGProps } from 'react'
import type { TipoDeAtor } from '../modelo/tipos.ts'

/*
 * Ícones duotom em 24×24: contorno em `currentColor` e preenchimento na mesma cor, transparente.
 * Desenhados aqui, sem biblioteca, para terem a mesma mão.
 */
const tinta = { fill: 'currentColor', fillOpacity: 0.16 } as const

const desenhos: Record<TipoDeAtor, ReactNode> = {
  voce: (
    <>
      <circle cx="12" cy="8" r="3.6" {...tinta} />
      <path d="M4.8 20c.6-3.9 3.5-6.2 7.2-6.2s6.6 2.3 7.2 6.2" {...tinta} />
    </>
  ),
  claude: (
    <>
      <path d="M11 3.5c.5 3.9 2.6 6 6.5 6.5-3.9.5-6 2.6-6.5 6.5-.5-3.9-2.6-6-6.5-6.5 3.9-.5 6-2.6 6.5-6.5Z" {...tinta} />
      <path d="M18.5 14.5c.2 1.6 1 2.4 2.5 2.5-1.5.2-2.3 1-2.5 2.5-.2-1.5-1-2.3-2.5-2.5 1.5-.1 2.3-.9 2.5-2.5Z" />
    </>
  ),
  codigo: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="3" {...tinta} />
      <path d="m9.5 10-2.5 2.5 2.5 2.5M14.5 10l2.5 2.5-2.5 2.5" />
    </>
  ),
  testes: (
    <>
      <path d="M9.5 3.5h5M10.5 3.5v5.2L5.3 17.6A2 2 0 0 0 7 20.5h10a2 2 0 0 0 1.7-2.9l-5.2-8.9V3.5" />
      <path d="M7.4 14.5h9.2l2.1 3.1a2 2 0 0 1-1.7 2.9H7a2 2 0 0 1-1.7-2.9Z" {...tinta} />
    </>
  ),
  'plataforma-git': (
    <>
      <circle cx="7" cy="5.5" r="2.2" {...tinta} />
      <circle cx="7" cy="18.5" r="2.2" {...tinta} />
      <circle cx="17" cy="9" r="2.2" {...tinta} />
      <path d="M7 7.7v8.6M17 11.2c0 3.3-3.3 4-8.2 5.6" />
    </>
  ),
  api: (
    <>
      <rect x="4" y="4" width="16" height="7" rx="2" {...tinta} />
      <rect x="4" y="13" width="16" height="7" rx="2" {...tinta} />
      <path d="M8 7.5h.01M8 16.5h.01M12 7.5h4M12 16.5h4" />
    </>
  ),
  documentacao: (
    <>
      <path d="M8 3.5h6.5L19 8v10.5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" {...tinta} />
      <path d="M14.5 3.5V8H19M9.5 12.5h6M9.5 16h4" />
      <path d="M3.5 7v12a3 3 0 0 0 3 3h8" strokeOpacity={0.5} />
    </>
  ),
  chamados: (
    <>
      <path
        d="M3.5 7.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2a2.5 2.5 0 0 0 0 5v2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-2a2.5 2.5 0 0 0 0-5Z"
        {...tinta}
      />
      <path d="M14.5 6v2M14.5 11v2M14.5 16v2" />
    </>
  ),
}

interface Props extends SVGProps<SVGSVGElement> {
  tipo: TipoDeAtor
  tamanho?: number
}

export function IconeDoAtor({ tipo, tamanho = 20, ...resto }: Props) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...resto}
    >
      {desenhos[tipo]}
    </svg>
  )
}
