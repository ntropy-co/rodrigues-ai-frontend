import {
  useRef,
  useState,
  useCallback,
  useEffect,
  RefObject,
  TouchEvent
} from 'react'

interface UsePullToRefreshOptions {
  /** Container que será puxado (ref para o elemento scrollável) */
  containerRef: RefObject<HTMLElement | null>
  /** Callback quando refresh é ativado */
  onRefresh: () => Promise<void> | void
  /** Distância mínima para ativar refresh (px) */
  threshold?: number
  /** Distância máxima de pull (px) */
  maxPullDistance?: number
  /** Habilitado */
  enabled?: boolean
}

interface UsePullToRefreshReturn {
  /** Distância atual do pull em pixels */
  pullDistance: number
  /** Se está no estado de pulling */
  isPulling: boolean
  /** Se está refreshing (após soltar) */
  isRefreshing: boolean
  /** Progresso do pull (0-1) */
  pullProgress: number
}

/**
 * Hook para implementar pull-to-refresh gesture
 * @param options - Configurações do pull-to-refresh
 * @returns Estado do pull-to-refresh
 */
export function usePullToRefresh({
  containerRef,
  onRefresh,
  threshold = 80,
  maxPullDistance = 120,
  enabled = true
}: UsePullToRefreshOptions): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0)
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const touchStartY = useRef(0)
  const currentTouchY = useRef(0)
  const isAtTop = useRef(false)

  // Calcular progresso (0-1)
  const pullProgress = Math.min(pullDistance / threshold, 1)

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing) return

      const container = containerRef.current
      if (!container) return

      // Verificar se está no topo do scroll
      isAtTop.current = container.scrollTop === 0

      if (isAtTop.current) {
        touchStartY.current = e.touches[0].clientY
        currentTouchY.current = touchStartY.current
      }
    },
    [enabled, isRefreshing, containerRef]
  )

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!enabled || isRefreshing || !isAtTop.current) return

      const container = containerRef.current
      if (!container) return

      currentTouchY.current = e.touches[0].clientY
      const deltaY = currentTouchY.current - touchStartY.current

      // Só ativar pull se estiver puxando para baixo
      if (deltaY > 0) {
        setIsPulling(true)

        // Aplicar resistência (rubber band effect)
        // Quanto mais puxa, mais difícil fica
        const resistance = 0.5
        const distance = Math.min(deltaY * resistance, maxPullDistance)

        setPullDistance(distance)

        // Prevenir scroll nativo durante o pull
        if (distance > 10) {
          e.preventDefault()
        }
      }
    },
    [enabled, isRefreshing, containerRef, maxPullDistance]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!enabled || isRefreshing || !isPulling) return

    setIsPulling(false)

    // Se ultrapassou o threshold, ativar refresh
    if (pullDistance >= threshold) {
      setIsRefreshing(true)

      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull to refresh error:', error)
      } finally {
        // Animação de retorno
        setTimeout(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        }, 300)
      }
    } else {
      // Não atingiu threshold, voltar ao normal
      setPullDistance(0)
    }

    // Resetar
    touchStartY.current = 0
    currentTouchY.current = 0
    isAtTop.current = false
  }, [enabled, isRefreshing, isPulling, pullDistance, threshold, onRefresh])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !enabled) return

    // Adicionar event listeners
    container.addEventListener(
      'touchstart',
      handleTouchStart as unknown as EventListener
    )
    container.addEventListener(
      'touchmove',
      handleTouchMove as unknown as EventListener,
      {
        passive: false // Necessário para preventDefault()
      }
    )
    container.addEventListener(
      'touchend',
      handleTouchEnd as unknown as EventListener
    )

    return () => {
      container.removeEventListener(
        'touchstart',
        handleTouchStart as unknown as EventListener
      )
      container.removeEventListener(
        'touchmove',
        handleTouchMove as unknown as EventListener
      )
      container.removeEventListener(
        'touchend',
        handleTouchEnd as unknown as EventListener
      )
    }
  }, [containerRef, enabled, handleTouchStart, handleTouchMove, handleTouchEnd])

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    pullProgress
  }
}
