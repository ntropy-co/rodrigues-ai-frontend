'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIConfig } from '@/hooks/useUIConfig'
import * as LucideIcons from 'lucide-react'

interface SuggestionCarouselProps {
  onSuggestionClick: (prompt: string) => void
}

export function SuggestionCarousel({
  onSuggestionClick
}: SuggestionCarouselProps) {
  const { suggestions, ui } = useUIConfig()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  // Detectar viewport e ajustar items por view
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1) // Mobile: 1 card
      } else {
        setItemsPerView(3) // Desktop: 3 cards
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Calcular total de páginas
  const totalPages = Math.ceil(suggestions.length / itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const nextPage = prev + itemsPerView
      return nextPage >= suggestions.length ? 0 : nextPage
    })
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const prevPage = prev - itemsPerView
      return prevPage < 0
        ? Math.max(0, suggestions.length - itemsPerView)
        : prevPage
    })
  }

  // Auto-scroll opcional (página por página)
  useEffect(() => {
    if (ui.features.carouselMode) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const nextPage = prev + itemsPerView
          return nextPage >= suggestions.length ? 0 : nextPage
        })
      }, 6000) // 6 segundos

      return () => clearInterval(interval)
    }
  }, [suggestions.length, ui.features.carouselMode, itemsPerView])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'basic':
        return 'text-green-600'
      case 'advanced':
        return 'text-blue-600'
      case 'expert':
        return 'text-purple-600'
      default:
        return 'text-gemini-gray-600'
    }
  }

  const getIcon = (iconName: string) => {
    const IconComponent = (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string }>
      >
    )[iconName]
    return IconComponent || LucideIcons.HelpCircle
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Indicadores de categoria */}
      <div className="mb-4 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-gemini-gray-600">Básico</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-gemini-gray-600">Avançado</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-purple-500" />
          <span className="text-gemini-gray-600">Expert</span>
        </div>
      </div>

      <div className="relative">
        {/* Botão anterior */}
        <button
          onClick={prevSlide}
          className="absolute -left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-all hover:shadow-lg"
        >
          <ChevronLeft className="h-5 w-5 text-gemini-gray-600" />
        </button>

        {/* Botão próximo */}
        <button
          onClick={nextSlide}
          className="absolute -right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md transition-all hover:shadow-lg"
        >
          <ChevronRight className="h-5 w-5 text-gemini-gray-600" />
        </button>

        {/* Container do carrossel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${Math.floor(currentIndex / itemsPerView) * 100}%)`
            }}
          >
            {suggestions.map((suggestion) => {
              const Icon = getIcon(suggestion.icon)

              return (
                <div
                  key={suggestion.id}
                  className="w-full flex-shrink-0 px-2 md:w-1/3"
                >
                  <button
                    onClick={() => onSuggestionClick(suggestion.prompt)}
                    className="group flex h-[70px] w-full flex-col items-start justify-between rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-gemini-gray-300 hover:shadow-sm active:scale-[0.98] dark:hover:border-gemini-gray-500"
                  >
                    {/* Primeira linha: Ícone + Tema */}
                    <div className="flex w-full items-center gap-2">
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 ${getCategoryColor(suggestion.category)}`}
                      />
                      <h3 className="truncate text-sm font-medium text-card-foreground transition-colors group-hover:text-gemini-blue">
                        {suggestion.title}
                      </h3>
                    </div>

                    {/* Segunda linha: Início da pergunta */}
                    <p className="line-clamp-1 w-full text-xs leading-tight text-muted-foreground">
                      {suggestion.description.length > 50
                        ? suggestion.description.substring(0, 50) + '...'
                        : suggestion.description}
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
            onClick={() => setCurrentIndex(pageIndex * itemsPerView)}
            className={`h-2 w-2 rounded-full transition-colors ${
              Math.floor(currentIndex / itemsPerView) === pageIndex
                ? 'bg-gemini-blue'
                : 'bg-gemini-gray-300'
            }`}
            aria-label={`Ir para página ${pageIndex + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
