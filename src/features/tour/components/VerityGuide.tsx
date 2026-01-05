'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTour } from '@/contexts/TourContext'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

// =============================================================================
// Verity Avatar (The "Soul")
// =============================================================================

function VerityAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      {/* Core */}
      <div className="relative z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-verity-800 to-verity-900 shadow-lg ring-1 ring-white/20">
        <span className="font-display text-xl font-bold text-white">V</span>
      </div>

      {/* Pulse Effect (Speaking) */}
      <AnimatePresence>
        {isSpeaking && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.5 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute inset-0 z-10 rounded-full bg-verity-400/30 blur-md"
            />
            <motion.div
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 1.2, opacity: 0 }}
              exit={{ scale: 1, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeOut' }}
              className="absolute inset-0 z-0 rounded-full bg-verity-500/20"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// =============================================================================
// Glass Bubble ( The "Voice")
// =============================================================================

function GlassBubble({
  title,
  message,
  onNext,
  onDismiss,
  actionLabel,
  isLastStep
}: {
  title: string
  message: string
  onNext: () => void
  onDismiss: () => void
  actionLabel?: string
  isLastStep: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="relative w-80 overflow-hidden rounded-2xl border border-white/40 bg-white/10 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40"
    >
      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-full p-1 text-verity-600 transition-colors hover:bg-black/5 hover:text-verity-900 dark:text-verity-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="mb-4">
        <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold text-verity-950 dark:text-white">
          {title}
          <Sparkles className="h-4 w-4 text-ouro-400" />
        </h3>
        <p className="text-sm leading-relaxed text-verity-700 dark:text-verity-200">
          {message}
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-1">{/* Dots Indicator could go here */}</div>
        <Button
          onClick={onNext}
          size="sm"
          className="bg-verity-800 text-white hover:bg-verity-900 dark:bg-verity-100 dark:text-verity-950"
        >
          {actionLabel || (isLastStep ? 'Concluir' : 'Próximo')}
          {!isLastStep && <ArrowRight className="ml-2 h-3 w-3" />}
        </Button>
      </div>
    </motion.div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function VerityGuide() {
  const { isActive, steps, currentStepIndex, nextStep, endTour } = useTour()

  // Floating positioning logic would go here if using @floating-ui
  // For now, fixed position (bottom-right or center) for simplicity + robustness

  if (!isActive) return null

  const currentStep = steps[currentStepIndex]
  const isLastStep = currentStepIndex === steps.length - 1

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-end justify-end p-6 sm:p-10">
      <div className="pointer-events-auto flex flex-col items-end gap-4">
        {/* Bubble */}
        <AnimatePresence mode="wait">
          <GlassBubble
            key={currentStep.id} // Triggers animation on step change
            title={currentStep.title}
            message={currentStep.message}
            onNext={nextStep}
            onDismiss={endTour}
            actionLabel={currentStep.actionLabel}
            isLastStep={isLastStep}
          />
        </AnimatePresence>

        {/* Avatar */}
        <VerityAvatar isSpeaking={true} />
      </div>
    </div>
  )
}
