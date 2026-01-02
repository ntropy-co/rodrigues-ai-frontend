'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIConfig } from '@/hooks/useUIConfig'
import { useCarouselPagination } from '@/hooks/useCarouselPagination'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { useHaptic } from '@/hooks/useHaptic'
import { getIconComponent, getCategoryColor } from '@/lib/utils/ui'
import { truncateText } from '@/lib/utils/format'
import { MAX_DESCRIPTION_LENGTH } from '@/lib/constants'

interface SuggestionCarouselProps {
  onSuggestionClick: (prompt: string) => void
}

export function SuggestionCarousel({
  onSuggestionClick
}: SuggestionCarouselProps) {
  const { suggestions, ui } = useUIConfig()
  const [swipeDragOffset, setSwipeDragOffset] = useState(0)
  const { trigger: triggerHaptic } = useHaptic()

  // Hook personalizado para gerenciar paginação
  const { totalPages, currentPage, nextSlide, prevSlide, goToPage } =
    useCarouselPagination({
      totalItems: suggestions.length,
      autoScroll: ui.features.carouselMode
    })

  // Wrap navigation with haptic feedback
  const handleNextSlide = () => {
    triggerHaptic('light')
    nextSlide()
  }

  const handlePrevSlide = () => {
    triggerHaptic('light')
    prevSlide()
  }

  const handleGoToPage = (pageIndex: number) => {
    triggerHaptic('light')
    goToPage(pageIndex)
  }

  const handleSuggestionClick = (prompt: string) => {
    triggerHaptic('medium')
    onSuggestionClick(prompt)
  }

  // Hook de swipe gesture para navegação por toque com haptic
  const handleSwipeLeft = () => {
    triggerHaptic('success')
    nextSlide()
  }

  const handleSwipeRight = () => {
    triggerHaptic('success')
    prevSlide()
  }

  const { handlers } = useSwipeGesture({
    threshold: 50,
    velocityThreshold: 0.3,
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onDrag: setSwipeDragOffset
  })

  return (
    <div className="w-full max-w-4xl">
      <div className="relative">
        {/* Botão anterior */}
        <button
          onClick={handlePrevSlide}
          className="absolute -left-4 top-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md transition-all hover-hover:shadow-lg dark:bg-verity-800"
          aria-label="Página anterior"
        >
          <ChevronLeft className="text-gemini-verity-500 h-5 w-5" />
        </button>

        {/* Botão próximo */}
        <button
          onClick={handleNextSlide}
          className="absolute -right-4 top-1/2 z-10 flex min-h-[44px] min-w-[44px] -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 shadow-md transition-all hover-hover:shadow-lg dark:bg-verity-800"
          aria-label="Próxima página"
        >
          <ChevronRight className="text-gemini-verity-500 h-5 w-5" />
        </button>

        {/* Container do carrossel */}
        <div className="overflow-hidden" {...handlers}>
          <div
            className="ease-spring-smooth flex transition-transform duration-500"
            style={{
              transform: `translate3d(calc(-${currentPage * 100}% + ${swipeDragOffset}px), 0, 0)`,
              transition: swipeDragOffset !== 0 ? 'none' : undefined
            }}
          >
            {suggestions.map((suggestion) => {
              const Icon = getIconComponent(suggestion.icon)

              return (
                <div
                  key={suggestion.id}
                  className="w-full flex-shrink-0 px-2 md:w-1/3"
                >
                  <button
                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                    className="hover-hover:border-gemini-sand-400 dark:hover-hover:border-gemini-sand-500 group flex h-[70px] w-full flex-col items-start justify-between rounded-xl border border-border bg-card p-3 text-left transition-all active:scale-[0.98] hover-hover:shadow-sm"
                    aria-label={`Sugestão: ${suggestion.title}`}
                  >
                    {/* Primeira linha: Ícone + Tema */}
                    <div className="flex w-full items-center gap-2">
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 ${getCategoryColor(suggestion.category)}`}
                      />
                      <h3 className="group-hover-hover:text-gemini-blue truncate text-sm font-medium text-card-foreground transition-colors">
                        {suggestion.title}
                      </h3>
                    </div>

                    {/* Segunda linha: Início da pergunta */}
                    <p className="line-clamp-1 w-full text-xs leading-tight text-muted-foreground">
                      {truncateText(
                        suggestion.description,
                        MAX_DESCRIPTION_LENGTH
                      )}
                    </p>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Indicadores de posição */}
      <div className="mt-4 flex justify-center gap-1">
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <button
            key={pageIndex}
            onClick={() => handleGoToPage(pageIndex)}
            className={`h-2 w-2 rounded-full transition-colors ${
              currentPage === pageIndex
                ? 'bg-gemini-blue'
                : 'bg-gemini-sand-400'
            }`}
            aria-label={`Ir para página ${pageIndex + 1}`}
            aria-current={currentPage === pageIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  )
}
