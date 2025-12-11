'use client'

/**
 * useScrollAnimation Hook
 * Trigger animations when elements enter the viewport
 */

import { useRef } from 'react'
import { useInView } from 'framer-motion'

interface UseScrollAnimationOptions {
  /** Only trigger once (default: true) */
  once?: boolean
  /** Percentage of element visible to trigger (default: 0.3 = 30%) */
  amount?: 'some' | 'all' | number
  /** Margin around viewport (default: triggers 100px before) */
  margin?: string
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { once = true, amount = 0.3, margin = '0px 0px -100px 0px' } = options

  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    once,
    amount,
    margin: margin as `${number}px ${number}px ${number}px ${number}px`
  })

  return { ref, isInView }
}

export default useScrollAnimation
