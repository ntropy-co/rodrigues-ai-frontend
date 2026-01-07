'use client'

/**
 * WorkflowProgressBar Component
 *
 * Visual progress indicator for CPR workflows.
 * Shows step progression and current position in the workflow.
 *
 * Usage:
 * ```tsx
 * <WorkflowProgressBar
 *   workflowType="analise_cpr"
 *   currentStep="verificar_compliance"
 *   showLabels
 * />
 * ```
 */

import { motion } from 'framer-motion'
import {
  Upload,
  FileSearch,
  CheckSquare,
  Shield,
  Calculator,
  CheckCircle,
  FileText,
  Users,
  Settings,
  FileCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowType, WorkflowStep } from '@/hooks/useCPRWorkflowStatus'

// =============================================================================
// Types
// =============================================================================

export interface WorkflowProgressBarProps {
  /** Workflow type */
  workflowType: WorkflowType
  /** Current step */
  currentStep: WorkflowStep
  /** Show step labels */
  showLabels?: boolean
  /** Compact mode (smaller) */
  compact?: boolean
  /** Additional class names */
  className?: string
}

interface StepConfig {
  id: WorkflowStep
  label: string
  icon: typeof Upload
}

// =============================================================================
// Configuration
// =============================================================================

const ANALISE_STEPS: StepConfig[] = [
  {
    id: 'solicitar_documento',
    label: 'Documento',
    icon: Upload
  },
  {
    id: 'processar_documento',
    label: 'Extração',
    icon: FileSearch
  },
  {
    id: 'confirmar_dados',
    label: 'Confirmação',
    icon: CheckSquare
  },
  {
    id: 'verificar_compliance',
    label: 'Compliance',
    icon: Shield
  },
  {
    id: 'calcular_risco',
    label: 'Risco',
    icon: Calculator
  },
  {
    id: 'finalizado',
    label: 'Concluído',
    icon: CheckCircle
  }
]

const CRIAR_STEPS: StepConfig[] = [
  {
    id: 'selecionar_tipo',
    label: 'Tipo',
    icon: FileText
  },
  {
    id: 'coletar_dados',
    label: 'Dados',
    icon: Users
  },
  {
    id: 'revisar_dados',
    label: 'Revisão',
    icon: Settings
  },
  {
    id: 'gerar_documento',
    label: 'Gerar',
    icon: FileCheck
  },
  {
    id: 'finalizado',
    label: 'Concluído',
    icon: CheckCircle
  }
]

// =============================================================================
// Component
// =============================================================================

export function WorkflowProgressBar({
  workflowType,
  currentStep,
  showLabels = true,
  compact = false,
  className
}: WorkflowProgressBarProps) {
  const steps = workflowType === 'analise_cpr' ? ANALISE_STEPS : CRIAR_STEPS

  // Find current step index
  const currentIndex = steps.findIndex((step) => step.id === currentStep)
  const progress =
    currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* Progress bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full bg-verity-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isPending = index > currentIndex

          const Icon = step.icon

          return (
            <div
              key={step.id}
              className={cn(
                'flex flex-col items-center',
                compact ? 'gap-1' : 'gap-2',
                'flex-1'
              )}
            >
              {/* Icon */}
              <motion.div
                className={cn(
                  'flex items-center justify-center rounded-full border-2',
                  compact ? 'h-8 w-8' : 'h-10 w-10',
                  isCompleted && 'border-verity-500 bg-verity-500 text-white',
                  isCurrent && 'border-verity-500 bg-white text-verity-600',
                  isPending && 'border-gray-300 bg-white text-gray-400'
                )}
                animate={{
                  scale: isCurrent ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 1,
                  repeat: isCurrent ? Infinity : 0,
                  repeatDelay: 0.5
                }}
              >
                <Icon className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
              </motion.div>

              {/* Label */}
              {showLabels && (
                <span
                  className={cn(
                    'text-center font-medium',
                    compact ? 'text-xs' : 'text-sm',
                    isCompleted && 'text-verity-700',
                    isCurrent && 'text-verity-900',
                    isPending && 'text-gray-500'
                  )}
                >
                  {step.label}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorkflowProgressBar
