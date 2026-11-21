/**
 * `npm run validar`: confere cada fluxo de `src/fluxos` contra as regras do modelo e o mapa de
 * linhas contra os arquivos de verdade. Mostra a árvore com o trecho que gerou cada bloco.
 * Sai com código 1 se houver problema.
 */
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { estadoVisual } from '../src/modelo/estado-visual.ts'
import { todasAsEtapas } from '../src/modelo/esteira.ts'
import { validarExecucao, validarProcesso, type Problema } from '../src/modelo/validar.ts'
import { fluxos } from '../src/fluxos/index.ts'

const mockup = resolve(import.meta.dirname, '..')
let totalDeProblemas = 0

function relatar(titulo: string, problemas: Problema[]) {
  totalDeProblemas += problemas.length
  console.log(problemas.length === 0 ? `  ✓ ${titulo}` : `  ✗ ${titulo}`)
  for (const { onde, mensagem } of problemas) console.log(`      ${onde}: ${mensagem}`)
}

for (const { processo, execucoes, raiz } of fluxos) {
  console.log(`\n${processo.nome}  (${processo.projeto})`)
  const raizDoProjeto = resolve(mockup, raiz)

  // Mapa de linhas: cada trecho tem de existir no arquivo.
  const linhasDe = new Map<string, string[] | null>()
  for (const fonte of processo.fontes) {
    const caminho = isAbsolute(fonte.caminho) ? fonte.caminho : resolve(raizDoProjeto, fonte.caminho)
    linhasDe.set(fonte.id, existsSync(caminho) ? readFileSync(caminho, 'utf8').split(/\r?\n/) : null)
  }
  const problemasDoMapa: Problema[] = []
  for (const { etapa, caminho } of todasAsEtapas(processo.esteira)) {
    const recuo = '    ' + '  '.repeat(caminho.length)
    console.log(`${recuo}${etapa.nome}  [${etapa.tipo} · ${etapa.ator}${etapa.alvo ? ` → ${etapa.alvo}` : ''}]`)
    for (const { fonte, linhas } of etapa.origens) {
      const texto = linhasDe.get(fonte)
      const caminhoDaFonte = processo.fontes.find((f) => f.id === fonte)?.caminho ?? fonte
      if (texto === undefined) continue // fonte inexistente: o validador do processo acusa
      if (texto === null) {
        problemasDoMapa.push({ onde: `fonte "${fonte}"`, mensagem: `arquivo ${caminhoDaFonte} não encontrado` })
        continue
      }
      if (linhas.ate > texto.length) {
        problemasDoMapa.push({
          onde: `etapa "${etapa.id}"`,
          mensagem: `${caminhoDaFonte} tem ${texto.length} linhas; o trecho vai até a ${linhas.ate}`,
        })
        continue
      }
      const trecho = texto[linhas.de - 1].trim()
      const intervalo = linhas.de === linhas.ate ? `${linhas.de}` : `${linhas.de}-${linhas.ate}`
      console.log(`${recuo}  ← ${caminhoDaFonte}:${intervalo}  "${trecho.slice(0, 70)}${trecho.length > 70 ? '…' : ''}"`)
    }
  }

  relatar('processo', validarProcesso(processo))
  relatar('mapa de linhas', problemasDoMapa)
  for (const execucao of execucoes) {
    const estados = Object.values(execucao.registros).map((r) => estadoVisual(r.situacao))
    const contagem = [...new Set(estados)].map((e) => `${e} ${estados.filter((x) => x === e).length}`).join(', ')
    relatar(`execução "${execucao.sessao}"  (${contagem})`, validarExecucao(execucao, processo))
  }
}

console.log(totalDeProblemas === 0 ? '\nTudo válido.' : `\n${totalDeProblemas} problema(s).`)
if (totalDeProblemas > 0) process.exitCode = 1
