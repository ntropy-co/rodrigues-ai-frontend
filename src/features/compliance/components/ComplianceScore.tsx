'use client'

/**
 * ComplianceScore Component
 *
 * Visual gauge component for displaying CPR compliance score (0-100)
 * with grade indicator (A, B, C, D, F) based on Lei 8.929/94 requirements.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

export type ComplianceGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface ComplianceScoreProps {
  /** Compliance score from 0 to 100 */
  score: number
  /** Grade based on score */
  grade: ComplianceGrade
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show animated entrance */
  animated?: boolean
}

// =============================================================================
// Constants
// =============================================================================

const GRADE_CONFIG: Record<
  ComplianceGrade,
  { label: string; color: string; bgColor: string; description: string }
> = {
  A: {
    label: 'Excelente',
    color: 'text-verity-600',
    bgColor: 'bg-verity-500',
    description: 'Todos os requisitos atendidos'
  },
  B: {
    label: 'Bom',
    color: 'text-verity-600',
    bgColor: 'bg-verity-500',
    description: 'Maioria dos requisitos atendidos'
  },
  C: {
    label: 'Regular',
    color: 'text-ouro-600',
    bgColor: 'bg-ouro-500',
    description: 'Requisitos parcialmente atendidos'
  },
  D: {
    label: 'Insuficiente',
    color: 'text-ouro-600',
    bgColor: 'bg-ouro-500',
    description: 'Diversos requisitos pendentes'
  },
  F: {
    label: 'Reprovado',
    color: 'text-error-600',
    bgColor: 'bg-error-500',
    description: 'Requisitos essenciais faltando'
  }
}

const SIZE_CONFIG = {
  sm: {
    container: 'h-20 w-40',
    scoreText: 'text-xl',
    gradeText: 'text-lg',
    needleHeight: '55px'
  },
  md: {
    container: 'h-24 w-48',
    scoreText: 'text-2xl',
    gradeText: 'text-xl',
    needleHeight: '70px'
  },
  lg: {
    container: 'h-32 w-64',
    scoreText: 'text-3xl',
    gradeText: 'text-2xl',
    needleHeight: '95px'
  }
}

// =============================================================================
// Component
// =============================================================================

export function ComplianceScore({
  score,
  grade,
  size = 'md',
  animated = true
}: ComplianceScoreProps) {
  // Calculate angle for the needle (-90 to 90 degrees)
  // Score 100 = best (left/green), Score 0 = worst (right/red)
  // Inverted because higher score = better compliance (should point to green)
  const angle = ((100 - score) / 100) * 180 - 90

  const gradeConfig = GRADE_CONFIG[grade]
  const sizeConfig = SIZE_CONFIG[size]

  return (
    <div className="flex flex-col items-center">
      {/* Gauge Container */}
      <div
        className={cn('relative mx-auto overflow-hidden', sizeConfig.container)}
      >
        {/* Background arc with gradient */}
        <div className="absolute inset-0">
          <svg viewBox="0 0 200 100" className="h-full w-full">
            {/* Gradient definition - green to red (left to right) */}
            <defs>
              <linearGradient
                id="complianceGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#426154" />
                <stop offset="25%" stopColor="#7A9F8F" />
                <stop offset="50%" stopColor="#BFA070" />
                <stop offset="75%" stopColor="#E53E3E" />
                <stop offset="100%" stopColor="#C53030" />
              </linearGradient>
            </defs>
            {/* Main arc */}
            <path
              d="M 10 90 A 80 80 0 0 1 190 90"
              fill="none"
              stroke="url(#complianceGradient)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const tickAngle = ((100 - tick) / 100) * Math.PI
              const x1 = 100 - 70 * Math.cos(tickAngle)
              const y1 = 90 - 70 * Math.sin(tickAngle)
              const x2 = 100 - 60 * Math.cos(tickAngle)
              const y2 = 90 - 60 * Math.sin(tickAngle)
              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#E5E5E5"
                  strokeWidth="2"
                />
              )
            })}
          </svg>
        </div>

        {/* Needle */}
        <motion.div
          className="absolute bottom-0 left-1/2 origin-bottom"
          initial={animated ? { rotate: -90 } : { rotate: angle }}
          animate={{ rotate: angle }}
          transition={{
            type: 'spring',
            stiffness: 60,
            damping: 15,
            delay: 0.2
          }}
          style={{
            width: '4px',
            height: sizeConfig.needleHeight,
            marginLeft: '-2px'
          }}
        >
          <div className="h-full w-full rounded-full bg-verity-900" />
          <div className="absolute bottom-0 left-1/2 -ml-1.5 h-3 w-3 rounded-full bg-verity-900" />
        </motion.div>

        {/* Score display */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform text-center">
          <motion.span
            className={cn(
              'font-bold tabular-nums text-verity-900',
              sizeConfig.scoreText
            )}
            initial={animated ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className="text-sm text-verity-600">/100</span>
        </div>
      </div>

      {/* Grade Badge */}
      <motion.div
        className="mt-3 flex flex-col items-center gap-1"
        initial={animated ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full font-bold text-white',
              sizeConfig.gradeText,
              gradeConfig.bgColor
            )}
          >
            {grade}
          </span>
          <span className={cn('font-semibold', gradeConfig.color)}>
            {gradeConfig.label}
          </span>
        </div>
        <p className="text-xs text-verity-500">{gradeConfig.description}</p>
      </motion.div>
    </div>
  )
}

export default ComplianceScore
