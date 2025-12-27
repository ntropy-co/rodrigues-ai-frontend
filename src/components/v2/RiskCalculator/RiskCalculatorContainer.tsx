'use client'

/**
 * RiskCalculatorContainer
 *
 * Container component that integrates the RiskCalculator visualization
 * with the useRiskCalculator hook for real API calls.
 *
 * Provides a form for input and transforms backend responses to the
 * frontend display format.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useRiskCalculator,
  type RiskCalculateRequest,
  type RiskCalculateResponse,
  type RiskFactor as APIRiskFactor
} from '@/hooks/useRiskCalculator'
import {
  RiskCalculator,
  type RiskCalculatorData,
  type RiskFactor,
  type RiskLevel
} from './RiskCalculator'

// =============================================================================
// Types
// =============================================================================

export interface RiskCalculatorContainerProps {
  /** Pre-filled data (e.g., from CPR wizard) */
  initialData?: Partial<RiskCalculateRequest>
  /** Callback when calculation completes */
  onCalculated?: (result: RiskCalculateResponse) => void
  /** Hide the form and just show results */
  showFormInitially?: boolean
  /** Custom title */
  title?: string
}

interface FormData {
  commodity: string
  quantity: string
  unit: string
  total_value: string
  issue_date: string
  maturity_date: string
  has_guarantees: boolean
  guarantee_value: string
}

// =============================================================================
// Constants
// =============================================================================

const COMMODITIES = [
  { value: 'soja', label: 'Soja' },
  { value: 'milho', label: 'Milho' },
  { value: 'cafe', label: 'Café' },
  { value: 'algodao', label: 'Algodão' },
  { value: 'boi', label: 'Boi Gordo' },
  { value: 'acucar', label: 'Açúcar' },
  { value: 'trigo', label: 'Trigo' },
  { value: 'arroz', label: 'Arroz' }
]

const UNITS = [
  { value: 'sacas', label: 'Sacas (60kg)' },
  { value: 'toneladas', label: 'Toneladas' },
  { value: 'arrobas', label: 'Arrobas' },
  { value: 'quilos', label: 'Quilos' }
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Converts backend risk_level to frontend RiskLevel
 */
function mapRiskLevel(backendLevel: 'baixo' | 'medio' | 'alto'): RiskLevel {
  const mapping: Record<string, RiskLevel> = {
    baixo: 'low',
    medio: 'medium',
    alto: 'high'
  }
  return mapping[backendLevel] || 'medium'
}

/**
 * Converts backend risk factors to frontend format
 */
function mapRiskFactors(apiFactors: APIRiskFactor[]): RiskFactor[] {
  return apiFactors.map((factor) => ({
    id: factor.id,
    label: factor.name,
    impact: factor.impact,
    weight: Math.round(factor.weight * 100),
    description: factor.description
  }))
}

/**
 * Transforms API response to display format
 */
function transformToDisplayData(
  response: RiskCalculateResponse
): RiskCalculatorData {
  return {
    score: response.overall_score,
    level: mapRiskLevel(response.risk_level),
    factors: mapRiskFactors(response.factors),
    recommendation: response.recommendations.join(' '),
    calculatedAt: new Date()
  }
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
function formatDateToBR(date: string): string {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

// =============================================================================
// Component
// =============================================================================

export function RiskCalculatorContainer({
  initialData,
  onCalculated,
  showFormInitially = true,
  title = 'Calculadora de Risco CPR'
}: RiskCalculatorContainerProps) {
  const { result, isLoading, error, calculate, reset } = useRiskCalculator()
  const [showForm, setShowForm] = useState(showFormInitially)
  const [formData, setFormData] = useState<FormData>(() => ({
    commodity: initialData?.commodity || 'soja',
    quantity: initialData?.quantity?.toString() || '',
    unit: initialData?.unit || 'sacas',
    total_value: initialData?.total_value?.toString() || '',
    issue_date: '',
    maturity_date: '',
    has_guarantees: initialData?.has_guarantees ?? false,
    guarantee_value: initialData?.guarantee_value?.toString() || ''
  }))

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string | boolean) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requestData: RiskCalculateRequest = {
      commodity: formData.commodity,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      total_value: parseFloat(formData.total_value),
      issue_date: formatDateToBR(formData.issue_date),
      maturity_date: formatDateToBR(formData.maturity_date),
      has_guarantees: formData.has_guarantees,
      guarantee_value: formData.guarantee_value
        ? parseFloat(formData.guarantee_value)
        : undefined
    }

    const apiResult = await calculate(requestData)

    if (apiResult) {
      setShowForm(false)
      onCalculated?.(apiResult)
    }
  }

  const handleRecalculate = useCallback(() => {
    reset()
    setShowForm(true)
  }, [reset])

  const displayData = result ? transformToDisplayData(result) : undefined

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {showForm && !displayData ? (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-verity-200 bg-white p-6"
          >
            <div className="flex items-center gap-2 border-b border-verity-100 pb-4">
              <Calculator className="h-5 w-5 text-verity-600" />
              <h3 className="font-semibold text-verity-900">{title}</h3>
            </div>

            {/* Commodity & Unit */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="risk-commodity"
                  className="mb-1.5 block text-sm font-medium text-verity-700"
                >
                  Commodity
                </label>
                <select
                  id="risk-commodity"
                  value={formData.commodity}
                  onChange={(e) =>
                    handleInputChange('commodity', e.target.value)
                  }
                  className="w-full rounded-lg border border-verity-200 bg-white px-3 py-2 text-sm focus:border-verity-500 focus:outline-none focus:ring-1 focus:ring-verity-500"
                >
                  {COMMODITIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="risk-unit"
                  className="mb-1.5 block text-sm font-medium text-verity-700"
                >
                  Unidade
                </label>
                <select
                  id="risk-unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  className="w-full rounded-lg border border-verity-200 bg-white px-3 py-2 text-sm focus:border-verity-500 focus:outline-none focus:ring-1 focus:ring-verity-500"
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quantity & Total Value */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="risk-quantity"
                  className="mb-1.5 block text-sm font-medium text-verity-700"
                >
                  Quantidade
                </label>
                <input
                  id="risk-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange('quantity', e.target.value)
                  }
                  placeholder="Ex: 1000"
                  required
                  min="1"
                  className="w-full rounded-lg border border-verity-200 px-3 py-2 text-sm focus:border-verity-500 focus:outline-none focus:ring-1 focus:ring-verity-500"
                />
              </div>
              <div>
                <label
                  htmlFor="risk-total-value"
                  className="mb-1.5 block text-sm font-medium text-verity-700"
                >
                  Valor Total (R$)
                </label>
                <input
                  id="risk-total-value"
                  type="number"
                  value={formData.total_value}
                  onChange={(e) =>
                    handleInputChange('total_value', e.target.value)
                  }
                  placeholder="Ex: 150000"
                  required
                  min="1"
                  className="w-full rounded-lg border border-verity-200 px-3 py-2 text-sm focus:border-verity-500 focus:outline-none focus:ring-1 focus:ring-verity-500"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="risk-issue-date"
                  className="mb-1.5 block text-sm font-medium text-verity-700"
                >
                  Data de Emissão
                </label>
                <input
                  id="risk-issue-date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    handleInputChange('issue_date', e.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-verity-200 px-3 py-2 text-sm focus:border-verity-500 focus:outline-none focus:ring-1 focus:ring-verity-500"
                />
              </div>
              <div>
                <label
                  htmlFor="risk-maturity-date"
                  className="mb-1.5 block text-sm font-medium text-verity-700"
                >
                  Data de Vencimento
                </label>
                <input
                  id="risk-maturity-date"
                  type="date"
                  value={formData.maturity_date}
                  onChange={(e) =>
                    handleInputChange('maturity_date', e.target.value)
                  }
                  required
                  className="w-full rounded-lg border border-verity-200 px-3 py-2 text-sm focus:border-verity-500 focus:outline-none focus:ring-1 focus:ring-verity-500"
                />
              </div>
            </div>

            {/* Guarantees */}
            <div className="space-y-3">
              <label
                htmlFor="risk-has-guarantees"
                className="flex items-center gap-2"
              >
                <input
                  id="risk-has-guarantees"
                  type="checkbox"
                  checked={formData.has_guarantees}
                  onChange={(e) =>
                    handleInputChange('has_guarantees', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-verity-300 text-verity-600 focus:ring-verity-500"
                />
                <span className="text-sm font-medium text-verity-700">
                  Possui garantias adicionais?
                </span>
              </label>

              {formData.has_guarantees && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label
                    htmlFor="risk-guarantee-value"
                    className="mb-1.5 block text-sm font-medium text-verity-700"
                  >
                    Valor da Garantia (R$)
                  </label>
                  <input
                    id="risk-guarantee-value"
                    type="number"
                    value={formData.guarantee_value}
                    onChange={(e) =>
                      handleInputChange('guarantee_value', e.target.value)
                    }
                    placeholder="Ex: 100000"
                    min="0"
                    className="w-full rounded-lg border border-verity-200 px-3 py-2 text-sm focus:border-verity-500 focus:outline-none focus:ring-1 focus:ring-verity-500"
                  />
                </motion.div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full bg-verity-600 hover:bg-verity-700',
                isLoading && 'cursor-not-allowed opacity-50'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calcular Risco
                </>
              )}
            </Button>
          </motion.form>
        ) : displayData ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <RiskCalculator
              data={displayData}
              onRecalculate={handleRecalculate}
              isLoading={isLoading}
              title={title}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default RiskCalculatorContainer
