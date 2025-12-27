'use client'

/**
 * useCPRAnalysis Hook
 *
 * Hook for CPR document analysis workflow with LangGraph.
 * Manages the complete analysis flow: document upload → extraction → compliance → risk.
 *
 * Usage:
 * ```tsx
 * const {
 *   state,
 *   messages,
 *   isLoading,
 *   error,
 *   startAnalysis,
 *   continueAnalysis,
 *   reset
 * } = useCPRAnalysis()
 *
 * // Start new analysis
 * await startAnalysis()
 *
 * // Send user message (document text, confirmation, etc.)
 * await continueAnalysis("Sim, os dados estão corretos")
 * ```
 */

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/components/providers/PostHogProvider'

// =============================================================================
// Types
// =============================================================================

export interface WorkflowMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ExtractedData {
  emitente?: {
    nome?: string
    cpf_cnpj?: string
    endereco?: string
  }
  credor?: {
    nome?: string
    cpf_cnpj?: string
    endereco?: string
  }
  produto?: {
    descricao?: string
    quantidade?: number
    unidade?: string
    safra?: string
  }
  valores?: {
    preco_unitario?: number
    valor_total?: number
  }
  datas?: {
    emissao?: string
    vencimento?: string
    entrega?: string
  }
  garantias?: {
    tipo?: string
    descricao?: string
    valor?: number
  }
  [key: string]: unknown
}

export interface ComplianceResult {
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  requirements: Array<{
    id: string
    name: string
    status: 'ok' | 'incomplete' | 'missing'
    description?: string
  }>
  recommendations: string[]
}

export interface RiskResult {
  overall_score: number
  risk_level: 'baixo' | 'medio' | 'alto'
  factors: Array<{
    id: string
    name: string
    impact: 'positive' | 'negative'
    weight: number
  }>
  recommendations: string[]
}

export interface WorkflowState {
  sessionId: string
  workflowType: 'analise_cpr'
  currentStep: string
  isWaitingInput: boolean
  extractedData?: ExtractedData
  complianceResult?: ComplianceResult
  riskResult?: RiskResult
}

interface WorkflowResponse {
  text: string
  session_id: string
  workflow_type: 'analise_cpr' | 'criar_cpr'
  is_waiting_input: boolean
  current_step: string
  extracted_data?: ExtractedData
  compliance_result?: ComplianceResult
  risk_result?: RiskResult
}

interface UseCPRAnalysisState {
  state: WorkflowState | null
  messages: WorkflowMessage[]
  isLoading: boolean
  error: string | null
}

// =============================================================================
// Hook
// =============================================================================

export function useCPRAnalysis() {
  const { token } = useAuth()

  const [hookState, setHookState] = useState<UseCPRAnalysisState>({
    state: null,
    messages: [],
    isLoading: false,
    error: null
  })

  /**
   * Process workflow response and update state
   */
  const processResponse = useCallback(
    (response: WorkflowResponse, userMessage?: string) => {
      const newMessages: WorkflowMessage[] = []

      // Add user message if provided
      if (userMessage) {
        newMessages.push({
          id: `user-${Date.now()}`,
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        })
      }

      // Add assistant response
      newMessages.push({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      })

      setHookState((prev) => ({
        state: {
          sessionId: response.session_id,
          workflowType: 'analise_cpr',
          currentStep: response.current_step,
          isWaitingInput: response.is_waiting_input,
          extractedData: response.extracted_data || prev.state?.extractedData,
          complianceResult:
            response.compliance_result || prev.state?.complianceResult,
          riskResult: response.risk_result || prev.state?.riskResult
        },
        messages: [...prev.messages, ...newMessages],
        isLoading: false,
        error: null
      }))
    },
    []
  )

  /**
   * Start a new CPR analysis workflow
   */
  const startAnalysis = useCallback(
    async (sessionId?: string): Promise<WorkflowResponse | null> => {
      if (!token) {
        setHookState((prev) => ({
          ...prev,
          error: 'Usuário não autenticado',
          isLoading: false
        }))
        return null
      }

      setHookState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        messages: [],
        state: null
      }))

      try {
        const response = await fetch('/api/cpr/analise/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ session_id: sessionId })
        })

        if (!response.ok) {
          let errorMessage = 'Erro ao iniciar análise'
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorMessage
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const data: WorkflowResponse = await response.json()
        processResponse(data)

        // Track analytics
        trackEvent('cpr_analysis_started', {
          session_id: data.session_id,
          current_step: data.current_step
        })

        return data
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido'

        setHookState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))

        trackEvent('cpr_analysis_error', {
          error: errorMessage,
          step: 'start'
        })

        return null
      }
    },
    [token, processResponse]
  )

  /**
   * Continue the analysis workflow with user response
   */
  const continueAnalysis = useCallback(
    async (message: string): Promise<WorkflowResponse | null> => {
      if (!token) {
        setHookState((prev) => ({
          ...prev,
          error: 'Usuário não autenticado',
          isLoading: false
        }))
        return null
      }

      if (!hookState.state?.sessionId) {
        setHookState((prev) => ({
          ...prev,
          error: 'Nenhuma sessão ativa. Inicie uma nova análise.',
          isLoading: false
        }))
        return null
      }

      setHookState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/cpr/analise/continue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            session_id: hookState.state.sessionId,
            message
          })
        })

        if (!response.ok) {
          let errorMessage = 'Erro ao continuar análise'
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorMessage
          } catch {
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const data: WorkflowResponse = await response.json()
        processResponse(data, message)

        // Track step completion
        trackEvent('cpr_analysis_step_completed', {
          session_id: data.session_id,
          current_step: data.current_step,
          is_complete: !data.is_waiting_input
        })

        return data
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erro desconhecido'

        setHookState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }))

        trackEvent('cpr_analysis_error', {
          error: errorMessage,
          step: hookState.state?.currentStep,
          session_id: hookState.state?.sessionId
        })

        return null
      }
    },
    [token, hookState.state, processResponse]
  )

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    setHookState({
      state: null,
      messages: [],
      isLoading: false,
      error: null
    })
  }, [])

  return {
    ...hookState,
    startAnalysis,
    continueAnalysis,
    reset
  }
}

export default useCPRAnalysis
