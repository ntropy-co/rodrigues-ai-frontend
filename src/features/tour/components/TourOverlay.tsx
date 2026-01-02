'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTour } from '@/contexts/TourContext'

export function TourOverlay() {
  const { isActive } = useTour()

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 z-[90] bg-verity-950/20 backdrop-blur-[1px] dark:bg-black/50"
        />
      )}
    </AnimatePresence>
  )
}
