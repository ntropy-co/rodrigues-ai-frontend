/**
 * Tests for POST /api/chat/[messageId]/feedback
 *
 * Tests the message feedback BFF route including:
 * - Authentication validation
 * - Message ID format validation
 * - Feedback value validation
 * - Successful feedback submission
 * - Error handling from backend
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST, OPTIONS } from './route'

// =============================================================================
// Mocks
// =============================================================================

const mockFetch = vi.fn()
global.fetch = mockFetch

// =============================================================================
// Test Helpers
// =============================================================================

function createMockRequest(
  messageId: string,
  body: unknown,
  authorization?: string
): NextRequest {
  const headers = new Headers()
  if (authorization) {
    headers.set('authorization', authorization)
  }
  headers.set('content-type', 'application/json')

  const request = new NextRequest('http://localhost:3000/api/chat/feedback', {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  })

  return request
}

async function createMockParams(messageId: string) {
  return { params: Promise.resolve({ messageId }) }
}

// =============================================================================
// Tests
// =============================================================================

describe('POST /api/chat/[messageId]/feedback', () => {
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
      const request = createMockRequest(
        '123e4567-e89b-12d3-a456-426614174000',
        { feedback: 'like' }
      )
      const params = await createMockParams(
        '123e4567-e89b-12d3-a456-426614174000'
      )

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.detail).toBe('Authorization header required')
    })

    it('should accept valid authorization header', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      const response = await POST(request, params)

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/chat/'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token'
          })
        })
      )
    })
  })

  // ===========================================================================
  // Message ID Validation Tests
  // ===========================================================================

  describe('message ID validation', () => {
    it('should return 400 for invalid UUID format', async () => {
      const request = createMockRequest(
        'invalid-uuid',
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams('invalid-uuid')

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toBe('Invalid ID format')
    })

    it('should accept valid UUID format', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      const response = await POST(request, params)

      expect(response.status).toBe(200)
    })

    it('should handle uppercase UUID', async () => {
      const messageId = '123E4567-E89B-12D3-A456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'dislike' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      const response = await POST(request, params)

      expect(response.status).toBe(200)
    })
  })

  // ===========================================================================
  // Request Body Validation Tests
  // ===========================================================================

  describe('request body validation', () => {
    it('should return 400 for invalid JSON body', async () => {
      const headers = new Headers()
      headers.set('authorization', 'Bearer test-token')
      headers.set('content-type', 'application/json')

      const request = new NextRequest(
        'http://localhost:3000/api/chat/feedback',
        {
          method: 'POST',
          headers,
          body: 'invalid-json'
        }
      )

      const params = await createMockParams(
        '123e4567-e89b-12d3-a456-426614174000'
      )

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toBe('Invalid request body')
    })

    it('should return 400 for invalid feedback value', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'invalid' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.detail).toContain('Invalid feedback value')
    })

    it('should accept "like" feedback', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      const response = await POST(request, params)

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ feedback: 'like' })
        })
      )
    })

    it('should accept "dislike" feedback', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'dislike' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      const response = await POST(request, params)

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ feedback: 'dislike' })
        })
      )
    })

    it('should accept "none" feedback', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'none' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      const response = await POST(request, params)

      expect(response.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ feedback: 'none' })
        })
      )
    })
  })

  // ===========================================================================
  // Backend Proxy Tests
  // ===========================================================================

  describe('backend proxy', () => {
    it('should call correct backend endpoint', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      await POST(request, params)

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:8000/api/v1/chat/${messageId}/feedback`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token'
          }),
          body: JSON.stringify({ feedback: 'like' })
        })
      )
    })

    it('should return success response from backend', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'success' })
      })

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.status).toBe('success')
    })
  })

  // ===========================================================================
  // Error Handling Tests
  // ===========================================================================

  describe('error handling', () => {
    it('should handle 404 from backend (message not found)', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ detail: 'Message not found' })
      })

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.detail).toBe('Message not found')
    })

    it('should handle 403 from backend (not authorized)', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        json: async () => ({ detail: 'Not authorized' })
      })

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.detail).toBe('Not authorized')
    })

    it('should handle 500 from backend', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ detail: 'Internal server error' })
      })

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.detail).toBe('Internal server error')
    })

    it('should handle network error', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const response = await POST(request, params)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.detail).toBe('Internal server error')
    })

    it('should handle backend response without JSON', async () => {
      const messageId = '123e4567-e89b-12d3-a456-426614174000'
      const request = createMockRequest(
        messageId,
        { feedback: 'like' },
        'Bearer test-token'
      )
      const params = await createMockParams(messageId)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      const response = await POST(request, params)
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
        'POST'
      )
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain(
        'Authorization'
      )
    })
  })
})
