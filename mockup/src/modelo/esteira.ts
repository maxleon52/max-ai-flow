import type { Conexao, Esteira, Etapa, Id } from './tipos.ts'

/** Conexões em linha reta, na ordem dada: a → b → c. O caso mais comum. */
export function emSequencia(...ids: Id[]): Conexao[] {
  return ids.slice(1).map((para, i) => ({ de: ids[i], para }))
}

export interface EtapaNoNivel {
  etapa: Etapa
  /** Ids das etapas acima dela, da raiz até a mãe. Vazio no primeiro nível. */
  caminho: Id[]
}

/** Todas as etapas da esteira, em qualquer nível, em profundidade. */
export function todasAsEtapas(esteira: Esteira, caminho: Id[] = []): EtapaNoNivel[] {
  return esteira.etapas.flatMap((etapa) => [
    { etapa, caminho },
    ...(etapa.subpassos ? todasAsEtapas(etapa.subpassos, [...caminho, etapa.id]) : []),
  ])
}
