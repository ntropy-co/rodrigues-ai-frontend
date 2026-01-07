/**
 * Tests for GET /api/chat/history/[sessionId]
 *
 * Tests the chat history BFF route including:
 * - Authentication validation
 * - Session ID format validation
 * - Pagination parameters validation
 * - Successful history retrieval
 * - Error handling from backend
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, OPTIONS } from './route'

// =============================================================================
// Mocks
// =============================================================================

const mockFetch = vi.fn()
global.fetch = mockFetch

// =============================================================================
// Test Data
// =============================================================================

const mockHistoryResponse = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    session_id: 's_123e4567-e89b-12d3-a456-426614174000',
    role: 'user',
    content: 'Hello, I need help with CPR analysis',
    feedback: null,
    trace_id: 'trace-123',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: null
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    session_id: 's_123e4567-e89b-12d3-a456-426614174000',
    role: 'assistant',
    content: 'I can help you with that. Please upload your CPR document.',
    feedback: 'like',
    trace_id: 'trace-124',
    created_at: '2024-01-01T10:00:05Z',
    updated_at: null
  }
]

// =============================================================================
// Test Helpers
// =============================================================================

function createMockRequest(
  sessionId: string,
  queryParams: Record<string, string> = {},
  authorization?: string
): NextRequest {
  const headers = new Headers()
  if (authorization) {
    headers.set('authorization', authorization)
  }

  const url = new URL(`http://localhost:3000/api/chat/history/${sessionId}`)
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.set(key, value)
  })

  const request = new NextRequest(url.toString(), {
    method: 'GET',
    headers
  })

  return request
}

async function createMockParams(sessionId: string) {
  return { params: Promise.resolve({ sessionId }) }
}

// =============================================================================
// Tests
// =============================================================================

describe('GET /api/chat/history/[sessionId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Set default environment variable
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // ===========================================================================
  // Authentication Tests
  // ===========================================================================

  describe('authentication', () => {
    it('should return 401 when authorization header is missing', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId)
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.detail).toBe('Authorization header required')
    })

    it('should accept valid authorization header', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      const response = await GET(request, params)

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/chat/history/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      )
    })
  })

  // ===========================================================================
  // Session ID Validation Tests
  // ===========================================================================

  describe('session ID validation', () => {
    it('should return 400 for invalid session ID format (no prefix)', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toBe('Invalid session ID format')
    })

    it('should return 400 for invalid session ID format (wrong prefix)', async () => {
      const sessionId = 'p_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toBe('Invalid session ID format')
    })

    it('should return 400 for invalid UUID in session ID', async () => {
      const sessionId = 's_invalid-uuid'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toBe('Invalid session ID format')
    })

    it('should accept valid session ID format', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      const response = await GET(request, params)

      expect(response.status).toBe(200)
    })

    it('should accept uppercase UUID in session ID', async () => {
      const sessionId = 's_123E4567-E89B-12D3-A456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      const response = await GET(request, params)

      expect(response.status).toBe(200)
    })
  })

  // ===========================================================================
  // Pagination Parameter Tests
  // ===========================================================================

  describe('pagination parameters', () => {
    it('should use default pagination when no params provided', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      await GET(request, params)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('skip=0&limit=100'),
        expect.any(Object)
      )
    })

    it('should accept custom skip parameter', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { skip: '10' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      await GET(request, params)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('skip=10'),
        expect.any(Object)
      )
    })

    it('should accept custom limit parameter', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { limit: '50' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      await GET(request, params)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=50'),
        expect.any(Object)
      )
    })

    it('should accept both skip and limit parameters', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { skip: '20', limit: '30' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      await GET(request, params)

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('skip=20&limit=30'),
        expect.any(Object)
      )
    })

    it('should return 400 for negative skip', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { skip: '-1' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toBe('Invalid skip parameter')
    })

    it('should return 400 for non-numeric skip', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { skip: 'abc' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toBe('Invalid skip parameter')
    })

    it('should return 400 for limit less than 1', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { limit: '0' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toContain('Invalid limit parameter')
    })

    it('should return 400 for limit greater than 1000', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { limit: '1001' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toContain('Invalid limit parameter')
    })

    it('should return 400 for non-numeric limit', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        sessionId,
        { limit: 'xyz' },
        'Bearer test-token'
      )
      const params = await createMockParams(sessionId)

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toContain('Invalid limit parameter')
    })
  })

  // ===========================================================================
  // Backend Proxy Tests
  // ===========================================================================

  describe('backend proxy', () => {
    it('should call correct backend endpoint', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      await GET(request, params)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/v1/chat/history/${sessionId}?skip=0&limit=100`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      )
    })

    it('should NOT include Content-Type header for GET request', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      await GET(request, params)

      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1].headers

      expect(headers['Content-Type']).toBeUndefined()
    })

    it('should return conversation history from backend', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockHistoryResponse
      })

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(2)
      expect(data[0].role).toBe('user')
      expect(data[1].role).toBe('assistant')
    })

    it('should handle empty history response', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => []
      })

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(0)
    })
  })

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('should handle 404 from backend (session not found)', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ detail: 'Session not found' })
      })

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.detail).toBe('Session not found')
    })

    it('should handle 403 from backend (not authorized)', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ detail: 'Not authorized' })
      })

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.detail).toBe('Not authorized')
    })

    it('should handle 500 from backend', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Internal server error' })
      })

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.detail).toBe('Internal server error')
    })

    it('should handle network error', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.detail).toBe('Internal server error')
    })

    it('should handle backend response without JSON', async () => {
      const sessionId = 's_123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(sessionId, {}, 'Bearer test-token')
      const params = await createMockParams(sessionId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      const response = await GET(request, params)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.detail).toContain('Backend error')
    })
  })

  // ===========================================================================
  // CORS Tests
  // ===========================================================================

  describe('CORS', () => {
    it('should handle OPTIONS request', async () => {
      const response = await OPTIONS()

      expect(response.status).toBe(204)
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain(
        'GET'
      )
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain(
        'Authorization'
      )
    })
  })
})
