'use client'

/**
 * AnimatedButton Component
 * Button with premium hover/tap micro-interactions
 */

import React from 'react'
import { motion, HTMLMotionProps } from 'framer-motion'
import { useAnimationConfig } from '@/hooks/useAnimationConfig'
import {
  hoverScale,
  hoverLift,
  hoverGlow,
  tapScale,
  tapPress
} from '@/lib/animations/variants'
import { cn } from '@/lib/utils'

type HoverEffect = 'scale' | 'lift' | 'glow' | 'none'
type TapEffect = 'scale' | 'press' | 'none'

interface AnimatedButtonProps extends Omit<
  HTMLMotionProps<'button'>,
  'whileHover' | 'whileTap'
> {
  children: React.ReactNode
  /** Hover effect style */
  hoverEffect?: HoverEffect
  /** Tap/press effect style */
  tapEffect?: TapEffect
  /** Additional className */
  className?: string
  /** Disable animations */
  disabled?: boolean
}

const hoverEffectMap = {
  scale: hoverScale,
  lift: hoverLift,
  glow: hoverGlow,
  none: {}
}

const tapEffectMap = {
  scale: tapScale,
  press: tapPress,
  none: {}
}

export function AnimatedButton({
  children,
  hoverEffect = 'scale',
  tapEffect = 'scale',
  className,
  disabled,
  ...props
}: AnimatedButtonProps) {
  const { skipAnimation } = useAnimationConfig()

  const whileHover =
    skipAnimation || disabled ? {} : hoverEffectMap[hoverEffect]
  const whileTap = skipAnimation || disabled ? {} : tapEffectMap[tapEffect]

  return (
    <motion.button
      whileHover={whileHover}
      whileTap={whileTap}
      disabled={disabled}
      className={cn(
        'transition-colors',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default AnimatedButton
