/**
 * Tests for useCPRCreation hook (draft-based)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCPRCreation } from './useCPRCreation'

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

const mockDraftResponse = {
  draft_id: 'draft-123',
  status: 'draft',
  wizard_data: {
    producer: { name: 'Maria' }
  },
  current_step: 1,
  version: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
}

const mockDraftUpdateResponse = {
  ...mockDraftResponse,
  current_step: 2,
  version: 2
}

const mockSubmitResponse = {
  draft: {
    ...mockDraftResponse,
    status: 'submitted',
    version: 3
  },
  workflow: {
    session_id: 'session-456',
    workflow_type: 'criar_cpr',
    current_step: 'finalizado',
    is_waiting_input: false,
    document_url: 'https://storage.example.com/cpr-123.pdf'
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
    it('should start with null draft and no errors', () => {
      const { result } = renderHook(() => useCPRCreation())

      expect(result.current.draft).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isSaving).toBe(false)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useCPRCreation())

      expect(typeof result.current.createDraft).toBe('function')
      expect(typeof result.current.loadDraft).toBe('function')
      expect(typeof result.current.updateDraft).toBe('function')
      expect(typeof result.current.submitDraft).toBe('function')
      expect(typeof result.current.reset).toBe('function')
    })
  })

  describe('createDraft()', () => {
    it('should call API with correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDraftResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.createDraft()
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/cpr/drafts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ current_step: 1 })
      })
    })

    it('should update draft on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDraftResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.createDraft()
      })

      expect(result.current.draft?.draftId).toBe('draft-123')
      expect(result.current.draft?.currentStep).toBe(1)
    })

    it('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Invalid data' })
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.createDraft()
      })

      expect(result.current.error).toBe('Invalid data')
      expect(result.current.draft).toBeNull()
    })
  })

  describe('loadDraft()', () => {
    it('should fetch and load draft by id', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDraftResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.loadDraft('draft-123')
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/cpr/drafts/draft-123', {
        method: 'GET',
        credentials: 'include'
      })
      expect(result.current.draft?.draftId).toBe('draft-123')
    })
  })

  describe('updateDraft()', () => {
    it('should call API with patch payload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDraftUpdateResponse)
      })

      const { result } = renderHook(() => useCPRCreation())
      const wizardData = { producer: { name: 'Maria' } }

      await act(async () => {
        await result.current.updateDraft('draft-123', wizardData, 2, 1)
      })

      expect(mockFetch).toHaveBeenCalledWith('/api/cpr/drafts/draft-123', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          wizard_data: wizardData,
          current_step: 2,
          version: 1
        })
      })
      expect(result.current.draft?.version).toBe(2)
    })
  })

  describe('submitDraft()', () => {
    it('should submit draft and return workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSubmitResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      let response: {
        draft?: unknown
        workflow?: { documentUrl?: string }
      } | null = null
      await act(async () => {
        response = await result.current.submitDraft('draft-123')
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cpr/drafts/draft-123/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ confirm: true })
        }
      )
      expect(
        (response as { workflow?: { documentUrl?: string } } | null)?.workflow
          ?.documentUrl
      ).toBe('https://storage.example.com/cpr-123.pdf')
      expect(result.current.draft?.documentUrl).toBe(
        'https://storage.example.com/cpr-123.pdf'
      )
    })
  })

  describe('reset()', () => {
    it('should clear state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDraftResponse)
      })

      const { result } = renderHook(() => useCPRCreation())

      await act(async () => {
        await result.current.createDraft()
      })

      expect(result.current.draft).not.toBeNull()

      act(() => {
        result.current.reset()
      })

      expect(result.current.draft).toBeNull()
      expect(result.current.error).toBeNull()
    })
  })
})
