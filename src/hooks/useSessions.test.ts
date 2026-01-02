/**
 * Tests for useSessions hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSessions } from './useSessions'

// =============================================================================
// Mocks
// =============================================================================

const mockUser = {
  id: 'user-123',
  email: 'user@example.com',
  name: 'Test User',
  role: 'analyst'
}
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser })
}))

const mockFetchWithRefresh = vi.fn()
vi.mock('@/lib/auth/token-refresh', () => ({
  fetchWithRefresh: (...args: unknown[]) => mockFetchWithRefresh(...args)
}))

// =============================================================================
// Test Data
// =============================================================================

const validSessionId = 's_12345678-1234-5678-9abc-123456789abc'
const validProjectId = 'p_12345678-1234-5678-9abc-123456789abc'

const mockBackendSession = {
  id: validSessionId,
  user_id: 'u_12345678-1234-5678-9abc-123456789abc',
  title: 'Test Session',
  project_id: null,
  is_active: true,
  created_at: '2025-12-27T00:00:00Z',
  updated_at: '2025-12-27T00:00:00Z'
}

// =============================================================================
// Tests
// =============================================================================

describe('useSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('initial state', () => {
    it('should start with correct initial state', () => {
      const { result } = renderHook(() => useSessions())

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(typeof result.current.fetchSessions).toBe('function')
      expect(typeof result.current.createSession).toBe('function')
      expect(typeof result.current.deleteSession).toBe('function')
      expect(typeof result.current.updateSession).toBe('function')
    })
  })

  describe('fetchSessions()', () => {
    it('should fetch sessions successfully', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([mockBackendSession])
      })

      const { result } = renderHook(() => useSessions())

      let sessions
      await act(async () => {
        sessions = await result.current.fetchSessions()
      })

      expect(sessions).toHaveLength(1)
      expect(sessions![0]).toHaveProperty('session_id')
      expect(sessions![0].session_id).toBe(mockBackendSession.id)
      expect(result.current.error).toBeNull()
    })

    it('should reject invalid project_id format', async () => {
      const { result } = renderHook(() => useSessions())

      let sessions
      await act(async () => {
        sessions = await result.current.fetchSessions('invalid-project-id')
      })

      expect(sessions).toEqual([])
      expect(result.current.error).toContain('Invalid project_id format')
    })

    it('should accept valid project_id format', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      const { result } = renderHook(() => useSessions())

      await act(async () => {
        await result.current.fetchSessions(validProjectId)
      })

      expect(mockFetchWithRefresh).toHaveBeenCalledWith(
        expect.stringContaining(`project_id=${validProjectId}`),
        expect.any(Object)
      )
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Error fetching sessions' })
      })

      const { result } = renderHook(() => useSessions())

      let sessions
      await act(async () => {
        sessions = await result.current.fetchSessions()
      })

      expect(sessions).toEqual([])
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('createSession()', () => {
    it('should create session successfully', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockBackendSession)
      })

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.createSession('Test Session')
      })

      expect(session).not.toBeNull()
      expect(session?.session_id).toBe(mockBackendSession.id)
      expect(result.current.error).toBeNull()
    })

    it('should reject title exceeding max length', async () => {
      const longTitle = 'a'.repeat(201)

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.createSession(longTitle)
      })

      expect(session).toBeNull()
      expect(result.current.error).toContain('200 characters')
    })

    it('should accept title at max length', async () => {
      const maxTitle = 'a'.repeat(200)

      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockBackendSession, title: maxTitle })
      })

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.createSession(maxTitle)
      })

      expect(session).not.toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should reject invalid project_id format', async () => {
      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.createSession(
          'Test',
          'invalid-project-id'
        )
      })

      expect(session).toBeNull()
      expect(result.current.error).toContain('Invalid project_id format')
    })

    it('should accept valid project_id format', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ ...mockBackendSession, project_id: validProjectId })
      })

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.createSession('Test', validProjectId)
      })

      expect(session).not.toBeNull()
      expect(session?.project_id).toBe(validProjectId)
      expect(result.current.error).toBeNull()
    })

    it('should handle API errors', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Error creating session' })
      })

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.createSession('Test')
      })

      expect(session).toBeNull()
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('updateSession()', () => {
    it('should update session successfully', async () => {
      const updatedSession = { ...mockBackendSession, title: 'Updated Title' }

      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(updatedSession)
      })

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.updateSession(mockBackendSession.id, {
          title: 'Updated Title'
        })
      })

      expect(session).not.toBeNull()
      expect(session?.title).toBe('Updated Title')
      expect(result.current.error).toBeNull()
    })

    it('should reject title exceeding max length', async () => {
      const longTitle = 'a'.repeat(201)

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.updateSession(mockBackendSession.id, {
          title: longTitle
        })
      })

      expect(session).toBeNull()
      expect(result.current.error).toContain('200 characters')
    })

    it('should accept title at max length', async () => {
      const maxTitle = 'a'.repeat(200)

      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockBackendSession, title: maxTitle })
      })

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.updateSession(mockBackendSession.id, {
          title: maxTitle
        })
      })

      expect(session).not.toBeNull()
      expect(result.current.error).toBeNull()
    })

    it('should handle API errors', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Error updating session' })
      })

      const { result } = renderHook(() => useSessions())

      let session
      await act(async () => {
        session = await result.current.updateSession(mockBackendSession.id, {
          title: 'New Title'
        })
      })

      expect(session).toBeNull()
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('deleteSession()', () => {
    it('should delete session successfully', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: true,
        status: 204
      })

      const { result } = renderHook(() => useSessions())

      let success
      await act(async () => {
        success = await result.current.deleteSession(mockBackendSession.id)
      })

      expect(success).toBe(true)
      expect(result.current.error).toBeNull()
    })

    it('should handle delete errors', async () => {
      mockFetchWithRefresh.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: 'Session not found' })
      })

      const { result } = renderHook(() => useSessions())

      let success
      await act(async () => {
        success = await result.current.deleteSession(mockBackendSession.id)
      })

      expect(success).toBe(false)
      expect(result.current.error).toBeTruthy()
    })
  })
})
