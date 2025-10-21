'use client'

import { useState, useEffect, useRef } from 'react'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer/MarkdownRenderer'

interface StreamingTextProps {
  text: string
  speed?: number // Caracteres por segundo
  className?: string
  renderMarkdown?: boolean
}

export function StreamingText({
  text,
  speed = 50,
  className,
  renderMarkdown = false
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const previousTextRef = useRef('')
  const previousLengthRef = useRef(0)

  useEffect(() => {
    // Se o texto ficou mais curto (nova mensagem), reiniciar do zero
    if (text.length < previousLengthRef.current) {
      setDisplayedText('')
      setCurrentIndex(0)
      previousTextRef.current = ''
      previousLengthRef.current = 0
    }

    // Se não há novo conteúdo para mostrar, parar
    if (currentIndex >= text.length) {
      previousTextRef.current = text
      previousLengthRef.current = text.length
      return
    }

    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Calcular velocidade baseada no conteúdo restante
    const interval = Math.max(5, 1000 / speed) // Mínimo de 5ms entre caracteres para fluidez

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const newIndex = prevIndex + 1
        if (newIndex <= text.length) {
          const newDisplayText = text.slice(0, newIndex)
          setDisplayedText(newDisplayText)
          return newIndex
        } else {
          // Streaming completado
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          previousTextRef.current = text
          previousLengthRef.current = text.length
          return prevIndex
        }
      })
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [text, speed, currentIndex])

  // Limpar na desmontagem do componente
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const isStreaming = currentIndex < text.length

  if (renderMarkdown) {
    return (
      <div className={className}>
        <MarkdownRenderer classname="prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-hr:my-2 prose-hr:border-muted-foreground/20 max-w-none w-full [&_hr~p]:text-xs [&_hr~p]:opacity-70 [&_hr~p_strong]:text-xs [&_hr~p_strong]:font-medium">
          {displayedText}
        </MarkdownRenderer>
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-gemini-blue"></span>
        )}
      </div>
    )
  }

  return (
    <span className={className}>
      {displayedText}
      {isStreaming && (
        <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-gemini-blue"></span>
      )}
    </span>
  )
}
