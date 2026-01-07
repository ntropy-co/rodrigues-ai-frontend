'use client'

/**
 * WorkflowStatusBadge Component
 *
 * Displays workflow status with appropriate styling and icon.
 * Supports different sizes and animated state changes.
 *
 * Usage:
 * ```tsx
 * <WorkflowStatusBadge
 *   state="running"
 *   currentStep="processar_documento"
 *   size="md"
 *   animated
 * />
 * ```
 */

import { motion } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Clock, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowState, WorkflowStep } from '@/hooks/useCPRWorkflowStatus'

// =============================================================================
// Types
// =============================================================================

export interface WorkflowStatusBadgeProps {
  /** Current workflow state */
  state: WorkflowState
  /** Current workflow step */
  currentStep?: WorkflowStep
  /** Badge size */
  size?: 'sm' | 'md' | 'lg'
  /** Show animated entrance */
  animated?: boolean
  /** Additional class names */
  className?: string
}

// =============================================================================
// Configuration
// =============================================================================

const STATE_CONFIG: Record<
  WorkflowState,
  {
    label: string
    icon: typeof Circle
    color: string
    bgColor: string
    borderColor: string
  }
> = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300'
  },
  running: {
    label: 'Aguardando',
    icon: Circle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-300'
  },
  processing: {
    label: 'Processando',
    icon: Loader2,
    color: 'text-verity-600',
    bgColor: 'bg-verity-100',
    borderColor: 'border-verity-300'
  },
  completed: {
    label: 'Concluído',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-300'
  },
  failed: {
    label: 'Erro',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300'
  },
  unknown: {
    label: 'Desconhecido',
    icon: Circle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300'
  }
}

const SIZE_CONFIG = {
  sm: {
    container: 'px-2 py-1 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1'
  },
  md: {
    container: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-1.5'
  },
  lg: {
    container: 'px-4 py-2 text-base',
    icon: 'h-5 w-5',
    gap: 'gap-2'
  }
}

const STEP_LABELS: Record<WorkflowStep, string> = {
  inicio: 'Iniciando',
  solicitar_documento: 'Solicitando documento',
  processar_documento: 'Processando documento',
  confirmar_dados: 'Confirmando dados',
  verificar_compliance: 'Verificando compliance',
  calcular_risco: 'Calculando risco',
  finalizado: 'Finalizado',
  selecionar_tipo: 'Selecionando tipo',
  coletar_dados: 'Coletando dados',
  revisar_dados: 'Revisando dados',
  gerar_documento: 'Gerando documento',
  unknown: 'Processando'
}

// =============================================================================
// Component
// =============================================================================

export function WorkflowStatusBadge({
  state,
  currentStep,
  size = 'md',
  animated = true,
  className
}: WorkflowStatusBadgeProps) {
  const config = STATE_CONFIG[state]
  const sizeConfig = SIZE_CONFIG[size]
  const Icon = config.icon

  const isProcessing = state === 'processing'

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.9 } : undefined}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        sizeConfig.container,
        sizeConfig.gap,
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <Icon className={cn(sizeConfig.icon, isProcessing && 'animate-spin')} />
      <span>
        {currentStep && state === 'processing'
          ? STEP_LABELS[currentStep]
          : config.label}
      </span>
    </motion.div>
  )
}

export default WorkflowStatusBadge
