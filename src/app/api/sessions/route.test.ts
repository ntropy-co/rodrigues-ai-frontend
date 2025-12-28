/**
 * Tests for /api/sessions BFF route
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

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
  options: {
    auth?: string
    queryParams?: Record<string, string>
    body?: unknown
  } = {}
): NextRequest {
  const url = new URL('http://localhost:3000/api/sessions')

  if (options.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const headers = new Headers()

  if (options.auth) {
    headers.set('authorization', options.auth)
  }

  if (options.body) {
    headers.set('content-type', 'application/json')
  }

  return new NextRequest(url, {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  })
}

// =============================================================================
// Tests - GET /api/sessions
// =============================================================================

describe('GET /api/sessions', () => {
  const validSessionId = 's_12345678-1234-5678-9abc-123456789abc'
  const validProjectId = 'p_12345678-1234-5678-9abc-123456789abc'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return 401 when authorization header is missing', async () => {
    const request = createMockRequest('GET')

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('detail')
  })

  it('should fetch sessions with default pagination', async () => {
    const mockSessions = [
      {
        id: validSessionId,
        user_id: 'u_12345678-1234-5678-9abc-123456789abc',
        title: 'Session 1',
        project_id: null,
        is_active: true,
        created_at: '2025-12-27T00:00:00Z',
        updated_at: '2025-12-27T00:00:00Z'
      }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockSessions)
    })

    const request = createMockRequest('GET', {
      auth: 'Bearer test-token'
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual(mockSessions)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('skip=0'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=100'),
      expect.any(Object)
    )
  })

  it('should accept custom skip and limit params', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    })

    const request = createMockRequest('GET', {
      auth: 'Bearer test-token',
      queryParams: { skip: '10', limit: '50' }
    })

    await GET(request)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('skip=10'),
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('limit=50'),
      expect.any(Object)
    )
  })

  it('should return 400 when project_id format is invalid', async () => {
    const request = createMockRequest('GET', {
      auth: 'Bearer test-token',
      queryParams: { project_id: 'invalid-project-id' }
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toContain('Invalid project_id format')
  })

  it('should accept valid project_id filter', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    })

    const request = createMockRequest('GET', {
      auth: 'Bearer test-token',
      queryParams: { project_id: validProjectId }
    })

    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining(`project_id=${validProjectId}`),
      expect.any(Object)
    )
  })

  it('should return cache headers on successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    })

    const request = createMockRequest('GET', {
      auth: 'Bearer test-token'
    })

    const response = await GET(request)

    expect(response.headers.get('Cache-Control')).toBeTruthy()
    expect(response.headers.get('Cache-Control')).toContain('private')
  })

  it('should handle backend error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: 'Internal server error' })
    })

    const request = createMockRequest('GET', {
      auth: 'Bearer test-token'
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.detail).toBeTruthy()
  })
})

// =============================================================================
// Tests - POST /api/sessions
// =============================================================================

describe('POST /api/sessions', () => {
  const validSessionId = 's_12345678-1234-5678-9abc-123456789abc'
  const validProjectId = 'p_12345678-1234-5678-9abc-123456789abc'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return 401 when authorization header is missing', async () => {
    const request = createMockRequest('POST', {
      body: { title: 'New Session' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data).toHaveProperty('detail')
  })

  it('should create session with empty body', async () => {
    const mockNewSession = {
      id: validSessionId,
      user_id: 'u_12345678-1234-5678-9abc-123456789abc',
      title: 'Nova Conversa',
      project_id: null,
      is_active: true,
      created_at: '2025-12-27T00:00:00Z',
      updated_at: '2025-12-27T00:00:00Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockNewSession)
    })

    const request = createMockRequest('POST', {
      auth: 'Bearer test-token'
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data).toEqual(mockNewSession)
  })

  it('should create session with title', async () => {
    const mockNewSession = {
      id: validSessionId,
      user_id: 'u_12345678-1234-5678-9abc-123456789abc',
      title: 'Custom Title',
      project_id: null,
      is_active: true,
      created_at: '2025-12-27T00:00:00Z',
      updated_at: '2025-12-27T00:00:00Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockNewSession)
    })

    const request = createMockRequest('POST', {
      auth: 'Bearer test-token',
      body: { title: 'Custom Title' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('Custom Title')
  })

  it('should create session with project_id', async () => {
    const mockNewSession = {
      id: validSessionId,
      user_id: 'u_12345678-1234-5678-9abc-123456789abc',
      title: 'Project Session',
      project_id: validProjectId,
      is_active: true,
      created_at: '2025-12-27T00:00:00Z',
      updated_at: '2025-12-27T00:00:00Z'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockNewSession)
    })

    const request = createMockRequest('POST', {
      auth: 'Bearer test-token',
      body: { title: 'Project Session', project_id: validProjectId }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.project_id).toBe(validProjectId)
  })

  it('should handle backend validation errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ detail: 'Invalid project_id' })
    })

    const request = createMockRequest('POST', {
      auth: 'Bearer test-token',
      body: { project_id: 'invalid' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.detail).toBeTruthy()
  })

  it('should handle backend error responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: 'Internal server error' })
    })

    const request = createMockRequest('POST', {
      auth: 'Bearer test-token',
      body: { title: 'Test' }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.detail).toBeTruthy()
  })
})
