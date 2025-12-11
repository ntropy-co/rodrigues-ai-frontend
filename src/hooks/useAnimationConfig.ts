'use client'

/**
 * useAnimationConfig Hook
 * Respects user's reduced motion preferences for accessibility
 */

import { useReducedMotion } from 'framer-motion'
import { durations, easings } from '@/lib/animations/easings'

interface AnimationConfig {
  /** Duration to use (0 if reduced motion) */
  duration: number
  /** Easing to use ('linear' if reduced motion) */
  ease: readonly number[] | 'linear'
  /** Whether to skip all animations */
  skipAnimation: boolean
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean
}

export function useAnimationConfig(): AnimationConfig {
  const prefersReducedMotion = useReducedMotion() ?? false

  return {
    duration: prefersReducedMotion ? 0 : durations.normal,
    ease: prefersReducedMotion ? 'linear' : easings.butter,
    skipAnimation: prefersReducedMotion,
    prefersReducedMotion
  }
}

/**
 * Returns animation props that respect reduced motion
 */
export function useAccessibleAnimation<T extends object>(
  animation: T
): T | Record<string, never> {
  const { skipAnimation } = useAnimationConfig()
  return skipAnimation ? {} : animation
}

export default useAnimationConfig
