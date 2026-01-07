import { useRouter } from 'next/navigation'
import { Greeting } from './Greeting'
import { CPRStats } from '@/components/v2/Dashboard/CPRStats'
import { Button } from '@/components/ui/button'
import { useLayoutStore } from '@/stores/layoutStore'

interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function MainContent({
  onSuggestionClick: _onSuggestionClick
}: MainContentProps) {
  const { openFilesSidebar } = useLayoutStore()
  const router = useRouter()

  return (
    <main className="flex flex-1 flex-col justify-center px-4 py-8 md:px-12 lg:px-24">
      <div className="mx-auto mb-8 w-full max-w-4xl space-y-8">
        <Greeting />
        <CPRStats />
        <div className="rounded-2xl border border-verity-100 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-verity-950">
              Comece uma analise
            </h2>
            <p className="text-sm text-verity-600">
              Envie um documento ou inicie uma conversa com a assistente.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => openFilesSidebar()}
              className="w-full sm:w-auto"
            >
              Enviar documento
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => _onSuggestionClick?.('Quero analisar uma CPR.')}
              className="w-full sm:w-auto"
            >
              Nova analise
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-verity-100 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-verity-950">
              Atalhos rapidos
            </h3>
            <p className="text-sm text-verity-600">
              Acesse fluxos comuns sem sair do chat.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/cpr/analise')}
            >
              Analisar CPR
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/cpr/simulator')}
            >
              Simular CPR
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/cpr/historico')}
            >
              Historico CPR
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
