import type { Situacao } from './tipos.ts'

/**
 * Os estados visuais da CONCEPCAO §5, mais `aguardando-voce` (portão humano parado, esperando
 * o usuário) e `bloqueado` (depende de algo de fora), os dois a confirmar na 1.2.
 * O `nao-classificado` não vem de uma situação: é o tipo do bloco (`NaoClassificado`).
 */
export type EstadoVisual =
  | 'cinza'
  | 'animando'
  | 'aguardando-voce'
  | 'verde-comprovado'
  | 'verde-declarado'
  | 'amarelo'
  | 'bloqueado'
  | 'laranja'
  | 'vermelho'
  | 'nao-classificado'

export function estadoVisual(situacao: Situacao): EstadoVisual {
  switch (situacao.estado) {
    case 'prevista':
      return 'cinza'
    case 'em-andamento':
      return 'animando'
    case 'aguardando-voce':
      return 'aguardando-voce'
    case 'feita':
      return situacao.prova === 'comprovada' ? 'verde-comprovado' : 'verde-declarado'
    case 'pulada':
      return 'amarelo'
    case 'bloqueada':
      return 'bloqueado'
    case 'desatualizada':
      return 'laranja'
    case 'falhou':
      return 'vermelho'
  }
}
