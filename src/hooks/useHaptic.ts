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
  const [isSupported, setIsSupported] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    // Verificar suporte à Vibration API
    const hasVibrationSupport =
      typeof window !== 'undefined' && 'vibrate' in navigator

    setIsSupported(hasVibrationSupport)

    // Verificar preferência de reduced-motion
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      // Haptic só habilitado se suportado E usuário não preferir reduced-motion
      setIsEnabled(hasVibrationSupport && !prefersReducedMotion)

      // Listener para mudanças na preferência
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      const handleChange = (e: MediaQueryListEvent) => {
        setIsEnabled(hasVibrationSupport && !e.matches)
      }

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      }
    }
  }, [])

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
