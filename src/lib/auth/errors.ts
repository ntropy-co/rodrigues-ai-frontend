/**
 * Authentication Error Codes & Messages
 * Professional error handling for B2B platform
 */

// ============================================================================
// ERROR CODES
// ============================================================================

export type AuthErrorCode =
  // Authentication errors
  | 'invalid_credentials'
  | 'account_suspended'
  | 'account_not_found'
  | 'email_not_verified'
  | 'session_expired'
  // Invite errors
  | 'invite_expired'
  | 'invite_used'
  | 'invite_revoked'
  | 'invite_not_found'
  | 'organization_suspended'
  // Registration errors
  | 'email_exists'
  | 'weak_password'
  | 'passwords_dont_match'
  | 'corporate_email_required'
  | 'invalid_name'
  | 'terms_not_accepted'
  // Rate limiting
  | 'rate_limited'
  // Password reset errors
  | 'reset_token_expired'
  | 'reset_token_invalid'
  // Network/System errors
  | 'network_error'
  | 'server_error'
  | 'unknown_error'

// ============================================================================
// ERROR MESSAGES (PT-BR)
// ============================================================================

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  // Authentication
  invalid_credentials: 'Email ou senha incorretos. Verifique suas credenciais.',
  account_suspended:
    'Sua conta foi suspensa. Entre em contato com seu administrador.',
  account_not_found: 'Não encontramos uma conta com este email.',
  email_not_verified: 'Por favor, verifique seu email antes de fazer login.',
  session_expired: 'Sua sessão expirou. Faça login novamente.',

  // Invites
  invite_expired:
    'Este convite expirou. Solicite um novo convite ao administrador.',
  invite_used: 'Este convite já foi utilizado.',
  invite_revoked: 'Este convite foi cancelado pelo administrador.',
  invite_not_found: 'Convite não encontrado. Verifique o link recebido.',
  organization_suspended: 'A organização está temporariamente indisponível.',

  // Registration
  email_exists: 'Já existe uma conta com este email.',
  weak_password: 'Senha não atende aos requisitos de segurança.',
  passwords_dont_match: 'As senhas não coincidem.',
  corporate_email_required: 'Utilize um email corporativo da sua empresa.',
  invalid_name: 'Nome inválido. Use apenas letras e espaços.',
  terms_not_accepted: 'Você precisa aceitar os termos de uso.',

  // Rate limiting
  rate_limited: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',

  // Password reset
  reset_token_expired: 'O link de recuperação expirou. Solicite um novo.',
  reset_token_invalid: 'Link de recuperação inválido. Solicite um novo.',

  // Network/System
  network_error: 'Erro de conexão. Verifique sua internet e tente novamente.',
  server_error: 'Erro interno do servidor. Tente novamente em instantes.',
  unknown_error: 'Ocorreu um erro inesperado. Tente novamente.'
}

// ============================================================================
// ERROR CLASS
// ============================================================================

export class AuthError extends Error {
  code: AuthErrorCode
  statusCode?: number
  details?: Record<string, string[]>

  constructor(
    code: AuthErrorCode,
    message?: string,
    statusCode?: number,
    details?: Record<string, string[]>
  ) {
    super(message || AUTH_ERROR_MESSAGES[code])
    this.name = 'AuthError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// ============================================================================
// ERROR HELPERS
// ============================================================================

/**
 * Gets user-friendly error message from error code
 */
export function getErrorMessage(code: AuthErrorCode | string): string {
  if (code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[code as AuthErrorCode]
  }
  return AUTH_ERROR_MESSAGES.unknown_error
}

/**
 * Maps HTTP status codes to error codes
 */
export function mapStatusToErrorCode(status: number): AuthErrorCode {
  switch (status) {
    case 400:
      return 'invalid_credentials'
    case 401:
      return 'session_expired'
    case 403:
      return 'account_suspended'
    case 404:
      return 'account_not_found'
    case 409:
      return 'email_exists'
    case 429:
      return 'rate_limited'
    case 500:
    case 502:
    case 503:
      return 'server_error'
    default:
      return 'unknown_error'
  }
}

/**
 * Maps API error response to AuthError
 */
export function mapApiError(response: {
  code?: string
  message?: string
  status?: number
  details?: Record<string, string[]>
}): AuthError {
  const code =
    (response.code as AuthErrorCode) ||
    mapStatusToErrorCode(response.status || 500)
  return new AuthError(
    code,
    response.message,
    response.status,
    response.details
  )
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Network') ||
      error.name === 'TypeError'
    )
  }
  return false
}

/**
 * Handles unknown errors and returns AuthError
 */
export function handleError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error
  }

  if (isNetworkError(error)) {
    return new AuthError('network_error')
  }

  if (error instanceof Error) {
    return new AuthError('unknown_error', error.message)
  }

  return new AuthError('unknown_error')
}
