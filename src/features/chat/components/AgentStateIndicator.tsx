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
    label: 'Consultando C.P.R. Intel...',
    color: 'text-ouro-700',
    bg: 'bg-ouro-50 border-ouro-100/50'
  },
  searching: {
    icon: Database,
    label: 'Buscando na legislação...',
    color: 'text-verity-700',
    bg: 'bg-verity-50 border-verity-100/50'
  },
  analyzing: {
    icon: Search,
    label: 'Analisando conformidade...',
    color: 'text-ouro-700',
    bg: 'bg-ouro-50 border-ouro-100/50'
  },
  summarizing: {
    icon: FileText,
    label: 'Redigindo resposta...',
    color: 'text-verity-700',
    bg: 'bg-verity-50 border-verity-100/50'
  },
  typing: {
    icon: PenLine,
    label: 'Finalizando...',
    color: 'text-verity-600',
    bg: 'bg-transparent border-transparent'
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
    // Total sequence ~4.5s to match typical RAG + Generation latency
    const sequence: { state: AgentState; duration: number }[] = [
      { state: 'thinking', duration: 800 },
      { state: 'searching', duration: 1200 },
      { state: 'analyzing', duration: 1500 },
      { state: 'summarizing', duration: 1000 },
      { state: 'typing', duration: 8000 }
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
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 20,
            mass: 1,
            duration: 0.5
          }}
          className={cn(
            'relative flex h-8 w-8 items-center justify-center rounded-xl border shadow-sm backdrop-blur-sm',
            config.bg
          )}
        >
          <Icon className={cn('h-4 w-4', config.color)} />

          {/* Animated Ring/Glow - Premium Pulse */}
          {!prefersReducedMotion && (
            <motion.div
              className={cn(
                'absolute inset-0 rounded-xl opacity-30',
                config.bg
              )}
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(0,0,0,0)',
                  '0 0 0 4px rgba(0,0,0,0.05)',
                  '0 0 0 8px rgba(0,0,0,0)'
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Label with Typing Effect */}
      <div className="flex flex-col">
        <span className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-verity-400">
          Verity AI
        </span>
        <motion.span
          key={config.label}
          initial={
            prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -10 }
          }
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25
          }}
          className={cn('text-sm font-medium', config.color)}
        >
          {config.label}
        </motion.span>
      </div>
    </div>
  )
}
