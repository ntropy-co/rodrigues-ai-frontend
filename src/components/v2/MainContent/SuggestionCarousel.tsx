'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIConfig } from '@/hooks/useUIConfig'
import { useCarouselPagination } from '@/hooks/useCarouselPagination'
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

  // Hook personalizado para gerenciar paginação
  const { totalPages, currentPage, nextSlide, prevSlide, goToPage } =
    useCarouselPagination({
      totalItems: suggestions.length,
      autoScroll: ui.features.carouselMode
    })

  return (
    <div className="w-full max-w-4xl">
      <div className="relative">
        {/* Botão anterior */}
        <button
          onClick={prevSlide}
          className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-all hover-hover:shadow-lg dark:bg-gray-800"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-5 w-5 text-gemini-gray-600" />
        </button>

        {/* Botão próximo */}
        <button
          onClick={nextSlide}
          className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-all hover-hover:shadow-lg dark:bg-gray-800"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-5 w-5 text-gemini-gray-600" />
        </button>

        {/* Container do carrossel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentPage * 100}%)`
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
                    onClick={() => onSuggestionClick(suggestion.prompt)}
                    className="group flex h-[70px] w-full flex-col items-start justify-between rounded-xl border border-border bg-card p-3 text-left transition-all hover-hover:border-gemini-gray-300 hover-hover:shadow-sm active:scale-[0.98] dark:hover-hover:border-gemini-gray-500"
                    aria-label={`Sugestão: ${suggestion.title}`}
                  >
                    {/* Primeira linha: Ícone + Tema */}
                    <div className="flex w-full items-center gap-2">
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 ${getCategoryColor(suggestion.category)}`}
                      />
                      <h3 className="truncate text-sm font-medium text-card-foreground transition-colors group-hover-hover:text-gemini-blue">
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
            onClick={() => goToPage(pageIndex)}
            className={`h-2 w-2 rounded-full transition-colors ${
              currentPage === pageIndex
                ? 'bg-gemini-blue'
                : 'bg-gemini-gray-300'
            }`}
            aria-label={`Ir para página ${pageIndex + 1}`}
            aria-current={currentPage === pageIndex ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  )
}
