/**
 * Utilit

ários para copiar conteúdo com formatação preservada
 *
 * Implementa cópia de markdown formatado que cola corretamente no Word/Google Docs.
 * Prioriza text/html para compatibilidade máxima, com fallbacks para navegadores antigos.
 */

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'

/**
 * Estilos inline CSS para garantir formatação no Word
 * Word ignora classes CSS e estilos externos, apenas inline styles funcionam
 */
const WORD_COMPATIBLE_STYLES = `
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
  p { margin: 0.5em 0; }
  h1 { font-size: 20pt; font-weight: bold; margin: 1em 0 0.5em; }
  h2 { font-size: 16pt; font-weight: bold; margin: 0.8em 0 0.4em; }
  h3 { font-size: 14pt; font-weight: bold; margin: 0.7em 0 0.3em; }
  h4, h5, h6 { font-size: 12pt; font-weight: bold; margin: 0.6em 0 0.3em; }
  strong, b { font-weight: bold; }
  em, i { font-style: italic; }
  ul, ol { margin: 0.5em 0; padding-left: 1.5em; }
  li { margin: 0.3em 0; }
  a { color: #0066cc; text-decoration: underline; }
  code { background-color: #f4f4f4; padding: 2px 4px; font-family: Consolas, monospace; font-size: 0.9em; }
  pre { background-color: #f4f4f4; padding: 8px; border-left: 3px solid #ccc; overflow-x: auto; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1em; margin: 0.5em 0; color: #666; }
  table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background-color: #f4f4f4; font-weight: bold; }
</style>
`

/**
 * Converte markdown para HTML usando unified/remark/rehype
 * Usa as mesmas bibliotecas do MarkdownRenderer para consistência
 *
 * @param markdown - Conteúdo markdown a ser convertido
 * @returns HTML string formatado e sanitizado
 */
async function markdownToHtml(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse) // Parse markdown
    .use(remarkGfm) // GitHub Flavored Markdown (tabelas, strikethrough, etc)
    .use(remarkRehype, { allowDangerousHtml: true }) // Converter para HTML
    .use(rehypeSanitize) // Sanitizar HTML para segurança
    .use(rehypeStringify) // Stringify para HTML
    .process(markdown)

  const htmlBody = String(file)

  // Envolver em HTML completo com estilos inline para Word
  const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  ${WORD_COMPATIBLE_STYLES}
</head>
<body>
  ${htmlBody}
</body>
</html>
  `.trim()

  return fullHtml
}

/**
 * Converte HTML para texto simples (fallback)
 * Remove tags HTML e converte algumas para texto equivalente
 *
 * @param html - HTML string
 * @returns Texto simples
 */
function htmlToPlainText(html: string): string {
  return (
    html
      // Remove estilos e scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      // Converter listas para texto com bullets
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      // Converter quebras de linha
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      // Remover todas as outras tags
      .replace(/<[^>]+>/g, '')
      // Decodificar entidades HTML
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Limpar espaços múltiplos e quebras excessivas
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim()
  )
}

/**
 * Interface para resultado da operação de cópia
 */
interface CopyResult {
  ok: boolean
  method: 'modern' | 'execCommand' | 'plaintext' | 'failed'
}

/**
 * Copia conteúdo HTML formatado para o clipboard
 * Prioriza text/html para Word/Google Docs, com fallback para text/plain
 *
 * **Estratégia de compatibilidade:**
 * 1. Modern API (navigator.clipboard.write) - Chrome/Edge/Firefox modernos
 * 2. execCommand('copy') com contenteditable - Safari e navegadores mais antigos
 * 3. text/plain via writeText - último fallback
 *
 * **Limitações:**
 * - CSS complexo é ignorado pelo Word (apenas inline styles)
 * - Tabelas GFM funcionam mas sem estilos avançados
 * - Precisa de contexto HTTPS (http:// local não funciona em produção)
 *
 * @param options - Conteúdo HTML e texto simples
 * @returns Resultado da operação
 */
async function copyFormatted({
  htmlString,
  plainText
}: {
  htmlString: string
  plainText: string
}): Promise<CopyResult> {
  // Método 1: Modern Clipboard API (recomendado)
  try {
    if (navigator.clipboard && window.ClipboardItem) {
      const htmlBlob = new Blob([htmlString], { type: 'text/html' })
      const textBlob = new Blob([plainText], { type: 'text/plain' })

      const clipboardItem = new ClipboardItem({
        'text/html': htmlBlob,
        'text/plain': textBlob
      })

      await navigator.clipboard.write([clipboardItem])
      return { ok: true, method: 'modern' }
    }
  } catch (error) {
    console.warn('Modern clipboard API failed, trying fallback:', error)
  }

  // Método 2: execCommand com contenteditable (fallback para Safari)
  try {
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    container.style.top = '0'
    container.setAttribute('contenteditable', 'true')
    container.innerHTML = htmlString
    document.body.appendChild(container)

    // Selecionar todo o conteúdo
    const range = document.createRange()
    range.selectNodeContents(container)
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    }

    // Tentar copiar
    let success = false
    try {
      success = document.execCommand('copy')
    } catch (execError) {
      console.warn('execCommand failed:', execError)
    }

    // Limpar
    if (selection) {
      selection.removeAllRanges()
    }
    document.body.removeChild(container)

    if (success) {
      return { ok: true, method: 'execCommand' }
    }
  } catch (error) {
    console.warn('execCommand fallback failed:', error)
  }

  // Método 3: Fallback final - apenas texto simples
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(plainText)
      return { ok: true, method: 'plaintext' }
    }
  } catch (error) {
    console.error('All clipboard methods failed:', error)
  }

  return { ok: false, method: 'failed' }
}

/**
 * Wrapper principal: converte markdown para HTML e copia com formatação
 *
 * **Uso típico:**
 * ```typescript
 * await copyMarkdownAsFormatted(message.content)
 * ```
 *
 * **Suporta:**
 * - Negrito, itálico, sublinhado
 * - Listas ordenadas e não ordenadas
 * - Links clicáveis
 * - Títulos (H1-H6)
 * - Tabelas (GitHub Flavored Markdown)
 * - Código inline e blocos de código
 * - Blockquotes
 *
 * @param markdown - Conteúdo markdown original
 * @throws Error se todos os métodos de cópia falharem
 */
export async function copyMarkdownAsFormatted(markdown: string): Promise<void> {
  // Converter markdown para HTML
  const htmlString = await markdownToHtml(markdown)

  // Gerar versão texto simples como fallback
  const plainText = htmlToPlainText(htmlString)

  // Tentar copiar com formatação
  const result = await copyFormatted({ htmlString, plainText })

  if (!result.ok) {
    throw new Error('Falha ao copiar conteúdo. Tente novamente.')
  }

  // Log para debug (remover em produção se necessário)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Clipboard] Copied using method: ${result.method}`)
  }
}
