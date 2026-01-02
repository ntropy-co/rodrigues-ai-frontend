'use client'

/**
 * useInviteValidation Hook
 * Validates invite tokens for signup flow
 */

import { useState, useEffect } from 'react'
import type { Invite, Organization } from '@/types/auth'
import type { InviteValidationError } from '@/types/auth-api'
import * as authApi from '@/lib/auth/api'
import { handleError, getErrorMessage } from '@/lib/auth/errors'

// ============================================================================
// HOOK STATE
// ============================================================================

interface UseInviteValidationReturn {
  invite: Invite | null
  organization: Organization | null
  isValid: boolean
  isExpired: boolean
  isUsed: boolean
  isRevoked: boolean
  isLoading: boolean
  error: string | null
  errorCode: InviteValidationError | null
  refetch: () => Promise<void>
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useInviteValidation(
  token: string | null
): UseInviteValidationReturn {
  const [invite, setInvite] = useState<Invite | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<InviteValidationError | null>(null)

  const validateInvite = async () => {
    if (!token) {
      setIsLoading(false)
      setError('Token de convite não fornecido.')
      setErrorCode('invalid_token')
      return
    }

    setIsLoading(true)
    setError(null)
    setErrorCode(null)

    try {
      const response = await authApi.validateInvite(token)

      if (response.valid && response.invite && response.organization) {
        setInvite(response.invite)
        setOrganization(response.organization)
        setError(null)
        setErrorCode(null)
      } else {
        setInvite(null)
        setOrganization(null)
        setErrorCode(response.error || 'invalid_token')

        // Map error code to user-friendly message
        const errorMessages: Record<InviteValidationError, string> = {
          invalid_token: 'Convite inválido. Verifique o link recebido.',
          expired: 'Este convite expirou. Solicite um novo ao administrador.',
          already_used: 'Este convite já foi utilizado.',
          revoked: 'Este convite foi cancelado pelo administrador.',
          organization_suspended:
            'A organização está temporariamente indisponível.'
        }
        setError(errorMessages[response.error!] || 'Erro ao validar convite.')
      }
    } catch (err) {
      const authError = handleError(err)
      setInvite(null)
      setOrganization(null)
      setError(getErrorMessage(authError.code))
      setErrorCode('invalid_token')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    validateInvite()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // Computed states
  const isValid = invite !== null && errorCode === null
  const isExpired = errorCode === 'expired'
  const isUsed = errorCode === 'already_used'
  const isRevoked = errorCode === 'revoked'

  return {
    invite,
    organization,
    isValid,
    isExpired,
    isUsed,
    isRevoked,
    isLoading,
    error,
    errorCode,
    refetch: validateInvite
  }
}

export default useInviteValidation
