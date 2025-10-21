'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { COPY_FEEDBACK_DURATION } from '@/lib/constants'
import { copyMarkdownAsFormatted } from '@/lib/utils/clipboard'

interface CopyButtonProps {
  /** Conteúdo a ser copiado para o clipboard */
  content: string
  /** Classe CSS adicional (opcional) */
  className?: string
  /** Mensagem de sucesso customizada (opcional) */
  successMessage?: string
  /** Mensagem de erro customizada (opcional) */
  errorMessage?: string
  /** Se true, copia com formatação preservada (markdown → HTML) para Word */
  formatted?: boolean
}

/**
 * Botão para copiar texto para a área de transferência
 * Exibe feedback visual e toast notification
 */
export function CopyButton({
  content,
  className = '',
  successMessage = 'Copiado para a área de transferência',
  errorMessage = 'Erro ao copiar texto',
  formatted = false
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (formatted) {
        // Copiar com formatação preservada (markdown → HTML)
        await copyMarkdownAsFormatted(content)
      } else {
        // Copiar apenas texto simples
        await navigator.clipboard.writeText(content)
      }
      setCopied(true)
      toast.success(successMessage)
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error(errorMessage)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs opacity-0 transition-all hover:bg-background/50 group-hover:opacity-100 ${className}`}
      aria-label="Copiar mensagem"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Copiado</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copiar</span>
        </>
      )}
    </button>
  )
}
