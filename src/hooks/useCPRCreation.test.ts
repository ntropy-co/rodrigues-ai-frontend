/**
 * Tests for useCPRCreation hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCPRCreation } from '@/features/cpr/hooks/useCPRCreation'

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
  text: 'Vamos criar sua CPR. Por favor, informe os dados do emitente.',
  session_id: 'session-456',
  workflow_type: 'criar_cpr',
  is_waiting_input: true,
  current_step: 'emitente'
}

const mockContinueResponse = {
  text: 'Dados do emitente registrados. Agora informe os dados do credor.',
  session_id: 'session-456',
  workflow_type: 'criar_cpr',
  is_waiting_input: true,
  current_step: 'credor',
  document_data: {
    emitente: { nome: 'Maria Santos', cpf_cnpj: '987.654.321-00' }
  }
}

const mockFinalResponse = {
  text: 'CPR gerada com sucesso! Clique no link para baixar.',
  session_id: 'session-456',
  workflow_type: 'criar_cpr',
  is_waiting_input: false,
  current_step: 'concluido',
  document_url: 'https://storage.example.com/cpr-123.pdf',
  document_data: {
    emitente: { nome: 'Maria Santos', cpf_cnpj: '987.654.321-00' },
    credor: { nome: 'Banco Agro', cpf_cnpj: '00.000.000/0001-00' },
    produto: { descricao: 'Milho', quantidade: 500, unidade: 'toneladas' }
  }
}

// =============================================================================
// Tests
// =============================================================================

describe('useCPRCreation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should start with null state and empty messages', () => {
      const { result } = renderHook(() => useCPRCreation())

      expect(result.current.state).toBeNull()
      expect(result.current.messages).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useCPRCreation())

      expect(typeof result.current.startCreation).toBe('function')
      expect(typeof result.current.continueCreation).toBe('function')
      expect(typeof result.current.submitStepData).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('startCreation()', () => {
    it('should call API with correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/cpr/criar/start', {
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

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation()
      })

      expect(result.current.state).not.toBeNull()
      expect(result.current.state?.sessionId).toBe('session-456')
      expect(result.current.state?.workflowType).toBe('criar_cpr')
      expect(result.current.state?.currentStep).toBe('emitente')
    })

    it('should pass initial_data when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const initialData = {
        emitente: { nome: 'Test User' },
        produto: { descricao: 'Soja' }
      }

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation(initialData)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/cpr/criar/start', {
        method: 'POST',
        headers: expect.any(Object),
        body: JSON.stringify({ initial_data: initialData })
      })
    })

    it('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Dados inválidos' })
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation()
      })

      expect(result.current.error).toBe('Dados inválidos')
      expect(result.current.state).toBeNull()
    })
  })

  describe('continueCreation()', () => {
    it('should fail without active session', async () => {
      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.continueCreation('confirm')
      })

      expect(result.current.error).toBe(
        'Nenhuma sessão ativa. Inicie uma nova criação.'
      )
    })

    it('should call API with session_id, message and step_data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation()
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      const stepData = { emitente: { nome: 'Test', cpf_cnpj: '123' } }

      await act(async () => {
        await result.current.continueCreation('Dados preenchidos', stepData)
      })

      expect(mockFetch).toHaveBeenLastCalledWith('/api/cpr/criar/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          session_id: 'session-456',
          message: 'Dados preenchidos',
          step_data: stepData
        })
      })
    })

    it('should update document_data when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation()
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      await act(async () => {
        await result.current.continueCreation('next')
      })

      expect(result.current.state?.documentData).toBeDefined()
      expect(result.current.state?.documentData?.emitente?.nome).toBe(
        'Maria Santos'
      )
    })
  })

  describe('submitStepData()', () => {
    it('should call continueCreation with formatted message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation()
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      const emitenteData = { nome: 'Test', cpf_cnpj: '123.456.789-00' }

      await act(async () => {
        await result.current.submitStepData('emitente', emitenteData)
      })

      expect(mockFetch).toHaveBeenLastCalledWith('/api/cpr/criar/continue', {
        method: 'POST',
        headers: expect.any(Object),
        body: JSON.stringify({
          session_id: 'session-456',
          message: 'Dados de emitente preenchidos',
          step_data: { emitente: emitenteData }
        })
      })
    })
  })

  describe('full workflow', () => {
    it('should complete full creation flow with document URL', async () => {
      const { result } = renderHook(() => useCPRCreation())

      // Step 1: Start
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      await act(async () => {
        await result.current.startCreation()
      })

      expect(result.current.state?.currentStep).toBe('emitente')

      // Step 2: Submit emitente data
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContinueResponse)
      })

      await act(async () => {
        await result.current.submitStepData('emitente', {
          nome: 'Maria Santos'
        })
      })

      expect(result.current.state?.currentStep).toBe('credor')

      // Step 3: Finish and get document
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFinalResponse)
      })

      await act(async () => {
        await result.current.continueCreation('Gerar documento')
      })

      expect(result.current.state?.currentStep).toBe('concluido')
      expect(result.current.state?.isWaitingInput).toBe(false)
      expect(result.current.state?.documentUrl).toBe(
        'https://storage.example.com/cpr-123.pdf'
      )
    })
  })

  describe('reset()', () => {
    it('should clear all state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStartResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.startCreation()
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
