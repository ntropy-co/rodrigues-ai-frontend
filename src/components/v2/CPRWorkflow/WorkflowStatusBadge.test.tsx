/**
 * Tests for WorkflowStatusBadge component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkflowStatusBadge } from './WorkflowStatusBadge'

describe('WorkflowStatusBadge', () => {
  describe('State Display', () => {
    it('should render pending state correctly', () => {
      render(<WorkflowStatusBadge state="pending" />)
      expect(screen.getByText('Pendente')).toBeInTheDocument()
    })

    it('should render running state correctly', () => {
      render(<WorkflowStatusBadge state="running" />)
      expect(screen.getByText('Aguardando')).toBeInTheDocument()
    })

    it('should render processing state correctly', () => {
      render(<WorkflowStatusBadge state="processing" />)
      expect(screen.getByText('Processando')).toBeInTheDocument()
    })

    it('should render completed state correctly', () => {
      render(<WorkflowStatusBadge state="completed" />)
      expect(screen.getByText('Concluído')).toBeInTheDocument()
    })

    it('should render failed state correctly', () => {
      render(<WorkflowStatusBadge state="failed" />)
      expect(screen.getByText('Erro')).toBeInTheDocument()
    })

    it('should render unknown state correctly', () => {
      render(<WorkflowStatusBadge state="unknown" />)
      expect(screen.getByText('Desconhecido')).toBeInTheDocument()
    })
  })

  describe('Step Labels', () => {
    it('should show step label when processing', () => {
      render(
        <WorkflowStatusBadge
          state="processing"
          currentStep="processar_documento"
        />
      )
      expect(screen.getByText('Processando documento')).toBeInTheDocument()
    })

    it('should show step label for verificar_compliance', () => {
      render(
        <WorkflowStatusBadge
          state="processing"
          currentStep="verificar_compliance"
        />
      )
      expect(screen.getByText('Verificando compliance')).toBeInTheDocument()
    })

    it('should not override label for non-processing states', () => {
      render(
        <WorkflowStatusBadge
          state="completed"
          currentStep="processar_documento"
        />
      )
      expect(screen.getByText('Concluído')).toBeInTheDocument()
      expect(
        screen.queryByText('Processando documento')
      ).not.toBeInTheDocument()
    })
  })

  describe('Sizes', () => {
    it('should apply small size classes', () => {
      const { container } = render(
        <WorkflowStatusBadge state="processing" size="sm" />
      )
      const badge = container.querySelector('div')
      expect(badge?.className).toContain('text-xs')
    })

    it('should apply medium size classes (default)', () => {
      const { container } = render(<WorkflowStatusBadge state="processing" />)
      const badge = container.querySelector('div')
      expect(badge?.className).toContain('text-sm')
    })

    it('should apply large size classes', () => {
      const { container } = render(
        <WorkflowStatusBadge state="processing" size="lg" />
      )
      const badge = container.querySelector('div')
      expect(badge?.className).toContain('text-base')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <WorkflowStatusBadge state="processing" className="custom-class" />
      )
      const badge = container.querySelector('div')
      expect(badge?.className).toContain('custom-class')
    })

    it('should apply state-specific colors', () => {
      const { container } = render(<WorkflowStatusBadge state="completed" />)
      const badge = container.querySelector('div')
      expect(badge?.className).toContain('text-green-600')
      expect(badge?.className).toContain('bg-green-100')
    })
  })

  describe('Animation', () => {
    it('should render without animation when animated is false', () => {
      const { container } = render(
        <WorkflowStatusBadge state="processing" animated={false} />
      )
      const badge = container.querySelector('div')
      expect(badge).toBeInTheDocument()
    })

    it('should apply spinning animation to processing state icon', () => {
      const { container } = render(<WorkflowStatusBadge state="processing" />)
      const icon = container.querySelector('svg')
      // Check for animate-spin class on the svg or its wrapper
      const hasSpinClass =
        icon?.classList.contains('animate-spin') ||
        icon?.parentElement?.classList.contains('animate-spin')
      expect(hasSpinClass).toBe(true)
    })

    it('should not apply spinning animation to completed state', () => {
      const { container } = render(<WorkflowStatusBadge state="completed" />)
      const icon = container.querySelector('svg')
      // Check that neither svg nor wrapper has animate-spin
      const hasSpinClass =
        icon?.classList.contains('animate-spin') ||
        icon?.parentElement?.classList.contains('animate-spin')
      expect(hasSpinClass).toBe(false)
    })
  })
})
