import { useState, useEffect } from 'react'

type OrientationType = 'portrait' | 'landscape'

interface UseOrientationReturn {
  /** Orientação atual do dispositivo */
  orientation: OrientationType
  /** Se está em modo paisagem */
  isLandscape: boolean
  /** Se está em modo retrato */
  isPortrait: boolean
  /** Ângulo de rotação da tela (0, 90, 180, 270) */
  angle: number
}

/**
 * Hook para detectar orientação da tela (portrait/landscape)
 * Usa Screen Orientation API quando disponível, fallback para window.matchMedia
 * @returns Estado de orientação da tela
 */
export function useOrientation(): UseOrientationReturn {
  const getOrientation = (): OrientationType => {
    // Tentar usar Screen Orientation API primeiro
    if (typeof window !== 'undefined' && window.screen?.orientation) {
      return window.screen.orientation.type.includes('landscape')
        ? 'landscape'
        : 'portrait'
    }

    // Fallback: usar window.matchMedia
    if (typeof window !== 'undefined') {
      return window.matchMedia('(orientation: landscape)').matches
        ? 'landscape'
        : 'portrait'
    }

    return 'portrait'
  }

  const getAngle = (): number => {
    if (typeof window !== 'undefined' && window.screen?.orientation) {
      return window.screen.orientation.angle
    }
    return 0
  }

  const [orientation, setOrientation] = useState<OrientationType>(getOrientation)
  const [angle, setAngle] = useState<number>(getAngle)

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation())
      setAngle(getAngle())
    }

    // Listener para Screen Orientation API
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange)
    }

    // Fallback listener para window.matchMedia
    const mediaQuery = window.matchMedia('(orientation: landscape)')
    // Usar método moderno se disponível
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleOrientationChange)
    } else {
      // Fallback para navegadores antigos
      mediaQuery.addListener(handleOrientationChange)
    }

    return () => {
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange)
      }
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleOrientationChange)
      } else {
        mediaQuery.removeListener(handleOrientationChange)
      }
    }
  }, [])

  return {
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    angle
  }
}
