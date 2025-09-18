'use client'

import { Leaf, Target, Microscope, Calendar, Beaker, AlertTriangle, Clock, TrendingUp } from 'lucide-react'

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
    id: 'nutrient-deficiency',
    title: 'Identificar deficiências',
    description: 'Diagnosticar problemas nutricionais nas plantas',
    icon: Microscope,
    prompt: 'Preciso identificar uma deficiência nutricional na minha cultura. Quais são os sintomas que devo observar?',
    category: 'basic'
  },
  {
    id: 'fertilization-plan',
    title: 'Plano de adubação',
    description: 'Criar cronograma personalizado de nutrição',
    icon: Calendar,
    prompt: 'Quero criar um plano de adubação foliar para minha cultura. Qual seria o cronograma ideal?',
    category: 'basic'
  },
  {
    id: 'product-recommendation',
    title: 'Recomendação de produtos',
    description: 'Sugerir fertilizantes para sua cultura',
    icon: Target,
    prompt: 'Que opções de crédito rural você recomenda para financiar minha próxima safra?',
    category: 'basic'
  },
  {
    id: 'disease-prevention',
    title: 'Prevenção de doenças',
    description: 'Fortalecer plantas contra patógenos',
    icon: Leaf,
    prompt: 'Como posso usar a nutrição foliar para prevenir doenças e fortalecer minhas plantas?',
    category: 'basic'
  },
  
  // Sugestões Avançadas (baseadas no documento)
  {
    id: 'compatibility-glyphosate',
    title: 'Compatibilidade com glifosato',
    description: 'Mistura segura de manganês com herbicida',
    icon: Beaker,
    prompt: 'Um cliente vai aplicar glifosato e quer adicionar manganês na calda. Ele tem sulfato de manganês, que é mais barato, e um quelato de manganês. Qual a sua recomendação técnica e por que a escolha da fonte é o fator mais crítico nessa situação?',
    category: 'advanced'
  },
  {
    id: 'nutrient-mobility',
    title: 'Mobilidade de nutrientes',
    description: 'Como nutrientes se movem na planta',
    icon: TrendingUp,
    prompt: 'Um produtor acredita que, por aplicar Boro na folha, ele nutrirá a planta inteira, incluindo as raízes. Corrija essa percepção usando o conceito de mobilidade no floema e compare o comportamento do Boro com o do Molibdênio.',
    category: 'advanced'
  },
  {
    id: 'hidden-hunger',
    title: 'Fome oculta',
    description: 'Deficiências sem sintomas visuais',
    icon: AlertTriangle,
    prompt: 'Minha lavoura de soja está com uma aparência verde e saudável, sem nenhum sintoma visual de deficiência. Por que eu deveria me preocupar com a nutrição foliar e qual ferramenta de diagnóstico você recomendaria?',
    category: 'advanced'
  },
  {
    id: 'flowering-stage',
    title: 'Nutrição no florescimento',
    description: 'Nutrientes críticos em R1',
    icon: Clock,
    prompt: 'Estou no estádio R1 (início do florescimento) e meu objetivo é garantir o máximo pegamento de flores, evitando o abortamento. Qual nutriente é absolutamente crítico nesta fase e qual o seu papel fisiológico específico?',
    category: 'advanced'
  },
  
  // Sugestões Expert
  {
    id: 'induced-deficiency',
    title: 'Deficiência induzida por pH',
    description: 'Manganês bloqueado no solo',
    icon: Target,
    prompt: 'Um agricultor no Cerrado corrigiu o pH do solo para 6.5 com calagem e agora está observando sintomas de deficiência de Manganês. Ele planeja aplicar mais Manganês via solo. Essa é a estratégia correta?',
    category: 'expert'
  },
  {
    id: 'application-physiology',
    title: 'Fisiologia da aplicação',
    description: 'Condições ideais para absorção',
    icon: Microscope,
    prompt: 'Por que aplicar um fertilizante foliar ao meio-dia, em um dia quente e com baixa umidade, pode anular completamente o investimento, mesmo usando o produto correto? Descreva o que acontece com a gota na folha.',
    category: 'expert'
  }
]

interface SuggestionCardsProps {
  onSuggestionClick: (prompt: string) => void
}

function getRandomSuggestions(): SuggestionCard[] {
  // Pega sempre 1 básica, 2 avançadas e 1 expert
  const basic = allSuggestions.filter(s => s.category === 'basic')
  const advanced = allSuggestions.filter(s => s.category === 'advanced')
  const expert = allSuggestions.filter(s => s.category === 'expert')
  
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
        border: 'hover:border-green-300'
      }
    case 'advanced':
      return {
        bg: 'bg-blue-50',
        icon: 'text-blue-600',
        border: 'hover:border-blue-300'
      }
    case 'expert':
      return {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        border: 'hover:border-purple-300'
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
              className={`flex flex-col items-start rounded-2xl border border-gemini-gray-300 p-4 text-left transition-all ${colors.border} hover:shadow-sm active:scale-[0.98]`}
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colors.bg}`}>
                <Icon className={`h-5 w-5 ${colors.icon}`} />
              </div>
              
              <h3 className="mb-2 font-medium text-gemini-gray-900">
                {suggestion.title}
              </h3>
              
              <p className="text-sm text-gemini-gray-600 leading-relaxed">
                {suggestion.description}
              </p>
              
              {/* Badge da categoria */}
              <div className="mt-2">
                <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                  suggestion.category === 'basic' 
                    ? 'bg-green-100 text-green-700'
                    : suggestion.category === 'advanced'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
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
          className="text-sm text-gemini-blue hover:text-gemini-blue-hover transition-colors"
        >
          🔄 Ver novas sugestões
        </button>
      </div>
    </div>
  )
}