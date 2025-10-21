import { useState, useEffect, useCallback } from 'react'
import {
  CAROUSEL_MOBILE_BREAKPOINT,
  CAROUSEL_ITEMS_PER_VIEW_MOBILE,
  CAROUSEL_ITEMS_PER_VIEW_DESKTOP,
  CAROUSEL_AUTO_SCROLL_INTERVAL
} from '@/lib/constants'
import { calculateTotalPages, getCurrentPage } from '@/lib/utils/ui'

interface UseCarouselPaginationOptions {
  /** Total de items no carrossel */
  totalItems: number
  /** Habilitar auto-scroll */
  autoScroll?: boolean
}

interface UseCarouselPaginationReturn {
  /** Índice atual */
  currentIndex: number
  /** Items visíveis por vez */
  itemsPerView: number
  /** Total de páginas */
  totalPages: number
  /** Página atual (0-indexed) */
  currentPage: number
  /** Avançar para próxima página */
  nextSlide: () => void
  /** Voltar para página anterior */
  prevSlide: () => void
  /** Ir para página específica */
  goToPage: (pageIndex: number) => void
}

/**
 * Hook para gerenciar paginação de carrossel com suporte responsivo
 * @param options - Configurações do carrossel
 * @returns Estado e funções de controle do carrossel
 */
export function useCarouselPagination({
  totalItems,
  autoScroll = false
}: UseCarouselPaginationOptions): UseCarouselPaginationReturn {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(
    CAROUSEL_ITEMS_PER_VIEW_DESKTOP
  )

  // Detectar viewport e orientação, ajustar items por view
  useEffect(() => {
    const updateItemsPerView = () => {
      const isLandscape = window.matchMedia('(orientation: landscape)').matches
      const isMobile = window.innerWidth < CAROUSEL_MOBILE_BREAKPOINT

      if (isMobile) {
        // Mobile: 1 item em portrait, 2 em landscape
        setItemsPerView(isLandscape ? 2 : CAROUSEL_ITEMS_PER_VIEW_MOBILE)
      } else {
        // Desktop: 3 items em portrait, 4 em landscape
        setItemsPerView(isLandscape ? 4 : CAROUSEL_ITEMS_PER_VIEW_DESKTOP)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)

    // Listener para mudanças de orientação
    const mediaQuery = window.matchMedia('(orientation: landscape)')
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', updateItemsPerView)
    }

    return () => {
      window.removeEventListener('resize', updateItemsPerView)
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', updateItemsPerView)
      }
    }
  }, [])

  // Calcular valores derivados
  const totalPages = calculateTotalPages(totalItems, itemsPerView)
  const currentPage = getCurrentPage(currentIndex, itemsPerView)

  // Navegação
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const nextPage = prev + itemsPerView
      return nextPage >= totalItems ? 0 : nextPage
    })
  }, [itemsPerView, totalItems])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const prevPage = prev - itemsPerView
      return prevPage < 0 ? Math.max(0, totalItems - itemsPerView) : prevPage
    })
  }, [itemsPerView, totalItems])

  const goToPage = useCallback(
    (pageIndex: number) => {
      setCurrentIndex(pageIndex * itemsPerView)
    },
    [itemsPerView]
  )

  // Auto-scroll opcional
  useEffect(() => {
    if (!autoScroll) return

    const interval = setInterval(() => {
      nextSlide()
    }, CAROUSEL_AUTO_SCROLL_INTERVAL)

    return () => clearInterval(interval)
  }, [autoScroll, nextSlide])

  return {
    currentIndex,
    itemsPerView,
    totalPages,
    currentPage,
    nextSlide,
    prevSlide,
    goToPage
  }
}
