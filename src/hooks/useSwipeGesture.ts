import { useRef, useState, useCallback, TouchEvent } from 'react'

interface UseSwipeGestureOptions {
  /** Distância mínima para considerar um swipe (px) */
  threshold?: number
  /** Velocidade mínima para considerar um swipe rápido (px/ms) */
  velocityThreshold?: number
  /** Callback quando swipe para esquerda for detectado */
  onSwipeLeft?: () => void
  /** Callback quando swipe para direita for detectado */
  onSwipeRight?: () => void
  /** Callback durante o arrasto (para feedback visual) */
  onDrag?: (offset: number) => void
}

interface UseSwipeGestureReturn {
  /** Offset atual do arrasto em pixels */
  dragOffset: number
  /** Se está arrastando atualmente */
  isDragging: boolean
  /** Handlers para os eventos de touch */
  handlers: {
    onTouchStart: (e: TouchEvent) => void
    onTouchMove: (e: TouchEvent) => void
    onTouchEnd: () => void
  }
}

/**
 * Hook para detectar gestos de swipe horizontal com feedback visual
 * @param options - Configurações do swipe gesture
 * @returns Estado e handlers para touch events
 */
export function useSwipeGesture({
  threshold = 50,
  velocityThreshold = 0.3,
  onSwipeLeft,
  onSwipeRight,
  onDrag
}: UseSwipeGestureOptions = {}): UseSwipeGestureReturn {
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging) return

      const touchCurrentX = e.touches[0].clientX
      const touchCurrentY = e.touches[0].clientY

      const deltaX = touchCurrentX - touchStartX.current
      const deltaY = touchCurrentY - touchStartY.current

      // Detectar se é um scroll vertical e cancelar swipe
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        setIsDragging(false)
        setDragOffset(0)
        return
      }

      // Adicionar resistência (rubber band effect)
      const resistance = 0.6
      const offset = deltaX * resistance

      setDragOffset(offset)
      onDrag?.(offset)
    },
    [isDragging, onDrag]
  )

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return

    const deltaX = dragOffset / 0.6 // Compensar resistência
    const deltaTime = Date.now() - touchStartTime.current
    const velocity = Math.abs(deltaX) / deltaTime

    // Determinar se foi um swipe válido
    const isValidSwipe = Math.abs(deltaX) > threshold || velocity > velocityThreshold

    if (isValidSwipe) {
      if (deltaX > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    }

    // Reset state
    setIsDragging(false)
    setDragOffset(0)
    touchStartX.current = 0
    touchStartY.current = 0
    touchStartTime.current = 0
    onDrag?.(0)
  }, [isDragging, dragOffset, threshold, velocityThreshold, onSwipeLeft, onSwipeRight, onDrag])

  return {
    dragOffset,
    isDragging,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd
    }
  }
}
