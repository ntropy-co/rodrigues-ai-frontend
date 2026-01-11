import { Greeting } from './Greeting'

interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
  inputBar?: React.ReactNode
}

export function MainContent({ inputBar }: MainContentProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 pb-40 md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        <Greeting />

        {/* Input Bar Slot (Centered Layout) */}
        {inputBar && (
          <div className="mx-auto mt-8 w-full max-w-2xl">{inputBar}</div>
        )}
      </div>
    </main>
  )
}
