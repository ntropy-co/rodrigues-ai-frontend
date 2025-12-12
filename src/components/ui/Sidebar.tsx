'use client'

import { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { SidebarPosition } from '@/types/layout'
import { cn } from '@/lib/utils'

// Spring animation config (Claude-inspired)
const sidebarSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8
}

interface SidebarProps {
  children: ReactNode
  position: SidebarPosition
  width: number
  isOpen: boolean
  overlay?: boolean
  onClose?: () => void
  className?: string
  header?: ReactNode
}

export function Sidebar({
  children,
  position,
  width,
  isOpen,
  overlay = false,
  onClose,
  className = '',
  header
}: SidebarProps) {
  const isLeft = position === 'left'

  if (overlay) {
    // Modo Overlay (mobile/tablet)
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-verde-950/20 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{
                x: isLeft ? -width : width,
                opacity: 0
              }}
              animate={{
                x: 0,
                opacity: 1
              }}
              exit={{
                x: isLeft ? -width : width,
                opacity: 0
              }}
              transition={{
                ...sidebarSpring,
                opacity: { duration: 0.3 }
              }}
              style={{ width }}
              className={cn(
                'fixed top-0 z-50 flex h-screen flex-col overflow-hidden bg-white',
                isLeft ? 'left-0 border-r-2' : 'right-0 border-l-2',
                'border-verde-100',
                className
              )}
            >
              {/* Header with Close Button */}
              <div className="flex items-center justify-between border-b border-verde-100 p-4">
                {header}
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-verde-600 transition-colors hover:bg-verde-100 hover:text-verde-900"
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">{children}</div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    )
  }

  // Modo Normal (desktop) - Animated width
  return (
    <motion.aside
      initial={false}
      animate={{
        width: isOpen ? width : 0,
        opacity: isOpen ? 1 : 0
      }}
      transition={sidebarSpring}
      className={cn(
        'relative h-screen flex-shrink-0 overflow-hidden bg-white',
        isLeft ? 'border-r' : 'border-l',
        'border-verde-100',
        className
      )}
    >
      <div className="flex h-full flex-col" style={{ width: `${width}px` }}>
        {header && (
          <div className="flex-shrink-0 border-b border-verde-100 p-4">
            {header}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </motion.aside>
  )
}
