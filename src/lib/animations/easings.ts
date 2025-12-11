/**
 * Premium Easing Curves
 * Sophisticated motion curves for Verity Agro enterprise UI
 */

import type { Transition } from 'framer-motion'

// ============================================================================
// CUBIC BEZIER EASINGS
// ============================================================================

export const easings = {
  /** Suave and natural - default for most animations */
  smooth: [0.43, 0.13, 0.23, 0.96] as const,

  /** Ultra smooth - for subtle UI elements */
  butter: [0.25, 0.46, 0.45, 0.94] as const,

  /** Silk-like movement - for elegant entrances */
  silk: [0.16, 1, 0.3, 1] as const,

  /** Sharp entrance - for attention-grabbing elements */
  sharp: [0.4, 0, 0.2, 1] as const,

  /** Decelerate - fast start, slow end */
  decelerate: [0, 0, 0.2, 1] as const,

  /** Accelerate - slow start, fast end */
  accelerate: [0.4, 0, 1, 1] as const
} as const

// ============================================================================
// SPRING CONFIGURATIONS
// ============================================================================

export const springs = {
  /** Gentle spring - subtle bounce */
  gentle: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 0.8
  } as const,

  /** Soft bounce - noticeable but refined */
  softBounce: {
    type: 'spring',
    stiffness: 300,
    damping: 20
  } as const,

  /** Snappy - quick and responsive */
  snappy: {
    type: 'spring',
    stiffness: 400,
    damping: 25,
    mass: 0.5
  } as const,

  /** Wobbly - playful, use sparingly */
  wobbly: {
    type: 'spring',
    stiffness: 180,
    damping: 12
  } as const
} as const

// ============================================================================
// STANDARDIZED DURATIONS (seconds)
// ============================================================================

export const durations = {
  /** Instant - 150ms - micro-interactions */
  instant: 0.15,

  /** Fast - 300ms - hovers, button presses */
  fast: 0.3,

  /** Normal - 500ms - standard transitions */
  normal: 0.5,

  /** Slow - 800ms - page entrances */
  slow: 0.8,

  /** Very slow - 1200ms - luxury entrances */
  verySlow: 1.2
} as const

// ============================================================================
// STAGGER DELAYS
// ============================================================================

export const staggerDelays = {
  /** Fast stagger - 50ms between items */
  fast: 0.05,

  /** Normal stagger - 100ms between items */
  normal: 0.1,

  /** Slow stagger - 150ms between items */
  slow: 0.15
} as const

// ============================================================================
// PRESET TRANSITIONS
// ============================================================================

export const transitions = {
  /** Default smooth transition */
  smooth: {
    duration: durations.normal,
    ease: easings.smooth
  } as Transition,

  /** Fast hover transition */
  hover: {
    duration: durations.fast,
    ease: easings.butter
  } as Transition,

  /** Instant tap transition */
  tap: {
    duration: durations.instant,
    ease: easings.smooth
  } as Transition,

  /** Luxury entrance transition */
  luxury: {
    duration: durations.verySlow,
    ease: easings.butter
  } as Transition,

  /** Page entrance */
  page: {
    duration: durations.slow,
    ease: easings.silk
  } as Transition
} as const

export type EasingName = keyof typeof easings
export type SpringName = keyof typeof springs
export type DurationName = keyof typeof durations
