'use client'

/**
 * useCPRCreation Hook (draft-based)
 *
 * Manages CPR wizard drafts using BFF endpoints:
 * - POST /api/cpr/drafts
 * - GET /api/cpr/drafts/:id
 * - PATCH /api/cpr/drafts/:id
 * - POST /api/cpr/drafts/:id/submit
 */

import { useCallback, useState } from 'react'
import { trackEvent } from '@/components/providers/PostHogProvider'
import type {
  DraftCreateRequest,
  DraftSubmitRequest,
  DraftSubmitResponse,
  DraftSubmitResponseApi,
  DraftUpdateRequest,
  WorkflowResponse,
  WorkflowResponseApi,
  WizardData,
  WizardDraft,
  WizardDraftResponse
} from '@/types/cpr-wizard'

// =============================================================================
// Helpers
// =============================================================================

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json'
}

type Operation = 'idle' | 'loading' | 'saving' | 'submitting'

function mapDraftResponse(draft: WizardDraftResponse): WizardDraft {
  return {
    draftId: draft.draft_id,
    status: draft.status,
    wizardData: draft.wizard_data || {},
    currentStep: draft.current_step,
    version: draft.version,
    documentUrl: draft.document_url,
    createdAt: draft.created_at,
    updatedAt: draft.updated_at,
    expiresAt: draft.expires_at
  }
}

function mapWorkflowResponse(workflow: WorkflowResponseApi): WorkflowResponse {
  return {
    sessionId: workflow.session_id,
    workflowType: workflow.workflow_type,
    currentStep: workflow.current_step,
    isWaitingInput: workflow.is_waiting_input,
    documentUrl: workflow.document_url
  }
}

async function parseError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    return (
      data?.message ||
      data?.detail ||
      data?.error?.message ||
      `Request failed (${response.status})`
    )
  } catch {
    return `Request failed (${response.status})`
  }
}

// =============================================================================
// Hook
// =============================================================================

export function useCPRCreation() {
  const [draft, setDraft] = useState<WizardDraft | null>(null)
  const [operation, setOperation] = useState<Operation>('idle')
  const [error, setError] = useState<string | null>(null)

  const isLoading = operation === 'loading'
  const isSaving = operation === 'saving'
  const isSubmitting = operation === 'submitting'

  const clearError = useCallback(() => setError(null), [])

  const createDraft = useCallback(
    async (
      wizardData?: WizardData,
      currentStep = 1
    ): Promise<WizardDraft | null> => {
      setOperation('loading')
      setError(null)

      try {
        const body: DraftCreateRequest = {}
        if (wizardData) {
          body.wizard_data = wizardData
        }
        if (currentStep) {
          body.current_step = currentStep
        }

        const response = await fetch('/api/cpr/drafts', {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          throw new Error(await parseError(response))
        }

        const data: WizardDraftResponse = await response.json()
        const mapped = mapDraftResponse(data)
        setDraft(mapped)
        setOperation('idle')

        trackEvent('cpr_draft_created', {
          draft_id: mapped.draftId,
          current_step: mapped.currentStep
        })

        return mapped
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Draft create failed'
        setError(message)
        setOperation('idle')

        trackEvent('cpr_draft_error', {
          error: message,
          step: 'create'
        })

        return null
      }
    },
    []
  )

  const loadDraft = useCallback(async (draftId: string) => {
    if (!draftId) {
      setError('Draft id required')
      return null
    }

    setOperation('loading')
    setError(null)

    try {
      const response = await fetch(`/api/cpr/drafts/${draftId}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(await parseError(response))
      }

      const data: WizardDraftResponse = await response.json()
      const mapped = mapDraftResponse(data)
      setDraft(mapped)
      setOperation('idle')

      trackEvent('cpr_draft_loaded', {
        draft_id: mapped.draftId,
        current_step: mapped.currentStep
      })

      return mapped
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Draft load failed'
      setError(message)
      setOperation('idle')

      trackEvent('cpr_draft_error', {
        error: message,
        step: 'load'
      })

      return null
    }
  }, [])

  const updateDraft = useCallback(
    async (
      draftId: string,
      wizardData: WizardData,
      currentStep: number,
      version?: number,
      options?: { silent?: boolean }
    ): Promise<WizardDraft | null> => {
      if (!draftId) {
        if (!options?.silent) {
          setError('Draft id required')
        }
        return null
      }

      if (!options?.silent) {
        setOperation('saving')
        setError(null)
      }

      try {
        const body: DraftUpdateRequest = {
          wizard_data: wizardData,
          current_step: currentStep
        }
        if (typeof version === 'number') {
          body.version = version
        }

        const response = await fetch(`/api/cpr/drafts/${draftId}`, {
          method: 'PATCH',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          throw new Error(await parseError(response))
        }

        const data: WizardDraftResponse = await response.json()
        const mapped = mapDraftResponse(data)
        setDraft(mapped)

        if (!options?.silent) {
          setOperation('idle')
        }

        if (!options?.silent) {
          trackEvent('cpr_draft_updated', {
            draft_id: mapped.draftId,
            current_step: mapped.currentStep,
            version: mapped.version
          })
        }

        return mapped
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Draft update failed'

        if (!options?.silent) {
          setError(message)
          setOperation('idle')
        }

        trackEvent('cpr_draft_error', {
          error: message,
          step: 'update'
        })

        return null
      }
    },
    []
  )

  const submitDraft = useCallback(
    async (draftId: string): Promise<DraftSubmitResponse | null> => {
      if (!draftId) {
        setError('Draft id required')
        return null
      }

      setOperation('submitting')
      setError(null)

      try {
        const body: DraftSubmitRequest = { confirm: true }

        const response = await fetch(`/api/cpr/drafts/${draftId}/submit`, {
          method: 'POST',
          headers: DEFAULT_HEADERS,
          credentials: 'include',
          body: JSON.stringify(body)
        })

        if (!response.ok) {
          throw new Error(await parseError(response))
        }

        const data: DraftSubmitResponseApi = await response.json()
        const mappedDraft = mapDraftResponse(data.draft)
        const mappedWorkflow = data.workflow
          ? mapWorkflowResponse(data.workflow)
          : undefined

        if (mappedWorkflow?.documentUrl) {
          mappedDraft.documentUrl = mappedWorkflow.documentUrl
        }

        setDraft(mappedDraft)
        setOperation('idle')

        trackEvent('cpr_draft_submitted', {
          draft_id: mappedDraft.draftId,
          status: mappedDraft.status,
          document_url: mappedDraft.documentUrl
        })

        return {
          draft: mappedDraft,
          workflow: mappedWorkflow
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Draft submit failed'
        setError(message)
        setOperation('idle')

        trackEvent('cpr_draft_error', {
          error: message,
          step: 'submit'
        })

        return null
      }
    },
    []
  )

  const reset = useCallback(() => {
    setDraft(null)
    setOperation('idle')
    setError(null)
  }, [])

  return {
    draft,
    isLoading,
    isSaving,
    isSubmitting,
    error,
    createDraft,
    loadDraft,
    updateDraft,
    submitDraft,
    clearError,
    reset
  }
}

export default useCPRCreation
