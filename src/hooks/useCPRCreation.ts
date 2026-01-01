'use client'

/**
 * useCPRCreation Hook
 *
 * Hook for CPR document creation workflow with LangGraph.
 * Integrates with CPRWizard to generate CPR documents step-by-step.
 *
 * Usage:
 * ```tsx
 * const {
 *   state,
 *   messages,
 *   isLoading,
 *   error,
 *   startCreation,
 *   continueCreation,
 *   submitStepData,
 *   reset
 * } = useCPRCreation()
 *
 * // Iniciar com dados iniciais do wizard
 * await startCreation({ emitente: {...}, produto: {...} })
 *
 * // Submit wizard step data
 * await submitStepData('emitente', { nome: 'João', cpf: '...' })
 *
 * // Continue with confirmation
 * await continueCreation("Confirmo os dados")
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

export interface DocumentData {
  emitente?: {
    nome?: string
    cpf_cnpj?: string
    rg?: string
    endereco?: string
    municipio?: string
    uf?: string
    cep?: string
  }
  credor?: {
    nome?: string
    cpf_cnpj?: string
    endereco?: string
    municipio?: string
    uf?: string
  }
  produto?: {
    descricao?: string
    quantidade?: number
    unidade?: string
    safra?: string
    local_entrega?: string
  }
  valores?: {
    preco_unitario?: number
    valor_total?: number
    forma_pagamento?: string
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
    matricula_imovel?: string
  }
  clausulas_especiais?: string[]
  [key: string]: unknown
}

export interface WorkflowState {
  sessionId: string
  workflowType: 'criar_cpr'
  currentStep: string
  isWaitingInput: boolean
  documentData?: DocumentData
  documentUrl?: string
}

interface WorkflowResponse {
  text: string
  session_id: string
  workflow_type: 'analise_cpr' | 'criar_cpr'
  is_waiting_input: boolean
  current_step: string
  document_url?: string
  document_data?: DocumentData
}

interface UseCPRCreationState {
  state: WorkflowState | null
  messages: WorkflowMessage[]
  isLoading: boolean
  error: string | null
}

// =============================================================================
// Hook
// =============================================================================

export function useCPRCreation() {
  const { token } = useAuth()

  const [hookState, setHookState] = useState<UseCPRCreationState>({
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

      // Adicionar mensagem do usuário se fornecida
      if (userMessage) {
        newMessages.push({
          id: `user-${Date.now()}`,
          role: 'user',
          content: userMessage,
          timestamp: new Date()
        })
      }

      // Adicionar resposta do assistente
      newMessages.push({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date()
      })

      setHookState((prev) => ({
        state: {
          sessionId: response.session_id,
          workflowType: 'criar_cpr',
          currentStep: response.current_step,
          isWaitingInput: response.is_waiting_input,
          documentData: response.document_data || prev.state?.documentData,
          documentUrl: response.document_url || prev.state?.documentUrl
        },
        messages: [...prev.messages, ...newMessages],
        isLoading: false,
        error: null
      }))
    },
    []
  )

  /**
   * Start a new CPR creation workflow
   */
  const startCreation = useCallback(
    async (
      initialData?: DocumentData,
      sessionId?: string
    ): Promise<WorkflowResponse | null> => {
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
        const response = await fetch('/api/cpr/criar/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            session_id: sessionId,
            initial_data: initialData
          })
        })

        if (!response.ok) {
          let errorMessage = 'Erro ao iniciar criação de CPR'
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
        trackEvent('cpr_creation_started', {
          session_id: data.session_id,
          current_step: data.current_step,
          has_initial_data: !!initialData
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

        trackEvent('cpr_creation_error', {
          error: errorMessage,
          step: 'start'
        })

        return null
      }
    },
    [token, processResponse]
  )

  /**
   * Continue the creation workflow with user response
   */
  const continueCreation = useCallback(
    async (
      message: string,
      stepData?: Record<string, unknown>
    ): Promise<WorkflowResponse | null> => {
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
          error: 'Nenhuma sessão ativa. Inicie uma nova criação.',
          isLoading: false
        }))
        return null
      }

      setHookState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const response = await fetch('/api/cpr/criar/continue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            session_id: hookState.state.sessionId,
            message,
            step_data: stepData
          })
        })

        if (!response.ok) {
          let errorMessage = 'Erro ao continuar criação'
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
        trackEvent('cpr_creation_step_completed', {
          session_id: data.session_id,
          current_step: data.current_step,
          is_complete: !data.is_waiting_input,
          has_document: !!data.document_url
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

        trackEvent('cpr_creation_error', {
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
   * Submit wizard step data
   */
  const submitStepData = useCallback(
    async (
      stepName: string,
      data: Record<string, unknown>
    ): Promise<WorkflowResponse | null> => {
      return continueCreation(`Dados de ${stepName} preenchidos`, {
        [stepName]: data
      })
    },
    [continueCreation]
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
    startCreation,
    continueCreation,
    submitStepData,
    reset
  }
}

export default useCPRCreation
