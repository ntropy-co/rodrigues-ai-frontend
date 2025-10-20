import { useEffect, useState, RefObject } from 'react'
import { SCROLL_BOTTOM_THRESHOLD } from '@/lib/constants'
import { isNearBottom } from '@/lib/utils/ui'

interface UseScrollDetectionOptions {
  /** Threshold em pixels para considerar "próximo ao fim" */
  threshold?: number
  /** Referência ao elemento de scroll */
  containerRef: RefObject<HTMLElement | null>
}

interface UseScrollDetectionReturn {
  /** true se o usuário rolou para cima (não está próximo ao fim) */
  showScrollButton: boolean
  /** Função para rolar até o fim */
  scrollToBottom: () => void
}

/**
 * Hook para detectar posição de scroll e mostrar botão de "scroll to bottom"
 * @param options - Configurações do hook
 * @returns Estado e função para controlar scroll
 */
export function useScrollDetection({
  threshold = SCROLL_BOTTOM_THRESHOLD,
  containerRef
}: UseScrollDetectionOptions): UseScrollDetectionReturn {
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const nearBottom = isNearBottom(
        scrollTop,
        scrollHeight,
        clientHeight,
        threshold
      )
      setShowScrollButton(!nearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [containerRef, threshold])

  const scrollToBottom = () => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }

  return { showScrollButton, scrollToBottom }
}
