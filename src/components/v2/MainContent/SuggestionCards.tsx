'use client'

import {
  FileText,
  Scale,
  Calculator,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { trackCPRQuickAction } from '@/lib/analytics'

/**
 * Quick action card for enterprise CPR analysis workflow.
 * Renamed from "suggestion" to "action" for professional context.
 */
interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  prompt: string
}

/**
 * Professional quick actions for CPR and rural credit analysis.
 * Uses direct, action-oriented language instead of questions.
 */
const quickActions: QuickAction[] = [
  {
    id: 'analisar-cpr-fisica',
    title: 'Analisar CPR Física',
    description: 'Upload e análise detalhada de documento',
    icon: FileText,
    prompt:
      'Preciso analisar uma CPR Física. Quais são os critérios de avaliação e documentação necessária?'
  },
  {
    id: 'comparar-garantias',
    title: 'Comparar Garantias',
    description: 'Análise comparativa de colaterais',
    icon: Scale,
    prompt:
      'Quais garantias são aceitas para operações de CPR e como avaliar sua adequação?'
  },
  {
    id: 'verificar-compliance',
    title: 'Verificar Compliance',
    description: 'Validação regulatória e normativa',
    icon: Shield,
    prompt:
      'Quais as principais normas do BACEN para operações de crédito rural? Como garantir compliance?'
  },
  {
    id: 'calcular-precificacao',
    title: 'Calcular Precificação',
    description: 'Metodologia de cálculo de preço',
    icon: Calculator,
    prompt:
      'Como calcular o preço justo de uma CPR considerando taxa de juros, prazo e volatilidade?'
  },
  {
    id: 'analise-risco',
    title: 'Análise de Risco',
    description: 'Avaliação de viabilidade creditícia',
    icon: AlertCircle,
    prompt:
      'Como fazer uma análise completa de risco para crédito rural? Quais variáveis considerar?'
  },
  {
    id: 'hedge-mercado-futuro',
    title: 'Estratégias de Hedge',
    description: 'Proteção de preços com derivativos',
    icon: TrendingUp,
    prompt: 'Como usar o mercado futuro para fazer hedge em operações de CPR?'
  }
]

interface SuggestionCardsProps {
  onSuggestionClick: (prompt: string) => void
}

/**
 * Displays professional quick action cards for CPR analysis workflows.
 * Strict Enterprise Finance design: White cards, subtle borders, monochromatic.
 */
export function SuggestionCards({ onSuggestionClick }: SuggestionCardsProps) {
  // Display top 6 actions in a 3-column grid
  const displayedActions = quickActions.slice(0, 6)

  return (
    <div className="w-full max-w-5xl">
      {/* Section header */}
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Ações Rápidas
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayedActions.map((action) => {
          const Icon = action.icon

          return (
            <button
              key={action.id}
              onClick={() => {
                trackCPRQuickAction(action.id, action.title)
                onSuggestionClick(action.prompt)
              }}
              className="group flex flex-col items-start rounded-lg border border-gray-200 bg-white p-5 text-left transition-all hover:border-gray-300 hover:shadow-sm active:bg-gray-50 dark:border-gray-800 dark:bg-card dark:hover:border-gray-700"
            >
              <div className="mb-4 flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-900 dark:bg-gray-800 dark:text-gray-400 dark:group-hover:bg-gray-700 dark:group-hover:text-gray-100">
                <Icon className="h-4 w-4" />
              </div>

              <h3 className="mb-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                {action.title}
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
