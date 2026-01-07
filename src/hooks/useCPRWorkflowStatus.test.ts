/**
 * Tests for useCPRWorkflowStatus hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCPRWorkflowStatus } from './useCPRWorkflowStatus'

// =============================================================================
// Mocks
// =============================================================================

vi.mock('@/components/providers/PostHogProvider', () => ({
  trackEvent: vi.fn()
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

// =============================================================================
// Test Data
// =============================================================================

const mockAnaliseStatusResponse = {
  text: 'Processando documento...',
  session_id: 'session-123',
  workflow_type: 'analise_cpr',
  is_waiting_input: false,
  current_step: 'processar_documento',
  extracted_data: null
}

const mockAnaliseCompletedResponse = {
  text: 'Análise concluída!',
  session_id: 'session-123',
  workflow_type: 'analise_cpr',
  is_waiting_input: false,
  current_step: 'finalizado',
  extracted_data: { emitente: 'João Silva' },
  compliance_result: { conforme: true },
  risk_result: { score: 85 }
}

const mockCriarStatusResponse = {
  text: 'Coletando dados...',
  session_id: 'session-456',
  workflow_type: 'criar_cpr',
  is_waiting_input: true,
  current_step: 'coletar_dados'
}

// =============================================================================
// Tests
// =============================================================================

describe('useCPRWorkflowStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('Basic Functionality', () => {
    it('should initialize with null status', () => {
      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      expect(result.current.status).toBeNull()
      expect(result.current.isPolling).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle null sessionId gracefully', () => {
      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: null,
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      // Hook should initialize but not fetch
      expect(result.current.status).toBeNull()
      expect(result.current.isPolling).toBe(false)
    })
  })

  describe('Polling Functionality', () => {
    it('should fetch status on manual refresh', async () => {
      vi.useRealTimers()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnaliseStatusResponse
      })

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cpr/analise/status/session-123',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include'
        })
      )

      expect(result.current.status).toMatchObject({
        sessionId: 'session-123',
        workflowType: 'analise_cpr',
        currentStep: 'processar_documento',
        state: 'processing'
      })

      vi.useFakeTimers()
    })

    it('should manually start and stop polling', async () => {
      vi.useRealTimers()

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAnaliseStatusResponse
      })

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      expect(result.current.isPolling).toBe(false)

      act(() => {
        result.current.startPolling()
      })

      await waitFor(() => {
        expect(result.current.isPolling).toBe(true)
      })

      act(() => {
        result.current.stopPolling()
      })

      expect(result.current.isPolling).toBe(false)

      vi.useFakeTimers()
    })
  })

  describe('Workflow Types', () => {
    it('should handle analise_cpr workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnaliseStatusResponse
      })

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cpr/analise/status/session-123',
        expect.any(Object)
      )
    })

    it('should handle criar_cpr workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCriarStatusResponse
      })

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-456',
          workflowType: 'criar_cpr',
          autoStart: false
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cpr/criar/status/session-456',
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle fetch errors', async () => {
      vi.useRealTimers()

      const onError = vi.fn()

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false,
          onError
        })
      )

      // Trigger errors until max retries
      for (let i = 0; i < 3; i++) {
        mockFetch.mockRejectedValueOnce(new Error('Network error'))
        await act(async () => {
          await result.current.refresh()
        })
      }

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
        expect(onError).toHaveBeenCalled()
      })

      vi.useFakeTimers()
    })

    it('should handle HTTP error responses', async () => {
      vi.useRealTimers()

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      // Trigger errors until max retries
      for (let i = 0; i < 3; i++) {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
          json: async () => ({ detail: 'Not authenticated' })
        })
        await act(async () => {
          await result.current.refresh()
        })
      }

      await waitFor(() => {
        expect(result.current.error).toContain('Not authenticated')
      })

      vi.useFakeTimers()
    })

    it('should reset retry count on successful fetch', async () => {
      vi.useRealTimers()

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      // First call fails
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      await act(async () => {
        await result.current.refresh()
      })

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnaliseStatusResponse
      })
      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.status).toBeTruthy()

      vi.useFakeTimers()
    })
  })

  describe('State Derivation', () => {
    it('should derive "completed" state for finalizado step', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockAnaliseCompletedResponse,
          current_step: 'finalizado',
          is_waiting_input: false
        })
      })

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.status?.state).toBe('completed')
      expect(result.current.status?.currentStep).toBe('finalizado')
    })

    it('should derive "running" state when waiting for input', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockAnaliseStatusResponse,
          current_step: 'confirmar_dados',
          is_waiting_input: true
        })
      })

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.status?.state).toBe('running')
      expect(result.current.status?.isWaitingInput).toBe(true)
    })

    it('should derive "processing" state when actively processing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockAnaliseStatusResponse,
          current_step: 'processar_documento',
          is_waiting_input: false
        })
      })

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(result.current.status?.state).toBe('processing')
      expect(result.current.status?.isWaitingInput).toBe(false)
    })
  })

  describe('Callbacks', () => {
    it('should call onStatusChange on each update', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAnaliseStatusResponse
      })

      const onStatusChange = vi.fn()

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false,
          onStatusChange
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(onStatusChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session-123',
          workflowType: 'analise_cpr'
        })
      )
    })

    it('should call onComplete when workflow completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnaliseCompletedResponse
      })

      const onComplete = vi.fn()

      const { result } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: false,
          onComplete
        })
      )

      await act(async () => {
        await result.current.refresh()
      })

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          state: 'completed'
        })
      )
    })
  })

  describe('Cleanup', () => {
    it('should stop polling on unmount', async () => {
      vi.useRealTimers()

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAnaliseStatusResponse
      })

      const { result, unmount } = renderHook(() =>
        useCPRWorkflowStatus({
          sessionId: 'session-123',
          workflowType: 'analise_cpr',
          autoStart: true,
          pollingInterval: 100
        })
      )

      await waitFor(() => {
        expect(result.current.isPolling).toBe(true)
      })

      const callsBefore = mockFetch.mock.calls.length

      unmount()

      // Wait a bit to ensure no more calls are made
      await new Promise((resolve) => setTimeout(resolve, 300))

      // Polling should have stopped - no new calls
      expect(mockFetch.mock.calls.length).toBe(callsBefore)

      vi.useFakeTimers()
    })
  })
})
