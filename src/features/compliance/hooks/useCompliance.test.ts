/**
 * Tests for useCompliance hook
 *
 * Tests API integration, state management, and error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCompliance } from './useCompliance'
import {
  ComplianceVerifyRequest,
  ComplianceVerifyResponse,
  ComplianceDashboard
} from '../types'

// =============================================================================
// Mocks
// =============================================================================

// Mock AuthContext
const mockToken = 'test-jwt-token'
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ token: mockToken })
}))

// Mock PostHog
vi.mock('@/components/providers/PostHogProvider', () => ({
  trackEvent: vi.fn()
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// =============================================================================
// Test Data
// =============================================================================

const mockVerifyRequest: ComplianceVerifyRequest = {
  document_id: 'doc-123',
  extracted_data: {
    emitente: 'Fazenda XYZ',
    produto: 'Soja',
    quantidade: 1000,
    valor_total: 150000
  }
}

const mockVerifyResponse: ComplianceVerifyResponse = {
  score: 85,
  grade: 'B',
  requirements: [
    {
      id: 'req-1',
      name: 'Identificação do emitente',
      status: 'passed',
      description: 'Nome e CPF/CNPJ presentes',
      severity: 'critical'
    },
    {
      id: 'req-2',
      name: 'Descrição do produto',
      status: 'passed',
      description: 'Produto e quantidade especificados',
      severity: 'major'
    },
    {
      id: 'req-3',
      name: 'Registro B3',
      status: 'warning',
      description: 'Número de registro não encontrado',
      severity: 'minor'
    }
  ],
  recommendations: [
    'Adicionar número de registro B3',
    'Verificar validade do CAR'
  ],
  details: {
    emitente_valid: true,
    produto_valid: true,
    garantias_present: false
  }
}

const mockDashboardResponse: ComplianceDashboard = {
  total_verified: 42,
  compliance_rate: 78.5,
  recent_verifications: [
    {
      id: 'ver-1',
      document_id: 'doc-123',
      score: 85,
      grade: 'B',
      verified_at: '2025-01-15T10:30:00Z'
    },
    {
      id: 'ver-2',
      document_id: 'doc-456',
      score: 92,
      grade: 'A',
      verified_at: '2025-01-14T14:20:00Z'
    }
  ]
}

// =============================================================================
// Tests
// =============================================================================

describe('useCompliance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should start with null result, null dashboard, and no loading', () => {
      const { result } = renderHook(() => useCompliance())

      expect(result.current.result).toBeNull()
      expect(result.current.dashboard).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should provide verify, getDashboard, and reset functions', () => {
      const { result } = renderHook(() => useCompliance())

      expect(typeof result.current.verify).toBe('function')
      expect(typeof result.current.getDashboard).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('verify()', () => {
    it('should set isLoading to true while verifying', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockVerifyResponse)
                }),
              100
            )
          )
      )

      const { result } = renderHook(() => useCompliance())

      act(() => {
        result.current.verify(mockVerifyRequest)
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should call API with correct endpoint and headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerifyResponse)
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.verify(mockVerifyRequest)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/compliance/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify(mockVerifyRequest)
      })
    })

    it('should return and store result on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerifyResponse)
      })

      const { result } = renderHook(() => useCompliance())

      let returnedResult: ComplianceVerifyResponse | null = null
      await act(async () => {
        returnedResult = await result.current.verify(mockVerifyRequest)
      })

      expect(returnedResult).toEqual(mockVerifyResponse)
      expect(result.current.result).toEqual(mockVerifyResponse)
      expect(result.current.error).toBeNull()
    })

    it('should handle API error with detail message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () => Promise.resolve({ detail: 'extracted_data inválido' })
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.verify(mockVerifyRequest)
      })

      expect(result.current.result).toBeNull()
      expect(result.current.error).toBe('extracted_data inválido')
    })

    it('should handle API error without detail', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.verify(mockVerifyRequest)
      })

      expect(result.current.error).toBe('Erro 500: Internal Server Error')
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.verify(mockVerifyRequest)
      })

      expect(result.current.result).toBeNull()
      expect(result.current.error).toBe('Network error')
    })

    it('should handle verification without document_id', async () => {
      const requestWithoutId = {
        extracted_data: { produto: 'Milho' }
      } as unknown as ComplianceVerifyRequest

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerifyResponse)
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.verify(requestWithoutId)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/compliance/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify(requestWithoutId)
      })
      expect(result.current.result).toEqual(mockVerifyResponse)
    })
  })

  describe('getDashboard()', () => {
    it('should set isLoading to true while loading dashboard', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () => Promise.resolve(mockDashboardResponse)
                }),
              100
            )
          )
      )

      const { result } = renderHook(() => useCompliance())

      act(() => {
        result.current.getDashboard()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })

    it('should call API with correct endpoint and headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardResponse)
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.getDashboard()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/compliance/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`
        }
      })
    })

    it('should return and store dashboard on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDashboardResponse)
      })

      const { result } = renderHook(() => useCompliance())

      let returnedDashboard: ComplianceDashboard | null = null
      await act(async () => {
        returnedDashboard = await result.current.getDashboard()
      })

      expect(returnedDashboard).toEqual(mockDashboardResponse)
      expect(result.current.dashboard).toEqual(mockDashboardResponse)
      expect(result.current.error).toBeNull()
    })

    it('should handle API error with detail message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: () => Promise.resolve({ detail: 'Acesso negado' })
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.getDashboard()
      })

      expect(result.current.dashboard).toBeNull()
      expect(result.current.error).toBe('Acesso negado')
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection refused'))

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.getDashboard()
      })

      expect(result.current.dashboard).toBeNull()
      expect(result.current.error).toBe('Connection refused')
    })
  })

  describe('reset()', () => {
    it('should clear result, dashboard, and error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockVerifyResponse)
      })

      const { result } = renderHook(() => useCompliance())

      // First verify
      await act(async () => {
        await result.current.verify(mockVerifyRequest)
      })

      expect(result.current.result).not.toBeNull()

      // Then reset
      act(() => {
        result.current.reset()
      })

      expect(result.current.result).toBeNull()
      expect(result.current.dashboard).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('grades', () => {
    it.each([
      ['A', 95],
      ['B', 85],
      ['C', 70],
      ['D', 55],
      ['F', 40]
    ] as const)(
      'should handle grade "%s" with score %d',
      async (grade, score) => {
        const response: ComplianceVerifyResponse = {
          ...mockVerifyResponse,
          grade,
          score
        }

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response)
        })

        const { result } = renderHook(() => useCompliance())

        await act(async () => {
          await result.current.verify(mockVerifyRequest)
        })

        expect(result.current.result?.grade).toBe(grade)
        expect(result.current.result?.score).toBe(score)
      }
    )
  })

  describe('requirement statuses', () => {
    it('should handle all requirement statuses', async () => {
      const response: ComplianceVerifyResponse = {
        ...mockVerifyResponse,
        requirements: [
          { id: '1', name: 'Test 1', status: 'passed', severity: 'critical' },
          { id: '2', name: 'Test 2', status: 'failed', severity: 'major' },
          { id: '3', name: 'Test 3', status: 'warning', severity: 'minor' }
        ]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(response)
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.verify(mockVerifyRequest)
      })

      expect(result.current.result?.requirements).toHaveLength(3)
      expect(result.current.result?.requirements[0].status).toBe('passed')
      expect(result.current.result?.requirements[1].status).toBe('failed')
      expect(result.current.result?.requirements[2].status).toBe('warning')
    })
  })

  describe('authorization', () => {
    it('should handle 401 unauthorized error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ detail: 'Authorization header required' })
      })

      const { result } = renderHook(() => useCompliance())

      await act(async () => {
        await result.current.verify(mockVerifyRequest)
      })

      expect(result.current.error).toBe('Authorization header required')
    })
  })
})
