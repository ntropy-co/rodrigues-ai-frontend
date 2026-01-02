/**
 * Tests for WorkflowStatusPanel component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkflowStatusPanel } from './WorkflowStatusPanel'

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

const mockAnaliseStatus = {
  text: 'Processando documento...',
  session_id: 'session-123',
  workflow_type: 'analise_cpr',
  is_waiting_input: false,
  current_step: 'processar_documento',
  extracted_data: {
    emitente: 'João Silva',
    produto: 'Soja'
  }
}

// =============================================================================
// Tests
// =============================================================================

describe('WorkflowStatusPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should not render when sessionId is null', () => {
      const { container } = render(
        <WorkflowStatusPanel
          sessionId={null}
          workflowType="analise_cpr"
          autoStart={false}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('should render panel with title for analise workflow', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAnaliseStatus
      })

      render(
        <WorkflowStatusPanel
          sessionId="session-123"
          workflowType="analise_cpr"
          autoStart={false}
        />
      )

      expect(screen.getByText('Análise de CPR')).toBeInTheDocument()
    })

    it('should render panel with title for criar workflow', () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockAnaliseStatus
      })

      render(
        <WorkflowStatusPanel
          sessionId="session-456"
          workflowType="criar_cpr"
          autoStart={false}
        />
      )

      expect(screen.getByText('Criação de CPR')).toBeInTheDocument()
    })
  })

  describe('Refresh Button', () => {
    it('should show refresh button by default', () => {
      render(
        <WorkflowStatusPanel
          sessionId="session-123"
          workflowType="analise_cpr"
          autoStart={false}
        />
      )

      const refreshButton = screen.getByRole('button')
      expect(refreshButton).toBeInTheDocument()
    })

    it('should hide refresh button when showRefreshButton is false', () => {
      render(
        <WorkflowStatusPanel
          sessionId="session-123"
          workflowType="analise_cpr"
          autoStart={false}
          showRefreshButton={false}
        />
      )

      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBe(0)
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <WorkflowStatusPanel
          sessionId="session-123"
          workflowType="analise_cpr"
          autoStart={false}
          className="custom-panel"
        />
      )

      expect(container.querySelector('.custom-panel')).toBeInTheDocument()
    })
  })
})
