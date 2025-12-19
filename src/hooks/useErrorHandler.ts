'use client'

/**
 * useErrorHandler Hook
 *
 * Centraliza tratamento de erros com:
 * - Toasts padronizados em português
 * - Integração automática com Sentry/PostHog
 * - Categorização de erros
 * - Retry automático opcional
 *
 * @example
 * const { handleError, handleApiError, withErrorHandling } = useErrorHandler()
 *
 * // Uso básico
 * try {
 *   await fetchData()
 * } catch (error) {
 *   handleError(error)
 * }
 *
 * // Com wrapper
 * const result = await withErrorHandling(fetchData, { showToast: true })
 */

import { useCallback } from 'react'
import { toast } from 'sonner'
import { trackError, trackAPIError } from '@/lib/analytics'

// =============================================================================
// Error Types
// =============================================================================

export type ErrorCategory =
  | 'network'
  | 'auth'
  | 'validation'
  | 'server'
  | 'unknown'

export interface ErrorInfo {
  message: string
  category: ErrorCategory
  statusCode?: number
  retryable: boolean
}

// =============================================================================
// Error Messages (PT-BR)
// =============================================================================

const ERROR_MESSAGES: Record<ErrorCategory, string> = {
  network: 'Erro de conexão. Verifique sua internet e tente novamente.',
  auth: 'Sessão expirada. Faça login novamente.',
  validation: 'Dados inválidos. Verifique as informações e tente novamente.',
  server: 'Erro no servidor. Tente novamente em alguns instantes.',
  unknown: 'Ocorreu um erro inesperado. Tente novamente.'
}

const RETRYABLE_CATEGORIES: ErrorCategory[] = ['network', 'server']

// =============================================================================
// Error Classification
// =============================================================================

function classifyError(error: unknown, statusCode?: number): ErrorInfo {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: ERROR_MESSAGES.network,
      category: 'network',
      retryable: true
    }
  }

  // Check for network-related errors
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (
      msg.includes('network') ||
      msg.includes('offline') ||
      msg.includes('failed to fetch')
    ) {
      return {
        message: ERROR_MESSAGES.network,
        category: 'network',
        retryable: true
      }
    }
  }

  // HTTP status code based classification
  if (statusCode) {
    if (statusCode === 401 || statusCode === 403) {
      return {
        message: ERROR_MESSAGES.auth,
        category: 'auth',
        statusCode,
        retryable: false
      }
    }
    if (statusCode === 400 || statusCode === 422) {
      return {
        message: ERROR_MESSAGES.validation,
        category: 'validation',
        statusCode,
        retryable: false
      }
    }
    if (statusCode >= 500) {
      return {
        message: ERROR_MESSAGES.server,
        category: 'server',
        statusCode,
        retryable: true
      }
    }
  }

  // Default: unknown error
  return {
    message: ERROR_MESSAGES.unknown,
    category: 'unknown',
    statusCode,
    retryable: false
  }
}

// =============================================================================
// Hook Options
// =============================================================================

export interface UseErrorHandlerOptions {
  /** Show toast notification (default: true) */
  showToast?: boolean
  /** Track error in analytics (default: true) */
  trackAnalytics?: boolean
  /** Custom component name for tracking */
  componentName?: string
}

export interface HandleErrorOptions extends UseErrorHandlerOptions {
  /** Custom error message to show */
  customMessage?: string
  /** Callback on retry */
  onRetry?: () => void
}

// =============================================================================
// Hook Implementation
// =============================================================================

export function useErrorHandler(defaultOptions: UseErrorHandlerOptions = {}) {
  const {
    showToast: defaultShowToast = true,
    trackAnalytics: defaultTrackAnalytics = true,
    componentName: defaultComponentName
  } = defaultOptions

  /**
   * Handle a generic error
   */
  const handleError = useCallback(
    (error: unknown, options: HandleErrorOptions = {}) => {
      const {
        showToast = defaultShowToast,
        trackAnalytics = defaultTrackAnalytics,
        componentName = defaultComponentName,
        customMessage,
        onRetry
      } = options

      const errorInfo = classifyError(error)
      const message = customMessage || errorInfo.message

      // Track in analytics
      if (trackAnalytics) {
        trackError(
          error instanceof Error ? error.message : String(error),
          error instanceof Error ? error.stack : undefined,
          componentName
        )
      }

      // Show toast
      if (showToast) {
        if (errorInfo.retryable && onRetry) {
          toast.error(message, {
            action: {
              label: 'Tentar novamente',
              onClick: onRetry
            },
            duration: 5000
          })
        } else {
          toast.error(message)
        }
      }

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('[useErrorHandler]', error)
      }

      return errorInfo
    },
    [defaultShowToast, defaultTrackAnalytics, defaultComponentName]
  )

  /**
   * Handle an API error with status code
   */
  const handleApiError = useCallback(
    (
      endpoint: string,
      statusCode: number,
      error: unknown,
      options: HandleErrorOptions = {}
    ) => {
      const {
        showToast = defaultShowToast,
        trackAnalytics = defaultTrackAnalytics,
        customMessage,
        onRetry
      } = options

      const errorInfo = classifyError(error, statusCode)
      const message = customMessage || errorInfo.message

      // Track API error specifically
      if (trackAnalytics) {
        trackAPIError(
          endpoint,
          statusCode,
          error instanceof Error ? error.message : String(error)
        )
      }

      // Show toast
      if (showToast) {
        if (errorInfo.retryable && onRetry) {
          toast.error(message, {
            action: {
              label: 'Tentar novamente',
              onClick: onRetry
            },
            duration: 5000
          })
        } else {
          toast.error(message)
        }
      }

      return errorInfo
    },
    [defaultShowToast, defaultTrackAnalytics]
  )

  /**
   * Wrapper function that handles errors automatically
   */
  const withErrorHandling = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options: HandleErrorOptions = {}
    ): Promise<T | null> => {
      try {
        return await fn()
      } catch (error) {
        handleError(error, options)
        return null
      }
    },
    [handleError]
  )

  /**
   * Show a success toast
   */
  const showSuccess = useCallback((message: string) => {
    toast.success(message)
  }, [])

  /**
   * Show an info toast
   */
  const showInfo = useCallback((message: string) => {
    toast.info(message)
  }, [])

  /**
   * Show a warning toast
   */
  const showWarning = useCallback((message: string) => {
    toast.warning(message)
  }, [])

  return {
    handleError,
    handleApiError,
    withErrorHandling,
    showSuccess,
    showInfo,
    showWarning,
    classifyError,
    ERROR_MESSAGES,
    RETRYABLE_CATEGORIES
  }
}

export default useErrorHandler
