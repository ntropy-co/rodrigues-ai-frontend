import { useRouter } from 'next/navigation'
import { Greeting } from './Greeting'
import { useLayoutStore } from '@/features/chat'
import { Upload, FileSearch, Calculator } from 'lucide-react'

interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function MainContent({
  onSuggestionClick: _onSuggestionClick
}: MainContentProps) {
  const { openFilesSidebar } = useLayoutStore()
  const router = useRouter()

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        <Greeting />

        {/* Organic Starter Prompts (Pill Rail) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => openFilesSidebar()}
            className="group flex items-center gap-2 rounded-full border border-sand-300 bg-white/40 px-5 py-2.5 text-sm font-medium text-verity-900 backdrop-blur-sm transition-all hover:border-verity-300 hover:bg-white/80 active:scale-95"
          >
            <Upload className="h-4 w-4 text-verity-600 group-hover:text-verity-800" />
            Enviar documento
          </button>

          <button
            onClick={() => router.push('/cpr/analise')}
            className="group flex items-center gap-2 rounded-full border border-sand-300 bg-white/40 px-5 py-2.5 text-sm font-medium text-verity-900 backdrop-blur-sm transition-all hover:border-verity-300 hover:bg-white/80 active:scale-95"
          >
            <FileSearch className="h-4 w-4 text-verity-600 group-hover:text-verity-800" />
            Analisar CPR
          </button>

          <button
            onClick={() => router.push('/cpr/simulator')}
            className="group flex items-center gap-2 rounded-full border border-sand-300 bg-white/40 px-5 py-2.5 text-sm font-medium text-verity-900 backdrop-blur-sm transition-all hover:border-verity-300 hover:bg-white/80 active:scale-95"
          >
            <Calculator className="h-4 w-4 text-verity-600 group-hover:text-verity-800" />
            Simulador
          </button>
        </div>
      </div>
    </main>
  )
}
