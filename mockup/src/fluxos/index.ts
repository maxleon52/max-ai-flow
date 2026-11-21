import type { Execucao, Processo } from '../modelo/tipos.ts'
import { criarFeature, execucaoBudget } from './criar-feature.ts'
import { execucaoAguardandoMerge, execucaoComFalha, tarefaDoRoadmap } from './exemplo-tarefa-do-roadmap.ts'
import { execucaoTicket42, resolverTicket } from './resolver-ticket.ts'

export interface FluxoDeExemplo {
  processo: Processo
  execucoes: Execucao[]
  /**
   * Raiz do projeto, relativa à pasta `mockup/` ou absoluta; usada só para conferir o mapa de
   * linhas. Os projetos de referência são lidos, nunca alterados.
   */
  raiz: string
}

export const fluxos: FluxoDeExemplo[] = [
  { processo: resolverTicket, execucoes: [execucaoTicket42], raiz: 'C:/www/ecnh-app' },
  { processo: criarFeature, execucoes: [execucaoBudget], raiz: 'C:/www/frontend-cd-refactory' },
  { processo: tarefaDoRoadmap, execucoes: [execucaoAguardandoMerge, execucaoComFalha], raiz: '..' },
]
