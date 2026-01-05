'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

interface ExportOptions {
  content: string
  title: string
  format: 'txt' | 'html' | 'md'
}

/**
 * Hook for exporting Canvas content to various formats.
 */
export function useCanvasExport() {
  const downloadFile = useCallback(
    (content: string, filename: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    []
  )

  const exportToTxt = useCallback(
    ({ content, title }: Omit<ExportOptions, 'format'>) => {
      // Strip HTML tags for plain text
      const plainText = content.replace(/<[^>]*>/g, '')
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.txt`
      downloadFile(plainText, filename, 'text/plain')
      toast.success(`Exportado como ${filename}`)
    },
    [downloadFile]
  )

  const exportToHtml = useCallback(
    ({ content, title }: Omit<ExportOptions, 'format'>) => {
      const htmlDoc = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Crimson Pro', Georgia, serif;
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
      line-height: 1.6;
      color: #1A3C30;
    }
    h1, h2, h3 { font-weight: 600; }
    code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 4px; }
    blockquote { border-left: 4px solid #1A3C30; margin-left: 0; padding-left: 1rem; opacity: 0.8; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
  <footer style="margin-top: 3rem; font-size: 0.875rem; opacity: 0.6;">
    Gerado por Verity Agro em ${new Date().toLocaleDateString('pt-BR')}
  </footer>
</body>
</html>`
      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.html`
      downloadFile(htmlDoc, filename, 'text/html')
      toast.success(`Exportado como ${filename}`)
    },
    [downloadFile]
  )

  const exportToMarkdown = useCallback(
    ({ content, title }: Omit<ExportOptions, 'format'>) => {
      // Basic HTML to Markdown conversion
      let markdown = content
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<i>(.*?)<\/i>/gi, '*$1*')
        .replace(/<u>(.*?)<\/u>/gi, '_$1_')
        .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
        .replace(/<mark>(.*?)<\/mark>/gi, '==$1==')
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n')
        .replace(/<code>(.*?)<\/code>/gi, '`$1`')
        .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<[^>]*>/g, '') // Remove remaining tags
        .replace(/\n{3,}/g, '\n\n') // Clean up extra newlines
        .trim()

      markdown = `# ${title}\n\n${markdown}\n\n---\n*Gerado por Verity Agro em ${new Date().toLocaleDateString('pt-BR')}*`

      const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.md`
      downloadFile(markdown, filename, 'text/markdown')
      toast.success(`Exportado como ${filename}`)
    },
    [downloadFile]
  )

  const exportCanvas = useCallback(
    (options: ExportOptions) => {
      switch (options.format) {
        case 'txt':
          exportToTxt(options)
          break
        case 'html':
          exportToHtml(options)
          break
        case 'md':
          exportToMarkdown(options)
          break
        default:
          toast.error('Formato de exportação não suportado')
      }
    },
    [exportToTxt, exportToHtml, exportToMarkdown]
  )

  return {
    exportCanvas,
    exportToTxt,
    exportToHtml,
    exportToMarkdown
  }
}
