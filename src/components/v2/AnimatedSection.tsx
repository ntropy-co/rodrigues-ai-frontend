'use client'

/**
 * AnimatedSection Component
 * Wrapper that animates children when they enter the viewport
 */

import React from 'react'
import { motion, Variants } from 'framer-motion'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'
import { useAnimationConfig } from '@/hooks/useAnimationConfig'
import {
  fadeVariants,
  slideVariants,
  scaleVariants,
  blurVariants,
  luxuryVariants,
  staggerContainer
} from '@/lib/animations/variants'

type AnimationVariant =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'blur'
  | 'luxury'

interface AnimatedSectionProps {
  children: React.ReactNode
  /** Animation variant to use */
  variant?: AnimationVariant
  /** Additional delay before animation starts (seconds) */
  delay?: number
  /** Use stagger animation for children */
  stagger?: boolean
  /** Custom className */
  className?: string
  /** Element tag to render */
  as?: 'div' | 'section' | 'article' | 'main' | 'aside'
  /** Only animate once */
  once?: boolean
}

const variantMap: Record<AnimationVariant, Variants> = {
  fade: fadeVariants,
  'slide-up': slideVariants.up,
  'slide-down': slideVariants.down,
  'slide-left': slideVariants.left,
  'slide-right': slideVariants.right,
  scale: scaleVariants,
  blur: blurVariants,
  luxury: luxuryVariants
}

export function AnimatedSection({
  children,
  variant = 'luxury',
  delay = 0,
  stagger = false,
  className,
  as = 'div',
  once = true
}: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation({ once })
  const { skipAnimation } = useAnimationConfig()

  // If reduced motion, render without animation
  if (skipAnimation) {
    const Tag = as
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    )
  }

  const selectedVariants = variantMap[variant]
  const containerVariants = stagger ? staggerContainer : selectedVariants

  // Add delay to transition if specified
  const modifiedVariants =
    delay > 0
      ? {
          ...containerVariants,
          visible: {
            ...(containerVariants.visible as object),
            transition: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ...((containerVariants.visible as any)?.transition || {}),
              delay
            }
          }
        }
      : containerVariants

  const MotionTag = motion[as]

  return (
    <MotionTag
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={modifiedVariants}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </MotionTag>
  )
}

export default AnimatedSection
