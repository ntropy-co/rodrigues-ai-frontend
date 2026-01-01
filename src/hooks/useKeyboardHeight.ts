/**
 * Hook para detectar altura do teclado virtual (principalmente iOS)
 *
 * Usa a Visual Viewport API disponível no iOS Safari 13+
 * para calcular quando o teclado virtual está aberto e sua altura.
 *
 * @returns keyboardHeight - Altura do teclado em pixels
 *
 * @example
 * ```tsx
 * const keyboardHeight = useKeyboardHeight()
 * <div style={{ paddingBottom: `${keyboardHeight}px` }}>
 *   Content
 * </div>
 * ```
 */

'use client'

import { useState, useEffect } from 'react'

export function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    // Verifica se está no browser
    if (typeof window === 'undefined') return

    const handleResize = () => {
      // Visual Viewport API - disponível no iOS Safari 13+ e browsers modernos
      if (window.visualViewport) {
        const vpHeight = window.visualViewport.height
        const windowHeight = window.innerHeight

        // A diferença entre window.innerHeight e visualViewport.height
        // representa a altura do teclado virtual
        const calculatedKeyboardHeight = Math.max(0, windowHeight - vpHeight)

        setKeyboardHeight(calculatedKeyboardHeight)
      }
    }

    // Adicionar event listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)

      // Executar uma vez no mount
      handleResize()
    }

    // Limpeza
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
    }
  }, [])

  return keyboardHeight
}
