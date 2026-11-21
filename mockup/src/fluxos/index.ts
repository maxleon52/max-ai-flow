import type { Execucao, Processo } from '../modelo/tipos.ts'
import { execucaoAguardandoMerge, execucaoComFalha, tarefaDoRoadmap } from './exemplo-tarefa-do-roadmap.ts'

export interface FluxoDeExemplo {
  processo: Processo
  execucoes: Execucao[]
  /** Raiz do projeto, relativa à pasta `mockup/`; usada para conferir o mapa de linhas. */
  raiz: string
}

export const fluxos: FluxoDeExemplo[] = [
  { processo: tarefaDoRoadmap, execucoes: [execucaoAguardandoMerge, execucaoComFalha], raiz: '..' },
]
