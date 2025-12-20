'use client'

/**
 * LoadingOverlay Component
 *
 * Overlay de loading para operações longas com:
 * - Spinner animado
 * - Mensagem customizável
 * - Progress bar opcional
 * - Backdrop blur
 *
 * @example
 * <LoadingOverlay
 *   isLoading={isProcessing}
 *   message="Processando documento..."
 *   progress={65}
 * />
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingOverlayProps {
  /** Whether to show the overlay */
  isLoading: boolean
  /** Message to display */
  message?: string
  /** Progress percentage (0-100) */
  progress?: number
  /** Whether the overlay is fullscreen or contained */
  fullscreen?: boolean
  /** Additional className */
  className?: string
}

export function LoadingOverlay({
  isLoading,
  message = 'Carregando...',
  progress,
  fullscreen = false,
  className
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm',
            fullscreen ? 'fixed inset-0' : 'absolute inset-0',
            className
          )}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Spinner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <Loader2 className="h-8 w-8 text-verde-600" />
            </motion.div>

            {/* Message */}
            <p className="text-sm font-medium text-muted-foreground">
              {message}
            </p>

            {/* Progress Bar */}
            {progress !== undefined && (
              <div className="w-48">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className="h-full bg-verde-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  {Math.round(progress)}%
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================================
// Inline Loading Spinner
// =============================================================================

interface LoadingSpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional className */
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  className
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <Loader2
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )}
    />
  )
}

export default LoadingOverlay
