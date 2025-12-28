/**
 * Tests for /api/sessions/[sessionId] BFF route
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PATCH, DELETE } from './route'

// =============================================================================
// Mocks
// =============================================================================

const mockFetch = vi.fn()
global.fetch = mockFetch

// =============================================================================
// Test Helpers
// =============================================================================

function createMockRequest(
  method: string,
  sessionId: string,
  options: {
    auth?: string
    body?: unknown
  } = {}
): {
  request: NextRequest
  params: { params: Promise<{ sessionId: string }> }
} {
  const url = `http://localhost:3000/api/sessions/${sessionId}`
  const headers = new Headers()

  if (options.auth) {
    headers.set('authorization', options.auth)
  }

  if (options.body) {
    headers.set('content-type', 'application/json')
  }

  const request = new NextRequest(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  return {
    request,
    params: { params: Promise.resolve({ sessionId }) }
  }
}

// =============================================================================
// Tests - GET /api/sessions/[sessionId]
// =============================================================================

describe('GET /api/sessions/[sessionId]', () => {
  const validSessionId = 's_12345678-1234-5678-9abc-123456789abc'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return 401 when authorization header is missing', async () => {
    const { request, params } = createMockRequest('GET', validSessionId)

    const response = await GET(request, params)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('detail')
  })

  it('should return 400 when sessionId format is invalid', async () => {
    const { request, params } = createMockRequest('GET', 'invalid-session-id', {
      auth: 'Bearer test-token'
    })

    const response = await GET(request, params)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('Invalid session ID format')
  })

  it('should return 400 when sessionId does not start with s_', async () => {
    const { request, params } = createMockRequest(
      'GET',
      '12345678-1234-5678-9abc-123456789abc',
      {
        auth: 'Bearer test-token'
      }
    )

    const response = await GET(request, params)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('Invalid session ID format')
  })

  it('should proxy to backend when valid sessionId and auth provided', async () => {
    const sessionId = validSessionId
    const mockSessionData = {
      id: sessionId,
      user_id: 'u_12345678-1234-5678-9abc-123456789abc',
      title: 'Test Session',
      project_id: null,
      is_active: true,
      created_at: '2025-12-27T00:00:00Z',
      updated_at: '2025-12-27T00:00:00Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSessionData)
    })

    const { request, params } = createMockRequest('GET', sessionId, {
      auth: 'Bearer test-token'
    })

    const response = await GET(request, params)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockSessionData)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/v1/sessions/${sessionId}`),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token'
        })
      })
    )
  })

  it('should handle backend error responses', async () => {
    const sessionId = validSessionId

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: 'Session not found' })
    })

    const { request, params } = createMockRequest('GET', sessionId, {
      auth: 'Bearer test-token'
    })

    const response = await GET(request, params)
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.detail).toBe('Session not found')
  })
})

// =============================================================================
// Tests - PATCH /api/sessions/[sessionId]
// =============================================================================

describe('PATCH /api/sessions/[sessionId]', () => {
  const validSessionId = 's_12345678-1234-5678-9abc-123456789abc'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return 401 when authorization header is missing', async () => {
    const { request, params } = createMockRequest('PATCH', validSessionId, {
      body: { title: 'New Title' }
    })

    const response = await PATCH(request, params)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('detail')
  })

  it('should return 400 when sessionId format is invalid', async () => {
    const { request, params } = createMockRequest('PATCH', 'invalid-id', {
      auth: 'Bearer test-token',
      body: { title: 'New Title' }
    })

    const response = await PATCH(request, params)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('Invalid session ID format')
  })

  it('should return 400 when request body is invalid JSON', async () => {
    const sessionId = validSessionId
    const url = `http://localhost:3000/api/sessions/${sessionId}`
    const headers = new Headers()
    headers.set('authorization', 'Bearer test-token')
    headers.set('content-type', 'application/json')

    const request = new NextRequest(url, {
      method: 'PATCH',
      headers,
      body: 'invalid-json'
    })

    const response = await PATCH(request, {
      params: Promise.resolve({ sessionId })
    })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('Invalid request body')
  })

  it('should return 400 when body contains unexpected fields', async () => {
    const sessionId = validSessionId

    const { request, params } = createMockRequest('PATCH', sessionId, {
      auth: 'Bearer test-token',
      body: { title: 'Test', unexpectedField: 'value' }
    })

    const response = await PATCH(request, params)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('Unexpected fields')
  })

  it('should return 400 when title exceeds max length', async () => {
    const sessionId = validSessionId
    const longTitle = 'a'.repeat(201) // 201 characters

    const { request, params } = createMockRequest('PATCH', sessionId, {
      auth: 'Bearer test-token',
      body: { title: longTitle }
    })

    const response = await PATCH(request, params)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('200 characters')
  })

  it('should accept valid title update', async () => {
    const sessionId = validSessionId
    const mockUpdatedSession = {
      id: sessionId,
      user_id: 'u_12345678-1234-5678-9abc-123456789abc',
      title: 'Updated Title',
      project_id: null,
      is_active: true,
      created_at: '2025-12-27T00:00:00Z',
      updated_at: '2025-12-27T00:00:00Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUpdatedSession)
    })

    const { request, params } = createMockRequest('PATCH', sessionId, {
      auth: 'Bearer test-token',
      body: { title: 'Updated Title' }
    })

    const response = await PATCH(request, params)

    expect(response.status).toBe(200)
    expect(data.title).toBe('Updated Title')
  })

  it('should accept valid status update', async () => {
    const sessionId = validSessionId
    const mockUpdatedSession = {
      id: sessionId,
      user_id: 'u_12345678-1234-5678-9abc-123456789abc',
      title: 'Session',
      project_id: null,
      is_active: false,
      created_at: '2025-12-27T00:00:00Z',
      updated_at: '2025-12-27T00:00:00Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockUpdatedSession)
    })

    const { request, params } = createMockRequest('PATCH', sessionId, {
      auth: 'Bearer test-token',
      body: { status: 'inactive' }
    })

    const response = await PATCH(request, params)

    expect(response.status).toBe(200)
  })
})

// =============================================================================
// Tests - DELETE /api/sessions/[sessionId]
// =============================================================================

describe('DELETE /api/sessions/[sessionId]', () => {
  const validSessionId = 's_12345678-1234-5678-9abc-123456789abc'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return 401 when authorization header is missing', async () => {
    const { request, params } = createMockRequest('DELETE', validSessionId)

    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('detail')
  })

  it('should return 400 when sessionId format is invalid', async () => {
    const { request, params } = createMockRequest('DELETE', 'invalid-id', {
      auth: 'Bearer test-token'
    })

    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('Invalid session ID format')
  })

  it('should return 204 on successful deletion', async () => {
    const sessionId = validSessionId

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204
    })

    const { request, params } = createMockRequest('DELETE', sessionId, {
      auth: 'Bearer test-token'
    })

    const response = await DELETE(request, params)

    expect(response.status).toBe(204)
  })

  it('should handle backend error responses', async () => {
    const sessionId = validSessionId

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ detail: 'Forbidden' })
    })

    const { request, params } = createMockRequest('DELETE', sessionId, {
      auth: 'Bearer test-token'
    })

    const response = await DELETE(request, params)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.detail).toBe('Forbidden')
  })
})
