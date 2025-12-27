'use client'

import { useState, useCallback } from 'react'

/**
 * Contact form request data
 */
export interface ContactRequest {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}

/**
 * Contact form response
 */
export interface ContactResponse {
  success: boolean
  message: string
}

/**
 * Hook for submitting contact form
 *
 * This is a PUBLIC endpoint - no authentication required.
 * Uses regular fetch instead of fetchWithRefresh.
 */
export function useContact() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitContact = useCallback(
    async (data: ContactRequest): Promise<ContactResponse> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })

        const result: ContactResponse = await response.json()

        if (!response.ok) {
          const errorMessage =
            result.message || 'Erro ao enviar mensagem. Tente novamente.'
          setError(errorMessage)
          return { success: false, message: errorMessage }
        }

        return result
      } catch (err) {
        console.error('[useContact] Error submitting contact form:', err)
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Erro ao enviar mensagem. Tente novamente.'
        setError(errorMessage)
        return { success: false, message: errorMessage }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    submitContact,
    clearError
  }
}
