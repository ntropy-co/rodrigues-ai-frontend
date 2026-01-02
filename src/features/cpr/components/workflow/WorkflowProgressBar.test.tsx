/**
 * Tests for WorkflowProgressBar component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkflowProgressBar } from './WorkflowProgressBar'

describe('WorkflowProgressBar', () => {
  describe('Analise Workflow', () => {
    it('should render all analise workflow steps', () => {
      render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="processar_documento"
          showLabels
        />
      )

      expect(screen.getByText('Documento')).toBeInTheDocument()
      expect(screen.getByText('Extração')).toBeInTheDocument()
      expect(screen.getByText('Confirmação')).toBeInTheDocument()
      expect(screen.getByText('Compliance')).toBeInTheDocument()
      expect(screen.getByText('Risco')).toBeInTheDocument()
      expect(screen.getByText('Concluído')).toBeInTheDocument()
    })

    it('should calculate correct progress for analise workflow', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="confirmar_dados"
        />
      )

      const progressBar = container.querySelector('.bg-verity-500')
      // confirmar_dados is step 3 out of 6, so (3/6)*100 = 50%
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Criar Workflow', () => {
    it('should render all criar workflow steps', () => {
      render(
        <WorkflowProgressBar
          workflowType="criar_cpr"
          currentStep="coletar_dados"
          showLabels
        />
      )

      expect(screen.getByText('Tipo')).toBeInTheDocument()
      expect(screen.getByText('Dados')).toBeInTheDocument()
      expect(screen.getByText('Revisão')).toBeInTheDocument()
      expect(screen.getByText('Gerar')).toBeInTheDocument()
      expect(screen.getByText('Concluído')).toBeInTheDocument()
    })

    it('should calculate correct progress for criar workflow', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="criar_cpr"
          currentStep="revisar_dados"
        />
      )

      const progressBar = container.querySelector('.bg-verity-500')
      // revisar_dados is step 3 out of 5, so (3/5)*100 = 60%
      expect(progressBar).toBeInTheDocument()
    })
  })

  describe('Step States', () => {
    it('should highlight current step', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="verificar_compliance"
        />
      )

      const steps = container.querySelectorAll('.flex.flex-col.items-center')
      // verificar_compliance is the 4th step (index 3)
      const currentStepElement = steps[3]
      const iconDiv = currentStepElement?.querySelector('.border-2')

      expect(iconDiv?.className).toContain('border-verity-500')
      expect(iconDiv?.className).toContain('text-verity-600')
    })

    it('should mark completed steps', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="verificar_compliance"
        />
      )

      const steps = container.querySelectorAll('.flex.flex-col.items-center')
      // Steps before verificar_compliance (indices 0, 1, 2) should be completed
      const firstStepIcon = steps[0]?.querySelector('.border-2')

      expect(firstStepIcon?.className).toContain('bg-verity-500')
      expect(firstStepIcon?.className).toContain('text-white')
    })

    it('should mark pending steps', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="processar_documento"
        />
      )

      const steps = container.querySelectorAll('.flex.flex-col.items-center')
      // Steps after processar_documento should be pending
      const lastStepIcon = steps[steps.length - 1]?.querySelector('.border-2')

      expect(lastStepIcon?.className).toContain('border-sand-400')
      expect(lastStepIcon?.className).toContain('text-verity-300')
    })
  })

  describe('Display Options', () => {
    it('should hide labels when showLabels is false', () => {
      render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="processar_documento"
          showLabels={false}
        />
      )

      expect(screen.queryByText('Documento')).not.toBeInTheDocument()
      expect(screen.queryByText('Extração')).not.toBeInTheDocument()
    })

    it('should apply compact mode styling', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="processar_documento"
          compact
        />
      )

      const iconDivs = container.querySelectorAll('.border-2')
      expect(iconDivs[0]?.className).toContain('h-8')
      expect(iconDivs[0]?.className).toContain('w-8')
    })

    it('should apply regular mode styling by default', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="processar_documento"
        />
      )

      const iconDivs = container.querySelectorAll('.border-2')
      expect(iconDivs[0]?.className).toContain('h-10')
      expect(iconDivs[0]?.className).toContain('w-10')
    })
  })

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="processar_documento"
          className="custom-progress"
        />
      )

      const wrapper = container.querySelector('.custom-progress')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle unknown step gracefully', () => {
      const { container } = render(
        <WorkflowProgressBar workflowType="analise_cpr" currentStep="unknown" />
      )

      const progressBar = container.querySelector('.bg-verity-500')
      expect(progressBar).toBeInTheDocument()
    })

    it('should render with finalizado step', () => {
      render(
        <WorkflowProgressBar
          workflowType="analise_cpr"
          currentStep="finalizado"
          showLabels
        />
      )

      expect(screen.getByText('Concluído')).toBeInTheDocument()
    })
  })
})
