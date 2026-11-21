/**
 * Estilos de bloco. Na 1.1 (21/11/2026) o usuário escolheu o **Nítido** para o canvas; a **Cena**
 * fica guardada para a 1.5, quando o zoom abre o bloco ativo na mini-cena. O Circuito saiu.
 * Até a 1.5, `?bloco=cena` na URL mostra a Cena no canvas inteiro, para revisitar.
 */
export const variacoes = ['nitido', 'cena'] as const

export type Variacao = (typeof variacoes)[number]

export function ehVariacao(valor: unknown): valor is Variacao {
  return variacoes.includes(valor as Variacao)
}

export type Tema = 'system' | 'light' | 'dark'

export const temas: { id: Tema; nome: string }[] = [
  { id: 'system', nome: 'Sistema' },
  { id: 'light', nome: 'Claro' },
  { id: 'dark', nome: 'Escuro' },
]

export function ehTema(valor: unknown): valor is Tema {
  return temas.some((t) => t.id === valor)
}
