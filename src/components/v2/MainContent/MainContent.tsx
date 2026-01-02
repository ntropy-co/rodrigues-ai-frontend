import { useRouter } from 'next/navigation'
import { Greeting } from './Greeting'
import { Button } from '@/components/ui/button'
import { useLayoutStore } from '@/stores/layoutStore'
import {
  Upload,
  MessageSquarePlus,
  FileSearch,
  Calculator,
  History
} from 'lucide-react'

interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function MainContent({
  onSuggestionClick: _onSuggestionClick
}: MainContentProps) {
  const { openFilesSidebar } = useLayoutStore()
  const router = useRouter()

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-4 md:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Greeting />

        {/* Action Chips - Compact horizontal layout */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            onClick={() => openFilesSidebar()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Enviar documento
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => _onSuggestionClick?.('Quero analisar uma CPR.')}
            className="gap-2"
          >
            <MessageSquarePlus className="h-4 w-4" />
            Nova análise
          </Button>
        </div>

        {/* Quick Actions - Compact grid */}
        <div className="rounded-xl border border-verity-100 bg-white/60 p-4 backdrop-blur-sm">
          <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-verity-500">
            Atalhos rápidos
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push('/cpr/analise')}
              className="h-8 gap-1.5 text-xs"
            >
              <FileSearch className="h-3.5 w-3.5" />
              Analisar CPR
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push('/cpr/simulator')}
              className="h-8 gap-1.5 text-xs"
            >
              <Calculator className="h-3.5 w-3.5" />
              Simular CPR
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push('/cpr/historico')}
              className="h-8 gap-1.5 text-xs"
            >
              <History className="h-3.5 w-3.5" />
              Histórico
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
