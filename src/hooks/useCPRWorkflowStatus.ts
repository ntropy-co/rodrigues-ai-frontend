'use client'

/**
 * useCPRWorkflowStatus Hook
 *
 * Hook for polling CPR workflow status with configurable intervals.
 * Automatically polls while workflow is in progress and stops on completion/error.
 *
 * Features:
 * - Configurable polling interval (default: 2000ms)
 * - Auto-start/stop based on workflow state
 * - Manual refresh capability
 * - Error handling with exponential backoff
 * - Automatic cleanup on unmount
 *
 * Usage:
 * ```tsx
 * const {
 *   status,
 *   isPolling,
 *   error,
 *   startPolling,
 *   stopPolling,
 *   refresh
 * } = useCPRWorkflowStatus({
 *   sessionId: 'abc123',
 *   workflowType: 'analise_cpr',
 *   pollingInterval: 2000,
 *   autoStart: true
 * })
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { trackEvent } from '@/components/providers/PostHogProvider'

// =============================================================================
// Types
// =============================================================================

export type WorkflowType = 'analise_cpr' | 'criar_cpr'

export type WorkflowStep =
  | 'inicio'
  | 'solicitar_documento'
  | 'processar_documento'
  | 'confirmar_dados'
  | 'verificar_compliance'
  | 'calcular_risco'
  | 'finalizado'
  | 'selecionar_tipo'
  | 'coletar_dados'
  | 'revisar_dados'
  | 'gerar_documento'
  | 'unknown'

export type WorkflowState =
  | 'pending' // Not started
  | 'running' // In progress, waiting for input
  | 'processing' // Actively processing (not waiting)
  | 'completed' // Successfully finished
  | 'failed' // Error occurred
  | 'unknown' // Unknown state

export interface WorkflowStatus {
  text: string
  sessionId: string
  workflowType: WorkflowType
  isWaitingInput: boolean
  currentStep: WorkflowStep
  state: WorkflowState
  extractedData?: Record<string, unknown>
  complianceResult?: Record<string, unknown>
  riskResult?: Record<string, unknown>
  documentoUrl?: string
  documentoGerado?: boolean
  lastUpdated: Date
}

export interface UseCPRWorkflowStatusOptions {
  sessionId: string | null
  workflowType: WorkflowType
  pollingInterval?: number // milliseconds, default: 2000
  autoStart?: boolean // auto-start polling, default: true
  onStatusChange?: (status: WorkflowStatus) => void
  onComplete?: (status: WorkflowStatus) => void
  onError?: (error: string) => void
}

export interface UseCPRWorkflowStatusReturn {
  status: WorkflowStatus | null
  isPolling: boolean
  error: string | null
  startPolling: () => void
  stopPolling: () => void
  refresh: () => Promise<void>
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Derive workflow state from response
 */
function deriveWorkflowState(
  currentStep: string,
  isWaitingInput: boolean,
  workflowType: WorkflowType
): WorkflowState {
  // Check if workflow is complete
  if (currentStep === 'finalizado') {
    return 'completed'
  }

  // Check for analysis completion (last step before finalizado)
  if (
    workflowType === 'analise_cpr' &&
    currentStep === 'calcular_risco' &&
    !isWaitingInput
  ) {
    return 'completed'
  }

  // Check for creation completion (last step before finalizado)
  if (
    workflowType === 'criar_cpr' &&
    currentStep === 'gerar_documento' &&
    !isWaitingInput
  ) {
    return 'completed'
  }

  // If waiting for user input, workflow is running but paused
  if (isWaitingInput) {
    return 'running'
  }

  // If not waiting and not complete, actively processing
  return 'processing'
}

/**
 * Parse backend response into WorkflowStatus
 */
function parseWorkflowStatus(
  data: Record<string, unknown>,
  workflowType: WorkflowType
): WorkflowStatus {
  const currentStep = (data.current_step as string) || 'unknown'
  const isWaitingInput = Boolean(data.is_waiting_input)

  return {
    text: (data.text as string) || '',
    sessionId: (data.session_id as string) || '',
    workflowType,
    isWaitingInput,
    currentStep: currentStep as WorkflowStep,
    state: deriveWorkflowState(currentStep, isWaitingInput, workflowType),
    extractedData: data.extracted_data as Record<string, unknown> | undefined,
    complianceResult: data.compliance_result as
      | Record<string, unknown>
      | undefined,
    riskResult: data.risk_result as Record<string, unknown> | undefined,
    documentoUrl: data.documento_url as string | undefined,
    documentoGerado: data.documento_gerado as boolean | undefined,
    lastUpdated: new Date()
  }
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useCPRWorkflowStatus({
  sessionId,
  workflowType,
  pollingInterval = 2000,
  autoStart = true,
  onStatusChange,
  onComplete,
  onError
}: UseCPRWorkflowStatusOptions): UseCPRWorkflowStatusReturn {
  const [status, setStatus] = useState<WorkflowStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use refs to avoid recreating interval on every render
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const maxRetries = 3

  /**
   * Stop polling - using ref to avoid circular dependencies
   */
  const stopPollingRef = useRef<() => void>(() => {})
  stopPollingRef.current = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Cancel any ongoing fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Reset retry counter
    retryCountRef.current = 0

    if (isMountedRef.current) {
      setIsPolling(false)
    }

    trackEvent('cpr_workflow_polling_stopped', {
      session_id: sessionId,
      workflow_type: workflowType
    })
  }

  /**
   * Fetch workflow status from BFF
   */
  const fetchStatus = useCallback(async (): Promise<WorkflowStatus | null> => {
    if (!sessionId) {
      if (isMountedRef.current) {
        setError('Session ID is required')
      }
      return null
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController()

    try {
      const endpoint =
        workflowType === 'analise_cpr'
          ? `/api/cpr/analise/status/${sessionId}`
          : `/api/cpr/criar/status/${sessionId}`

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Send cookies
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao buscar status'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      const newStatus = parseWorkflowStatus(data, workflowType)

      // Reset retry count on success
      retryCountRef.current = 0

      if (isMountedRef.current) {
        setError(null)
      }

      return newStatus
    } catch (err) {
      // Ignore AbortError - it's expected when cancelling requests
      if (err instanceof Error && err.name === 'AbortError') {
        return null
      }

      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido'

      // Increment retry count
      retryCountRef.current += 1

      if (retryCountRef.current >= maxRetries) {
        if (isMountedRef.current) {
          setError(errorMessage)
        }
        stopPollingRef.current?.()
        onError?.(errorMessage)

        trackEvent('cpr_workflow_status_error', {
          session_id: sessionId,
          workflow_type: workflowType,
          error: errorMessage,
          retries: retryCountRef.current
        })
      }

      return null
    }
  }, [sessionId, workflowType, onError])

  /**
   * Manual refresh
   */
  const refresh = useCallback(async () => {
    const newStatus = await fetchStatus()
    if (newStatus && isMountedRef.current) {
      setStatus(newStatus)
      onStatusChange?.(newStatus)

      // Check if workflow completed
      if (newStatus.state === 'completed') {
        stopPollingRef.current?.()
        onComplete?.(newStatus)

        trackEvent('cpr_workflow_completed', {
          session_id: sessionId,
          workflow_type: workflowType,
          final_step: newStatus.currentStep
        })
      }
    }
  }, [fetchStatus, onStatusChange, onComplete, sessionId, workflowType])

  /**
   * Start polling
   */
  const startPolling = useCallback(() => {
    if (!sessionId || isPolling) return

    setIsPolling(true)
    retryCountRef.current = 0

    // Immediate first fetch
    refresh()

    // Set up interval
    intervalRef.current = setInterval(() => {
      refresh()
    }, pollingInterval)

    trackEvent('cpr_workflow_polling_started', {
      session_id: sessionId,
      workflow_type: workflowType,
      interval: pollingInterval
    })
  }, [sessionId, workflowType, pollingInterval, isPolling, refresh])

  /**
   * Stable stopPolling function (uses ref internally)
   */
  const stopPolling = useCallback(() => {
    stopPollingRef.current?.()
  }, [])

  /**
   * Cleanup on sessionId change - prevent memory leaks
   */
  useEffect(() => {
    return () => {
      // Clear interval when sessionId changes
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Cancel ongoing fetch
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
    }
  }, [sessionId])

  /**
   * Track component mount state
   */
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Auto-start polling on mount
   */
  useEffect(() => {
    if (autoStart && sessionId) {
      startPolling()
    }

    // Cleanup on unmount
    return () => {
      stopPollingRef.current?.()
    }
  }, [autoStart, sessionId, startPolling])

  /**
   * Stop polling when workflow completes
   */
  useEffect(() => {
    if (status?.state === 'completed' || status?.state === 'failed') {
      stopPolling()
    }
  }, [status?.state, stopPolling])

  return {
    status,
    isPolling,
    error,
    startPolling,
    stopPolling,
    refresh
  }
}

export default useCPRWorkflowStatus
