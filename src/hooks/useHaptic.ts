import { useCallback, useEffect, useState } from 'react'

type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error'

interface UseHapticReturn {
  /** Disparar feedback háptico com padrão específico */
  trigger: (pattern?: HapticPattern) => void
  /** Se haptic feedback está disponível */
  isSupported: boolean
  /** Se haptic está habilitado (respeita reduced-motion) */
  isEnabled: boolean
}

/**
 * Padrões de vibração para diferentes tipos de interação
 * Valores em milissegundos, arrays representam [vibrate, pause, vibrate, ...]
 */
const HAPTIC_PATTERNS = {
  light: [10],
  medium: [15],
  heavy: [20],
  success: [5, 50, 10],
  error: [10, 100, 10, 100, 20]
} as const

/**
 * Hook para feedback háptico (vibração) em dispositivos touch
 * Respeita a preferência do usuário de reduced-motion
 * @returns Função trigger e estado de suporte/habilitação
 */
export function useHaptic(): UseHapticReturn {
  const [isSupported] = useState(() => {
    return typeof window !== 'undefined' && 'vibrate' in navigator
  })

  // Initialize isEnabled based on support AND reduced motion preference
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window === 'undefined') return false
    const supported = 'vibrate' in navigator
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    return supported && !reducedMotion
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const handleChange = (e: MediaQueryListEvent) => {
      // isSupported is constant for the session, safe to use from closure or state
      // strictly speaking, we should enable if supported AND NOT reduced motion
      const supported = 'vibrate' in navigator
      setIsEnabled(supported && !e.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, []) // Empty dependency array as we attach listener once

  const trigger = useCallback(
    (pattern: HapticPattern = 'light') => {
      if (!isEnabled || !isSupported) return

      try {
        const vibrationPattern = HAPTIC_PATTERNS[pattern]
        navigator.vibrate(vibrationPattern)
      } catch (error) {
        // Silently fail - haptic é um enhancement, não deve quebrar a app
        console.debug('Haptic feedback failed:', error)
      }
    },
    [isEnabled, isSupported]
  )

  return {
    trigger,
    isSupported,
    isEnabled
  }
}
