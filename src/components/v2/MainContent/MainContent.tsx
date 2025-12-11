import { Greeting } from './Greeting'

interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function MainContent({
  onSuggestionClick: _onSuggestionClick
}: MainContentProps) {
  void _onSuggestionClick // kept for interface compatibility
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-8 md:px-12 lg:px-24">
      <Greeting />
    </main>
  )
}
