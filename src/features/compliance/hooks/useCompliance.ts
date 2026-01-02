'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/components/providers/PostHogProvider'
import {
  ComplianceVerifyRequest,
  ComplianceVerifyResponse,
  ComplianceDashboard
} from '../types'
import { complianceApi } from '../api'

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
 */
export function useCompliance() {
  const { user } = useAuth()

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
      if (!user) {
        setState((prev) => ({
          ...prev,
          error: 'Usuário não autenticado',
          isLoading: false
        }))
        return null
      }

      if (!data.document_id) {
        setState((prev) => ({
          ...prev,
          error: 'Campo obrigatório ausente: document_id',
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
        const result = await complianceApi.verify(data)

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
    [user]
  )

  /**
   * Get compliance dashboard data
   */
  const getDashboard =
    useCallback(async (): Promise<ComplianceDashboard | null> => {
      if (!user) {
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
        const dashboard = await complianceApi.getDashboard()

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
    }, [user])

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
