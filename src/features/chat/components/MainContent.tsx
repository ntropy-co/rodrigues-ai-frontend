import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Greeting } from './Greeting'
import { useLayoutStore } from '@/features/chat'
import { Upload, FileSearch, Calculator } from 'lucide-react'

// Quick Action Button with Spring Physics
const QuickActionButton = ({
  children,
  onClick,
  icon: Icon,
  delay = 0
}: {
  children: React.ReactNode
  onClick: () => void
  icon: React.ComponentType<{
    className?: string
    strokeWidth?: number | string
  }>
  delay?: number
}) => (
  <motion.button
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      type: 'spring',
      stiffness: 300,
      damping: 25,
      delay
    }}
    whileHover={{
      scale: 1.03,
      boxShadow: '0 8px 30px rgba(26, 60, 48, 0.12)'
    }}
    whileTap={{ scale: 0.98 }}
    className="group flex items-center gap-2.5 rounded-full border border-sand-300 bg-white/60 px-6 py-3 text-sm font-medium text-verity-900 backdrop-blur-md transition-colors hover:border-verity-400 hover:bg-white/90"
  >
    <Icon
      className="h-5 w-5 text-verity-600 transition-colors group-hover:text-verity-800"
      strokeWidth={1.5}
    />
    {children}
  </motion.button>
)
interface MainContentProps {
  onSuggestionClick?: (suggestion: string) => void
}

export function MainContent({}: MainContentProps) {
  const { openFilesSidebar } = useLayoutStore()
  const router = useRouter()

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        <Greeting />

        {/* Organic Starter Prompts (Pill Rail) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <QuickActionButton
            onClick={() => openFilesSidebar()}
            icon={Upload}
            delay={0.1}
          >
            Enviar documento
          </QuickActionButton>

          <QuickActionButton
            onClick={() => router.push('/cpr/analise')}
            icon={FileSearch}
            delay={0.15}
          >
            Analisar CPR
          </QuickActionButton>

          <QuickActionButton
            onClick={() => router.push('/cpr/simulator')}
            icon={Calculator}
            delay={0.2}
          >
            Simulador
          </QuickActionButton>
        </div>
      </div>
    </main>
  )
}
