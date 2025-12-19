'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, FileText, Brain, PenLine, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export type AgentState =
  | 'thinking'
  | 'searching'
  | 'analyzing'
  | 'summarizing'
  | 'typing'

interface AgentStateIndicatorProps {
  initialState?: AgentState
  onStateChange?: (state: AgentState) => void
}

const STATE_CONFIG = {
  thinking: {
    icon: Brain,
    label: 'Pensando na resposta...',
    color: 'text-verde-600',
    bg: 'bg-verde-100'
  },
  analyzing: {
    icon: Search,
    label: 'Analisando dados...',
    color: 'text-ouro-600',
    bg: 'bg-ouro-100' // Assuming ouro exists, else fallback to warm color
  },
  summarizing: {
    icon: FileText,
    label: 'Resumindo informações...',
    color: 'text-verde-700',
    bg: 'bg-verde-200'
  },
  typing: {
    icon: PenLine,
    label: 'Digitando...',
    color: 'text-verde-500',
    bg: 'bg-verde-50'
  },
  searching: {
    icon: Database,
    label: 'Buscando na base de conhecimento...',
    color: 'text-blue-600',
    bg: 'bg-blue-100'
  }
}

export function AgentStateIndicator({
  initialState = 'thinking',
  onStateChange
}: AgentStateIndicatorProps) {
  const [currentState, setCurrentState] = useState<AgentState>(initialState)
  const prefersReducedMotion = useReducedMotion()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Simulate sequence with proper cleanup
  useEffect(() => {
    const sequence: { state: AgentState; duration: number }[] = [
      { state: 'thinking', duration: 1500 },
      { state: 'searching', duration: 1800 },
      { state: 'analyzing', duration: 2000 },
      { state: 'summarizing', duration: 1200 },
      { state: 'typing', duration: 8000 } // Remains indefinitely usually until replaced
    ]

    let currentIndex = 0

    // Find start index if initial state provided
    const startIdx = sequence.findIndex((s) => s.state === initialState)
    if (startIdx !== -1) currentIndex = startIdx

    const runSequence = () => {
      if (currentIndex >= sequence.length - 1) return // Stop at last state

      const nextStep = sequence[currentIndex + 1]
      const currentStep = sequence[currentIndex]

      timeoutRef.current = setTimeout(() => {
        setCurrentState(nextStep.state)
        onStateChange?.(nextStep.state)
        currentIndex++
        runSequence()
      }, currentStep.duration)
    }

    runSequence()

    // Proper cleanup to prevent memory leaks
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const config = STATE_CONFIG[currentState]
  const Icon = config.icon

  return (
    <div className="flex items-center gap-3">
      {/* Icon Container with Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentState}
          initial={
            prefersReducedMotion
              ? { opacity: 0 }
              : { scale: 0.8, opacity: 0, rotateX: -90 }
          }
          animate={
            prefersReducedMotion
              ? { opacity: 1 }
              : { scale: 1, opacity: 1, rotateX: 0 }
          }
          exit={
            prefersReducedMotion
              ? { opacity: 0 }
              : { scale: 0.8, opacity: 0, rotateX: 90 }
          }
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.3 }}
          className={cn(
            'relative flex h-8 w-8 items-center justify-center rounded-xl shadow-sm',
            config.bg
          )}
        >
          <Icon className={cn('h-4 w-4', config.color)} />

          {/* Animated Ring/Glow - disabled for reduced motion */}
          {!prefersReducedMotion && (
            <motion.div
              className={cn(
                'absolute inset-0 rounded-xl opacity-50',
                config.bg
              )}
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ willChange: 'transform, opacity' }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Label with Typing Effect */}
      <div className="flex flex-col">
        <span className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-verde-400">
          Verity AI
        </span>
        <motion.span
          key={config.label}
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }
          }
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
          className={cn('text-sm font-medium', config.color)}
        >
          {config.label}
        </motion.span>
      </div>
    </div>
  )
}
