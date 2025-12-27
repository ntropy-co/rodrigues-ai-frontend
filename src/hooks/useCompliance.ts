'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/components/providers/PostHogProvider'

/**
 * Compliance requirement status
 */
export interface ComplianceRequirement {
  id: string
  name: string
  status: 'passed' | 'failed' | 'warning'
  description?: string
  severity: 'critical' | 'major' | 'minor'
}

/**
 * Request data for compliance verification
 */
export interface ComplianceVerifyRequest {
  document_id?: string
  extracted_data: Record<string, unknown>
}

/**
 * Response from compliance verification
 */
export interface ComplianceVerifyResponse {
  score: number // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  requirements: ComplianceRequirement[]
  recommendations: string[]
  details: Record<string, unknown>
}

/**
 * Recent verification entry
 */
export interface RecentVerification {
  id: string
  document_id: string
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  verified_at: string
}

/**
 * Dashboard data
 */
export interface ComplianceDashboard {
  total_verified: number
  compliance_rate: number // 0-100
  recent_verifications: RecentVerification[]
}

/**
 * Hook state
 */
interface UseComplianceState {
  result: ComplianceVerifyResponse | null
  dashboard: ComplianceDashboard | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook for compliance verification
 *
 * Usage:
 * ```tsx
 * const { result, dashboard, isLoading, error, verify, getDashboard, reset } = useCompliance()
 *
 * const handleVerify = async () => {
 *   await verify({
 *     document_id: 'doc-123',
 *     extracted_data: {
 *       emitente: 'Fazenda XYZ',
 *       produto: 'Soja',
 *       quantidade: 1000
 *     }
 *   })
 * }
 *
 * const handleLoadDashboard = async () => {
 *   await getDashboard()
 * }
 * ```
 */
export function useCompliance() {
  const { token } = useAuth()

  const [state, setState] = useState<UseComplianceState>({
    result: null,
    dashboard: null,
    isLoading: false,
    error: null
  })

  /**
   * Verify compliance of a document
   */
  const verify = useCallback(
    async (
      data: ComplianceVerifyRequest
    ): Promise<ComplianceVerifyResponse | null> => {
      if (!token) {
        setState((prev) => ({
          ...prev,
          error: 'Usuário não autenticado',
          isLoading: false
        }))
        return null
      }

      setState((prev) => ({
        ...prev,
        result: null,
        isLoading: true,
        error: null
      }))

      try {
        const response = await fetch('/api/compliance/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data)
        })

        if (!response.ok) {
          let errorMessage = 'Erro ao verificar compliance'
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorMessage
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const result: ComplianceVerifyResponse = await response.json()

        setState((prev) => ({ ...prev, result, isLoading: false, error: null }))

        // Track analytics event
        trackEvent('compliance_verified', {
          document_id: data.document_id,
          score: result.score,
          grade: result.grade,
          requirements_count: result.requirements.length,
          passed_count: result.requirements.filter((r) => r.status === 'passed')
            .length,
          failed_count: result.requirements.filter((r) => r.status === 'failed')
            .length
        })

        return result
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido'

        setState((prev) => ({
          ...prev,
          result: null,
          isLoading: false,
          error: errorMessage
        }))

        // Track error
        trackEvent('compliance_verification_error', {
          error: errorMessage,
          document_id: data.document_id
        })

        return null
      }
    },
    [token]
  )

  /**
   * Get compliance dashboard data
   */
  const getDashboard =
    useCallback(async (): Promise<ComplianceDashboard | null> => {
      if (!token) {
        setState((prev) => ({
          ...prev,
          error: 'Usuário não autenticado',
          isLoading: false
        }))
        return null
      }

      setState((prev) => ({
        ...prev,
        dashboard: null,
        isLoading: true,
        error: null
      }))

      try {
        const response = await fetch('/api/compliance/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          let errorMessage = 'Erro ao obter dashboard'
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorMessage
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const dashboard: ComplianceDashboard = await response.json()

        setState((prev) => ({
          ...prev,
          dashboard,
          isLoading: false,
          error: null
        }))

        // Track analytics event
        trackEvent('compliance_dashboard_loaded', {
          total_verified: dashboard.total_verified,
          compliance_rate: dashboard.compliance_rate
        })

        return dashboard
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido'

        setState((prev) => ({
          ...prev,
          dashboard: null,
          isLoading: false,
          error: errorMessage
        }))

        // Track error
        trackEvent('compliance_dashboard_error', {
          error: errorMessage
        })

        return null
      }
    }, [token])

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setState({ result: null, dashboard: null, isLoading: false, error: null })
  }, [])

  return {
    ...state,
    verify,
    getDashboard,
    reset
  }
}

export default useCompliance
