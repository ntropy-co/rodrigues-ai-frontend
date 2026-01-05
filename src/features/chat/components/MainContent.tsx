import { useRouter } from 'next/navigation'
import { Greeting } from './Greeting'
import { Button } from '@/components/ui/button'
import { useLayoutStore } from '@/features/chat'
import {
  Upload,
  MessageSquarePlus,
  FileSearch,
  Calculator,
  History
} from 'lucide-react'
import { motion } from 'framer-motion'

interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
}

const SHORTCUTS = [
  {
    id: 'analyze',
    label: 'Analisar CPR',
    desc: 'Extração e riscos jurídicos',
    icon: FileSearch,
    href: '/cpr/analise'
  },
  {
    id: 'simulate',
    label: 'Simular CPR',
    desc: 'Cálculo de valores futuros',
    icon: Calculator,
    href: '/cpr/simulator'
  },
  {
    id: 'history',
    label: 'Histórico',
    desc: 'Seus documentos anteriores',
    icon: History,
    href: '/cpr/historico'
  }
]

export function MainContent({
  onSuggestionClick: _onSuggestionClick
}: MainContentProps) {
  const { openFilesSidebar } = useLayoutStore()
  const router = useRouter()

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        <Greeting />

        {/* Primary Actions - Central Command */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            onClick={() => openFilesSidebar()}
            className="group h-12 gap-2.5 rounded-xl bg-verity-900 px-6 text-[15px] font-medium text-white shadow-lg shadow-verity-900/10 transition-all hover:bg-verity-800 hover:shadow-xl hover:shadow-verity-900/20 active:scale-[0.98]"
          >
            <Upload
              strokeWidth={1.5}
              className="h-5 w-5 transition-transform group-hover:-translate-y-0.5"
            />
            Enviar documento
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => _onSuggestionClick?.('Quero analisar uma CPR.')}
            className="group h-12 gap-2.5 rounded-xl border-sand-300 bg-white/50 px-6 text-[15px] font-medium text-verity-900 backdrop-blur-sm transition-all hover:border-verity-200 hover:bg-white/80 hover:text-verity-800 active:scale-[0.98]"
          >
            <MessageSquarePlus
              strokeWidth={1.5}
              className="h-5 w-5 text-verity-600 transition-transform group-hover:-translate-y-0.5 group-hover:text-verity-800"
            />
            Nova análise
          </Button>
        </div>

        {/* Bento Grid - Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-center">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-sand-300" />
            <span className="text-xs font-medium uppercase tracking-widest text-verity-400">
              Ferramentas Rápidas
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-sand-300" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {SHORTCUTS.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(item.href)}
                className="group relative flex flex-col items-start gap-4 rounded-2xl border border-sand-200 bg-white/40 p-5 text-left backdrop-blur-md transition-all duration-300 hover:border-verity-200/50 hover:bg-white/70 hover:shadow-xl hover:shadow-verity-900/5 active:scale-[0.98]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-sand-200 transition-colors group-hover:bg-verity-50 group-hover:text-verity-900 group-hover:ring-verity-100">
                  <item.icon
                    strokeWidth={1.5}
                    className="h-5 w-5 text-verity-600 transition-colors group-hover:text-verity-800"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block font-serif text-[17px] font-medium leading-tight text-verity-900">
                    {item.label}
                  </span>
                  <span className="block text-sm text-verity-500 transition-colors group-hover:text-verity-600">
                    {item.desc}
                  </span>
                </div>

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-white via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
