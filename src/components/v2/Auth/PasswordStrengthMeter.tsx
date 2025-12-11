'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PasswordStrengthMeterProps {
  strength: 'weak' | 'medium' | 'strong'
}

function getPasswordStrengthColor(
  strength: 'weak' | 'medium' | 'strong'
): string {
  switch (strength) {
    case 'weak':
      return 'text-red-500'
    case 'medium':
      return 'text-yellow-500'
    case 'strong':
      return 'text-green-500'
  }
}

export function PasswordStrengthMeter({
  strength
}: PasswordStrengthMeterProps) {
  // Map strength to width percentage and index
  const getStrengthState = (s: 'weak' | 'medium' | 'strong') => {
    switch (s) {
      case 'weak':
        return { width: 33, index: 1, label: 'Fraca' }
      case 'medium':
        return { width: 66, index: 2, label: 'Média' }
      case 'strong':
        return { width: 100, index: 3, label: 'Forte' }
    }
  }

  const state = getStrengthState(strength)
  const colorClass = getPasswordStrengthColor(strength).replace('text-', 'bg-')

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex h-1 gap-1.5">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex-1 overflow-hidden rounded-full bg-verde-100"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: index <= state.index ? '100%' : '0%'
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={cn(
                'h-full w-full',
                index <= state.index ? colorClass : 'transparent'
              )}
            />
          </div>
        ))}
      </div>
      <motion.p
        key={strength}
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'text-right text-xs font-medium',
          getPasswordStrengthColor(strength)
        )}
      >
        {state.label}
      </motion.p>
    </div>
  )
}
