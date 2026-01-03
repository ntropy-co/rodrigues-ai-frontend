'use client'

import { useState, useCallback } from 'react'
import { trackEvent } from '@/components/providers/PostHogProvider'

/**
 * Request data for risk calculation
 */
export interface RiskCalculateRequest {
  commodity: string
  quantity: number
  unit: string
  total_value: number
  issue_date: string // DD/MM/YYYY
  maturity_date: string // DD/MM/YYYY
  has_guarantees: boolean
  guarantee_value?: number
  unit_price?: number
  historical_volatility?: number
}

/**
 * Individual risk factor
 */
export interface RiskFactor {
  id: string
  name: string
  impact: 'positive' | 'negative'
  weight: number
  description?: string
}

/**
 * Response from risk calculation
 */
export interface RiskCalculateResponse {
  overall_score: number // 0-100 (higher = more risk)
  risk_level: 'baixo' | 'medio' | 'alto'
  factors: RiskFactor[]
  recommendations: string[]
  details: Record<string, unknown>
}

/**
 * Hook state
 */
interface UseRiskCalculatorState {
  result: RiskCalculateResponse | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook for calculating CPR credit risk
 *
 * Usage:
 * ```tsx
 * const { result, isLoading, error, calculate, reset } = useRiskCalculator()
 *
 * const handleCalculate = async () => {
 *   await calculate({
 *     commodity: 'soja',
 *     quantity: 1000,
 *     unit: 'sacas',
 *     total_value: 150000,
 *     issue_date: '01/01/2025',
 *     maturity_date: '30/06/2025',
 *     has_guarantees: true,
 *     guarantee_value: 100000
 *   })
 * }
 * ```
 */
export function useRiskCalculator() {
  // Note: Auth is handled via HttpOnly cookies, no need to extract token

  const [state, setState] = useState<UseRiskCalculatorState>({
    result: null,
    isLoading: false,
    error: null
  })

  /**
   * Calculate risk for a CPR operation
   */
  const calculate = useCallback(
    async (
      data: RiskCalculateRequest
    ): Promise<RiskCalculateResponse | null> => {
      setState({ result: null, isLoading: true, error: null })

      try {
        const response = await fetch('/api/cpr/risk/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include', // Use HttpOnly cookies for auth
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          let errorMessage = 'Erro ao calcular risco'
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorMessage
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const result: RiskCalculateResponse = await response.json()

        setState({ result, isLoading: false, error: null })

        // Track analytics event
        trackEvent('risk_calculated', {
          commodity: data.commodity,
          risk_level: result.risk_level,
          overall_score: result.overall_score,
          has_guarantees: data.has_guarantees
        })

        return result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido'

        setState({ result: null, isLoading: false, error: errorMessage })

        // Track error
        trackEvent('risk_calculation_error', {
          error: errorMessage,
          commodity: data.commodity
        })

        return null
      }
    },
    []  // No dependencies since auth is via cookies
  )

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setState({ result: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    calculate,
    reset
  }
}

export default useRiskCalculator
