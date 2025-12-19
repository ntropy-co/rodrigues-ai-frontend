import { Greeting } from './Greeting'
import { CPRStats } from '@/components/v2/Dashboard/CPRStats'

interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function MainContent({
  onSuggestionClick: _onSuggestionClick
}: MainContentProps) {
  void _onSuggestionClick // kept for interface compatibility
  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-8 md:px-12 lg:px-24">
      <div className="mx-auto mb-8 w-full max-w-4xl space-y-8">
        <Greeting />
        <CPRStats />
      </div>
    </main>
  )
}
