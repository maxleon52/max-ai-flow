import type { EstadoVisual } from '../modelo/estado-visual.ts'

export const rotuloDoEstado: Record<EstadoVisual, string> = {
  cinza: 'Previsto',
  animando: 'Em andamento',
  'aguardando-voce': 'Sua vez',
  'verde-comprovado': 'Comprovado',
  'verde-declarado': 'Declarado',
  amarelo: 'Pulado',
  bloqueado: 'Bloqueado',
  laranja: 'Desatualizado',
  vermelho: 'Falhou',
  'nao-classificado': 'Não classificado',
}

export const estadosVisuais = Object.keys(rotuloDoEstado) as EstadoVisual[]

/** Estados em que a vez é de alguém agora: o bloco pulsa e a conexão que chega nele corre. */
export function estaAtivo(estado: EstadoVisual): boolean {
  return estado === 'animando' || estado === 'aguardando-voce'
}

export function estaConcluido(estado: EstadoVisual): boolean {
  return estado === 'verde-comprovado' || estado === 'verde-declarado' || estado === 'amarelo'
}
