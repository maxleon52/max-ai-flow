import type { TipoDeAtor } from '../modelo/tipos.ts'

/** Nome exibido quando o processo não dá um nome próprio ao ator. */
export const nomePadraoDoAtor: Record<TipoDeAtor, string> = {
  voce: 'Você',
  claude: 'Claude',
  codigo: 'Código',
  testes: 'Testes',
  'plataforma-git': 'Plataforma Git',
  api: 'API',
  documentacao: 'Documentação',
  chamados: 'Chamados',
}

export const tiposDeAtor = Object.keys(nomePadraoDoAtor) as TipoDeAtor[]

/** Cor de identidade: só os dois protagonistas têm cor própria; o resto usa a tinta do texto. */
export function corDoAtor(tipo: TipoDeAtor): string {
  if (tipo === 'claude') return 'var(--cor-claude)'
  if (tipo === 'voce') return 'var(--cor-voce)'
  return 'currentColor'
}
