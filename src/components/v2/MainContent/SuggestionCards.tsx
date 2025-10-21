'use client'

import {
  DollarSign,
  Target,
  FileText,
  Calendar,
  Scale,
  AlertTriangle,
  Clock,
  TrendingUp
} from 'lucide-react'

interface SuggestionCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  prompt: string
  category: 'basic' | 'advanced' | 'expert'
}

const allSuggestions: SuggestionCard[] = [
  // Sugestões Básicas
  {
    id: 'cpr-basics',
    title: 'CPR Básica',
    description: 'Entenda o que é uma Cédula de Produto Rural',
    icon: FileText,
    prompt:
      'O que é uma CPR e quais são as principais diferenças entre CPR Física e CPR Financeira?',
    category: 'basic'
  },
  {
    id: 'credit-options',
    title: 'Opções de Crédito',
    description: 'Conheça as linhas de crédito disponíveis',
    icon: DollarSign,
    prompt:
      'Que opções de crédito rural você recomenda para financiar minha próxima safra?',
    category: 'basic'
  },
  {
    id: 'garantias',
    title: 'Garantias',
    description: 'Tipos de garantias aceitas no crédito rural',
    icon: Scale,
    prompt:
      'Quais tipos de garantias são aceitas para operações de CPR e crédito rural?',
    category: 'basic'
  },
  {
    id: 'documentation',
    title: 'Documentação',
    description: 'Documentos necessários para CPR',
    icon: Calendar,
    prompt:
      'Quais documentos preciso para emitir uma CPR? Existe algum prazo específico?',
    category: 'basic'
  },

  // Sugestões Avançadas
  {
    id: 'cpr-execution',
    title: 'Liquidação de CPR',
    description: 'Processos e prazos para liquidação',
    icon: Clock,
    prompt:
      'Como funciona o processo de liquidação de uma CPR Física? Quais são os prazos e penalidades em caso de inadimplência?',
    category: 'advanced'
  },
  {
    id: 'tax-benefits',
    title: 'Benefícios Fiscais',
    description: 'Vantagens tributárias do crédito rural',
    icon: TrendingUp,
    prompt:
      'Quais são os principais benefícios fiscais ao utilizar CPR em comparação com outras formas de financiamento rural?',
    category: 'advanced'
  },
  {
    id: 'risk-assessment',
    title: 'Análise de Risco',
    description: 'Avaliação de riscos em operações rurais',
    icon: AlertTriangle,
    prompt:
      'Como é feita a análise de risco para aprovação de crédito rural? Quais fatores são considerados prioritários?',
    category: 'advanced'
  },
  {
    id: 'market-prices',
    title: 'Precificação',
    description: 'Como definir preços em CPR',
    icon: Target,
    prompt:
      'Como devo precificar minha CPR considerando as oscilações do mercado? Existe alguma estratégia de hedge recomendada?',
    category: 'advanced'
  },

  // Sugestões Expert
  {
    id: 'legal-framework',
    title: 'Marco Legal',
    description: 'Legislação avançada sobre CPR',
    icon: Scale,
    prompt:
      'Explique as principais mudanças trazidas pela Lei 14.421/22 (Nova Lei do Agro) e como ela impacta as operações de CPR existentes.',
    category: 'expert'
  },
  {
    id: 'complex-structures',
    title: 'Estruturas Complexas',
    description: 'Operações estruturadas com CPR',
    icon: FileText,
    prompt:
      'Como estruturar uma operação de CPR com garantia fidejussória envolvendo múltiplas safras e diferentes culturas? Quais os riscos jurídicos?',
    category: 'expert'
  }
]

interface SuggestionCardsProps {
  onSuggestionClick: (prompt: string) => void
}

function getRandomSuggestions(): SuggestionCard[] {
  // Pega sempre 1 básica, 2 avançadas e 1 expert
  const basic = allSuggestions.filter((s) => s.category === 'basic')
  const advanced = allSuggestions.filter((s) => s.category === 'advanced')
  const expert = allSuggestions.filter((s) => s.category === 'expert')

  const randomBasic = basic[Math.floor(Math.random() * basic.length)]
  const randomAdvanced = advanced.sort(() => 0.5 - Math.random()).slice(0, 2)
  const randomExpert = expert[Math.floor(Math.random() * expert.length)]

  return [randomBasic, ...randomAdvanced, randomExpert]
}

function getCategoryColor(category: SuggestionCard['category']) {
  switch (category) {
    case 'basic':
      return {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        border: 'hover-hover:border-green-300'
      }
    case 'advanced':
      return {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        border: 'hover-hover:border-blue-300'
      }
    case 'expert':
      return {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        border: 'hover-hover:border-purple-300'
      }
  }
}

export function SuggestionCards({ onSuggestionClick }: SuggestionCardsProps) {
  const suggestions = getRandomSuggestions()

  return (
    <div className="w-full max-w-4xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {suggestions.map((suggestion) => {
          const Icon = suggestion.icon
          const colors = getCategoryColor(suggestion.category)

          return (
            <button
              key={suggestion.id}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className={`flex flex-col items-start rounded-2xl border border-gemini-gray-300 p-4 text-left transition-all ${colors.border} hover-hover:shadow-sm active:scale-[0.98]`}
            >
              <div
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}
              >
                <Icon className={`h-5 w-5 ${colors.icon}`} />
              </div>

              <h3 className="mb-2 font-medium text-gemini-gray-900">
                {suggestion.title}
              </h3>

              <p className="text-sm leading-relaxed text-gemini-gray-600">
                {suggestion.description}
              </p>

              {/* Badge da categoria */}
              <div className="mt-2">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                    suggestion.category === 'basic'
                      ? 'bg-green-100 text-green-700'
                      : suggestion.category === 'advanced'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {suggestion.category === 'basic'
                    ? 'Básico'
                    : suggestion.category === 'advanced'
                      ? 'Avançado'
                      : 'Expert'}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Botão para novas sugestões */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.reload()}
          className="text-sm text-gemini-blue transition-colors hover-hover:text-gemini-blue-hover"
        >
          🔄 Ver novas sugestões
        </button>
      </div>
    </div>
  )
}
