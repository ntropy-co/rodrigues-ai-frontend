/**
 * Tests for useCPRAnalysis hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCPRAnalysis } from '@/features/cpr/hooks/useCPRAnalysis'

// =============================================================================
// Mocks
// =============================================================================

const mockToken = 'test-jwt-token'
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ token: mockToken })
}))

vi.mock('@/components/providers/PostHogProvider', () => ({
  trackEvent: vi.fn()
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

// =============================================================================
// Test Data
// =============================================================================

const mockStartResponse = {
  text: 'Olá! Para analisar uma CPR, envie o documento ou cole o texto.',
  session_id: 'session-123',
  workflow_type: 'analise_cpr',
  is_waiting_input: true,
  current_step: 'aguardando_documento'
}

const mockContinueResponse = {
  text: 'Dados extraídos com sucesso. Confirme se estão corretos.',
  session_id: 'session-123',
  workflow_type: 'analise_cpr',
  is_waiting_input: true,
  current_step: 'confirmacao_dados',
  extracted_data: {
    emitente: { nome: 'João Silva', cpf_cnpj: '123.456.789-00' },
    produto: { descricao: 'Soja', quantidade: 1000, unidade: 'sacas' }
  }
}

const mockFinalResponse = {
  text: 'Análise concluída. O documento está em conformidade com a Lei 8.929/94.',
  session_id: 'session-123',
  workflow_type: 'analise_cpr',
  is_waiting_input: false,
  current_step: 'concluido',
  compliance_result: {
    score: 85,
    grade: 'A',
    requirements: [
      { id: '1', name: 'Identificação do emitente', status: 'ok' }
    ],
    recommendations: []
  },
  risk_result: {
    overall_score: 30,
    risk_level: 'baixo',
    factors: [{ id: '1', name: 'Garantia', impact: 'positive', weight: 0.3 }],
    recommendations: []
  }
}

// =============================================================================
// Tests
// =============================================================================

describe('useCPRAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should start with null state and empty messages', () => {
      const { result } = renderHook(() => useCPRAnalysis())

      expect(result.current.state).toBeNull()
      expect(result.current.messages).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useCPRAnalysis())

      expect(typeof result.current.startAnalysis).toBe('function')
      expect(typeof result.current.continueAnalysis).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('startAnalysis()', () => {
    it('should call API with correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/cpr/analise/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({})
      })
    })

    it('should update state on successful start', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis()
      })

      expect(result.current.state).not.toBeNull()
      expect(result.current.state?.sessionId).toBe('session-123')
      expect(result.current.state?.workflowType).toBe('analise_cpr')
      expect(result.current.state?.isWaitingInput).toBe(true)
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].role).toBe('assistant')
    })

    it('should pass session_id when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis('existing-session')
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/cpr/analise/start', {
        method: 'POST',
        headers: expect.any(Object),
        body: JSON.stringify({ session_id: 'existing-session' })
      })
    })

    it('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ detail: 'Server error' })
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis()
      })

      expect(result.current.error).toBe('Server error')
      expect(result.current.state).toBeNull()
    })
  })

  describe('continueAnalysis()', () => {
    it('should fail without active session', async () => {
      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.continueAnalysis('test message')
      })

      expect(result.current.error).toBe(
        'Nenhuma sessão ativa. Inicie uma nova análise.'
      )
    })

    it('should call API with session_id and message', async () => {
      // Start first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis()
      })

      // Then continue
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      await act(async () => {
        await result.current.continueAnalysis('Texto do documento CPR...')
      })

      expect(mockFetch).toHaveBeenLastCalledWith('/api/cpr/analise/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          session_id: 'session-123',
          message: 'Texto do documento CPR...'
        })
      })
    })

    it('should add both user and assistant messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis()
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      await act(async () => {
        await result.current.continueAnalysis('Sim')
      })

      // 1 from start + 2 from continue (user + assistant)
      expect(result.current.messages).toHaveLength(3)
      expect(result.current.messages[1].role).toBe('user')
      expect(result.current.messages[1].content).toBe('Sim')
      expect(result.current.messages[2].role).toBe('assistant')
    })

    it('should update extracted_data when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis()
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      await act(async () => {
        await result.current.continueAnalysis('documento...')
      })

      expect(result.current.state?.extractedData).toBeDefined()
      expect(result.current.state?.extractedData?.emitente?.nome).toBe(
        'João Silva'
      )
    })
  })

  describe('full workflow', () => {
    it('should complete full analysis flow', async () => {
      const { result } = renderHook(() => useCPRAnalysis())

      // Step 1: Start
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      await act(async () => {
        await result.current.startAnalysis()
      })

      expect(result.current.state?.currentStep).toBe('aguardando_documento')

      // Step 2: Send document
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      await act(async () => {
        await result.current.continueAnalysis('CPR documento texto...')
      })

      expect(result.current.state?.currentStep).toBe('confirmacao_dados')
      expect(result.current.state?.extractedData).toBeDefined()

      // Step 3: Confirm and finish
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFinalResponse)
      })

      await act(async () => {
        await result.current.continueAnalysis('Sim, confirmo')
      })

      expect(result.current.state?.currentStep).toBe('concluido')
      expect(result.current.state?.isWaitingInput).toBe(false)
      expect(result.current.state?.complianceResult).toBeDefined()
      expect(result.current.state?.riskResult).toBeDefined()
    })
  })

  describe('reset()', () => {
    it('should clear all state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRAnalysis())

      await act(async () => {
        await result.current.startAnalysis()
      })

      expect(result.current.state).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.state).toBeNull()
      expect(result.current.messages).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })
})
