'use client'

/**
 * RiskCalculator Component
 *
 * Interface de cálculo e exibição de risco de crédito rural.
 * Inclui gauge visual, fatores positivos/negativos, e recomendação.
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskFactor {
  id: string
  label: string
  impact: 'positive' | 'negative'
  weight: number // 0-100
  description?: string
}

export interface RiskCalculatorData {
  /** Score de risco (0-100, onde 100 = maior risco) */
  score: number
  /** Nível de risco calculado */
  level: RiskLevel
  /** Fatores que influenciam o risco */
  factors: RiskFactor[]
  /** Recomendação textual */
  recommendation: string
  /** Data do cálculo */
  calculatedAt?: Date
}

export interface RiskCalculatorProps {
  /** Dados do cálculo de risco */
  data?: RiskCalculatorData
  /** Callback para recalcular */
  onRecalculate?: () => void
  /** Estado de loading */
  isLoading?: boolean
  /** Título customizado */
  title?: string
  /** Mostrar formulário de inputs */
  showInputForm?: boolean
}

// =============================================================================
// Constants
// =============================================================================

const RISK_LEVELS: Record<
  RiskLevel,
  { label: string; color: string; bgColor: string }
> = {
  low: { label: 'Baixo', color: 'text-green-600', bgColor: 'bg-green-500' },
  medium: {
    label: 'Médio',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-500'
  },
  high: { label: 'Alto', color: 'text-orange-600', bgColor: 'bg-orange-500' },
  critical: { label: 'Crítico', color: 'text-red-600', bgColor: 'bg-red-500' }
}

// Mock data para demonstração
const MOCK_DATA: RiskCalculatorData = {
  score: 42,
  level: 'medium',
  factors: [
    {
      id: '1',
      label: 'Garantia real registrada',
      impact: 'positive',
      weight: 25,
      description: 'CPR com garantia de safra registrada em cartório'
    },
    {
      id: '2',
      label: 'Histórico de pagamentos',
      impact: 'positive',
      weight: 20,
      description: 'Produtor com 5+ anos sem inadimplência'
    },
    {
      id: '3',
      label: 'Seguro agrícola ativo',
      impact: 'positive',
      weight: 15,
      description: 'Proagro ou seguro privado contratado'
    },
    {
      id: '4',
      label: 'Alta exposição climática',
      impact: 'negative',
      weight: 30,
      description: 'Região com histórico de seca nos últimos 3 anos'
    },
    {
      id: '5',
      label: 'Concentração de commodity',
      impact: 'negative',
      weight: 20,
      description: 'Mais de 80% da receita em soja'
    },
    {
      id: '6',
      label: 'Vencimento próximo',
      impact: 'negative',
      weight: 15,
      description: 'CPR vence em menos de 60 dias'
    }
  ],
  recommendation:
    'Risco moderado. Recomenda-se monitoramento mensal e verificação do seguro agrícola antes da liberação. Considerar exigência de garantia adicional devido à exposição climática.',
  calculatedAt: new Date()
}

// =============================================================================
// Sub-components
// =============================================================================

interface RiskGaugeProps {
  score: number
}

function RiskGauge({ score }: RiskGaugeProps) {
  // Calcular ângulo do ponteiro (-90 a 90 graus)
  const angle = (score / 100) * 180 - 90

  return (
    <div className="relative mx-auto h-24 w-48 overflow-hidden">
      {/* Background arc */}
      <div className="absolute inset-0">
        <svg viewBox="0 0 200 100" className="h-full w-full">
          {/* Gradient arcs */}
          <defs>
            <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="33%" stopColor="#eab308" />
              <stop offset="66%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <path
            d="M 10 90 A 80 80 0 0 1 190 90"
            fill="none"
            stroke="url(#riskGradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Needle */}
      <motion.div
        className="absolute bottom-0 left-1/2 origin-bottom"
        initial={{ rotate: -90 }}
        animate={{ rotate: angle }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        style={{ width: '4px', height: '70px', marginLeft: '-2px' }}
      >
        <div className="h-full w-full rounded-full bg-verde-900" />
        <div className="absolute bottom-0 left-1/2 -ml-1.5 h-3 w-3 rounded-full bg-verde-900" />
      </motion.div>

      {/* Score display */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform text-center">
        <motion.span
          className="text-2xl font-bold text-verde-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {score}
        </motion.span>
        <span className="text-sm text-verde-600">/100</span>
      </div>
    </div>
  )
}

interface FactorListProps {
  factors: RiskFactor[]
  type: 'positive' | 'negative'
}

function FactorList({ factors, type }: FactorListProps) {
  const filteredFactors = factors.filter((f) => f.impact === type)
  const Icon = type === 'positive' ? CheckCircle2 : XCircle
  const iconColor = type === 'positive' ? 'text-green-500' : 'text-red-500'
  const title = type === 'positive' ? 'Fatores Positivos' : 'Fatores de Risco'
  const TrendIcon = type === 'positive' ? TrendingUp : TrendingDown

  if (filteredFactors.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-verde-800">
        <TrendIcon className={cn('h-4 w-4', iconColor)} />
        {title}
      </h4>
      <div className="space-y-2">
        {filteredFactors.map((factor, index) => (
          <motion.div
            key={factor.id}
            initial={{ opacity: 0, x: type === 'positive' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-2 rounded-lg bg-white/50 p-2"
          >
            <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconColor)} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-verde-900">
                {factor.label}
              </p>
              {factor.description && (
                <p className="mt-0.5 text-xs text-verde-600">
                  {factor.description}
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs font-medium text-verde-500">
              {factor.weight}%
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function RiskCalculator({
  data = MOCK_DATA,
  onRecalculate,
  isLoading = false,
  title = 'Análise de Risco'
}: RiskCalculatorProps) {
  const [isRecalculating, setIsRecalculating] = useState(false)

  const levelConfig = RISK_LEVELS[data.level]

  const handleRecalculate = async () => {
    setIsRecalculating(true)
    await onRecalculate?.()
    // Simular delay para feedback visual
    setTimeout(() => setIsRecalculating(false), 1000)
  }

  const positiveFactorsWeight = useMemo(() => {
    return data.factors
      .filter((f) => f.impact === 'positive')
      .reduce((sum, f) => sum + f.weight, 0)
  }, [data.factors])

  const negativeFactorsWeight = useMemo(() => {
    return data.factors
      .filter((f) => f.impact === 'negative')
      .reduce((sum, f) => sum + f.weight, 0)
  }, [data.factors])

  return (
    <div className="overflow-hidden rounded-xl border border-verde-200 bg-gradient-to-br from-verde-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-verde-200 bg-white/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-verde-600" />
          <h3 className="font-semibold text-verde-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              levelConfig.bgColor,
              'text-white'
            )}
          >
            Risco {levelConfig.label}
          </span>
          {onRecalculate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRecalculate}
              disabled={isLoading || isRecalculating}
              className="text-verde-600 hover:bg-verde-100 hover:text-verde-700"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  (isLoading || isRecalculating) && 'animate-spin'
                )}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-4">
        {/* Gauge */}
        <div className="text-center">
          <RiskGauge score={data.score} />
          <p className={cn('mt-2 text-lg font-semibold', levelConfig.color)}>
            Risco {levelConfig.label}
          </p>
        </div>

        {/* Factors Summary */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-1.5 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">{positiveFactorsWeight}%</span>
            <span className="text-verde-500">positivo</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-600">
            <TrendingDown className="h-4 w-4" />
            <span className="font-medium">{negativeFactorsWeight}%</span>
            <span className="text-verde-500">negativo</span>
          </div>
        </div>

        {/* Factors Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          <FactorList factors={data.factors} type="positive" />
          <FactorList factors={data.factors} type="negative" />
        </div>

        {/* Recommendation */}
        <div className="rounded-lg bg-verde-100/50 p-4">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-verde-600" />
            <div>
              <h4 className="mb-1 text-sm font-semibold text-verde-800">
                Recomendação
              </h4>
              <p className="text-sm leading-relaxed text-verde-700">
                {data.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        {data.calculatedAt && (
          <p className="text-center text-xs text-verde-500">
            Calculado em {data.calculatedAt.toLocaleDateString('pt-BR')} às{' '}
            {data.calculatedAt.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export default RiskCalculator
