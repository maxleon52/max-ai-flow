import type { EstadoVisual } from '../modelo/estado-visual.ts'

/** Glifo pequeno (14×14) do estado, para selos e LEDs. */
export function IconeDoEstado({ estado, tamanho = 14 }: { estado: EstadoVisual; tamanho?: number }) {
  const comum = {
    width: tamanho,
    height: tamanho,
    viewBox: '0 0 16 16',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  switch (estado) {
    case 'verde-comprovado':
      return (
        <svg {...comum}>
          <path d="m4 8.5 2.5 2.5L12 5.5" />
        </svg>
      )
    case 'verde-declarado':
      return (
        <svg {...comum} strokeDasharray="2 2">
          <path d="m4 8.5 2.5 2.5L12 5.5" />
        </svg>
      )
    case 'animando':
      return (
        <svg {...comum}>
          <path d="M8 2.5a5.5 5.5 0 1 1-5.5 5.5" />
        </svg>
      )
    case 'aguardando-voce':
      return (
        <svg {...comum}>
          <circle cx="8" cy="5.5" r="2.2" />
          <path d="M3.8 13.2c.5-2.4 2.1-3.7 4.2-3.7s3.7 1.3 4.2 3.7" />
        </svg>
      )
    case 'amarelo':
      return (
        <svg {...comum}>
          <path d="M3 8h7M7.5 4.5 11 8l-3.5 3.5M13 4v8" />
        </svg>
      )
    case 'bloqueado':
      return (
        <svg {...comum}>
          <rect x="3.5" y="7" width="9" height="6.5" rx="1.5" />
          <path d="M5.5 7V5.2a2.5 2.5 0 0 1 5 0V7" />
        </svg>
      )
    case 'laranja':
      return (
        <svg {...comum}>
          <path d="M12.5 6.5A4.8 4.8 0 0 0 3.6 6M3.5 9.5a4.8 4.8 0 0 0 8.9.5M12.8 3.2v3.4H9.4M3.2 12.8V9.4h3.4" />
        </svg>
      )
    case 'vermelho':
      return (
        <svg {...comum}>
          <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
        </svg>
      )
    case 'nao-classificado':
      return (
        <svg {...comum}>
          <path d="M6 6.2a2 2 0 1 1 2.8 1.8c-.5.3-.8.7-.8 1.3v.4M8 12h.01" />
        </svg>
      )
    case 'cinza':
      return (
        <svg {...comum}>
          <circle cx="8" cy="8" r="4.5" strokeDasharray="2.2 2.2" />
        </svg>
      )
  }
}
