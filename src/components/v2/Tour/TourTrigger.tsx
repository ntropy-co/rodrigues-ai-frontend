'use client'

import React from 'react'
import { HelpCircle } from 'lucide-react'
import { useTour, TourStep } from '@/contexts/TourContext'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TourTriggerProps {
  tourId: string
  steps: TourStep[]
  className?: string
  variant?: 'icon' | 'button'
}

export function TourTrigger({
  tourId,
  steps,
  className,
  variant = 'icon'
}: TourTriggerProps) {
  const { startTour } = useTour()

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => startTour(tourId, steps)}
      className={cn(
        'group relative inline-flex items-center justify-center transition-colors',
        variant === 'icon'
          ? 'h-8 w-8 rounded-full text-verity-400 hover:bg-verity-50 hover:text-verity-600'
          : 'rounded-lg bg-verity-100 px-3 py-1.5 text-xs font-medium text-verity-700 hover:bg-verity-200',
        className
      )}
      title="Ajuda Interativa"
    >
      <HelpCircle
        className={cn(
          'transition-transform group-hover:rotate-12',
          variant === 'icon' ? 'h-5 w-5' : 'mr-2 h-4 w-4'
        )}
      />
      {variant === 'button' && 'Como funciona?'}

      {/* Pulse effect to draw attention if never clicked (advanced logic could go here) */}
    </motion.button>
  )
}
