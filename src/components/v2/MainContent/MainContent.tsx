'use client'

import { Greeting } from './Greeting'
import { SuggestionCards } from './SuggestionCards'
import { SuggestionCarousel } from './SuggestionCarousel'
import { useUIConfig } from '@/hooks/useUIConfig'

interface MainContentProps {
  onSuggestionClick: (suggestion: string) => void
}

export function MainContent({ onSuggestionClick }: MainContentProps) {
  const { ui } = useUIConfig()

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-6">
      <Greeting />
      {ui.features.showSuggestions !== false &&
        (ui.features.carouselMode ? (
          <SuggestionCarousel onSuggestionClick={onSuggestionClick} />
        ) : (
          <SuggestionCards onSuggestionClick={onSuggestionClick} />
        ))}
    </main>
  )
}
