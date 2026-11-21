import { createContext } from 'react'
import type { Variacao } from './variacoes.ts'

/** Variação de estilo ativa; os nós leem daqui, sem precisar remontar o grafo. */
export const VariacaoContexto = createContext<Variacao>('nitido')
