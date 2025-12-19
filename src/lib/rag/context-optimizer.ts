/**
 * Context Optimizer Utility (#140)
 *
 * Utilitários para limpar, segmentar (chunking) e estruturar dados
 * para melhorar a qualidade do contexto fornecido ao agente (RAG).
 */

export interface DocumentChunk {
  content: string
  metadata: {
    source: string
    page?: number
    section?: string
    tokens: number
  }
}

/**
 * Limpa texto removendo caracteres desnecessários e normalizando espaços
 */
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Múltiplos espaços -> 1 espaço
    .replace(/\n\s*\n/g, '\n') // Múltiplas quebras -> 1 quebra
    .trim()
}

/**
 * Divide texto em chunks baseados em tamanho de tokens aproximado
 * (Usando caracteres como proxy simples: ~4 chars = 1 token)
 */
export function chunkText(
  text: string,
  maxTokens: number = 500,
  overlapResult: number = 50
): string[] {
  const charsPerToken = 4
  const chunkSize = maxTokens * charsPerToken
  const overlapSize = overlapResult * charsPerToken

  const chunks: string[] = []
  let start = 0

  while (start < text.length) {
    let end = start + chunkSize

    // Tentar não cortar palavras no meio
    if (end < text.length) {
      const spaceIndex = text.lastIndexOf(' ', end)
      if (spaceIndex > start) {
        end = spaceIndex
      }
    }

    chunks.push(text.slice(start, end).trim())

    start += chunkSize - overlapSize
  }

  return chunks
}

/**
 * Cria metadados estruturados para um chunk
 */
export function enrichMetadata(
  content: string,
  baseMetadata: Record<string, unknown>
): DocumentChunk['metadata'] {
  // Estimativa simples de tokens
  const tokens = Math.ceil(content.length / 4)

  return {
    source:
      typeof baseMetadata.source === 'string' ? baseMetadata.source : 'unknown',
    page: typeof baseMetadata.page === 'number' ? baseMetadata.page : undefined,
    section:
      typeof baseMetadata.section === 'string'
        ? baseMetadata.section
        : undefined,
    tokens
  }
}

/**
 * Processa um documento cru para formato otimizado para RAG
 */
export function processDocumentForRAG(
  rawContent: string,
  source: string
): DocumentChunk[] {
  const cleaned = cleanText(rawContent)
  const textChunks = chunkText(cleaned)

  return textChunks.map((chunk) => ({
    content: chunk,
    metadata: enrichMetadata(chunk, { source })
  }))
}
