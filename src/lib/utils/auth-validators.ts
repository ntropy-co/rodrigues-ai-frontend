/**
 * Authentication Validators
 * Email, password, and rate limiting validation functions
 */

import type {
  PasswordRequirements,
  PasswordValidationResult,
  RateLimit
} from '@/types/auth'

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Domains blocked for corporate accounts
 * B2B platform requires corporate email
 */
const BLOCKED_EMAIL_DOMAINS = [
  // International
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'outlook.com',
  'outlook.com.br',
  'live.com',
  'yahoo.com',
  'yahoo.com.br',
  'icloud.com',
  'me.com',
  'protonmail.com',
  'proton.me',
  'aol.com',
  // Brazilian
  'uol.com.br',
  'bol.com.br',
  'terra.com.br',
  'ig.com.br',
  'globo.com',
  'zipmail.com.br',
  'r7.com'
] as const

/**
 * Validates email format
 */
export function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.toLowerCase().trim())
}

/**
 * Extracts domain from email
 */
export function getEmailDomain(email: string): string {
  const parts = email.toLowerCase().trim().split('@')
  return parts[1] || ''
}

/**
 * Validates that email is from a corporate domain (not personal)
 */
export function validateCorporateEmail(email: string): {
  valid: boolean
  error?: string
} {
  if (!isValidEmailFormat(email)) {
    return { valid: false, error: 'Formato de email inválido.' }
  }

  const domain = getEmailDomain(email)

  if (
    BLOCKED_EMAIL_DOMAINS.includes(
      domain as (typeof BLOCKED_EMAIL_DOMAINS)[number]
    )
  ) {
    return {
      valid: false,
      error:
        'Utilize um email corporativo da sua empresa. Emails pessoais não são permitidos.'
    }
  }

  return { valid: true }
}

/**
 * Normalizes email for comparison (lowercase, trimmed)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

const PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
}

/**
 * Character patterns for password validation
 */
const PATTERNS = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
} as const

/**
 * Validates password against security requirements
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < requirements.minLength) {
    errors.push(
      `Senha deve ter no mínimo ${requirements.minLength} caracteres.`
    )
  }

  if (requirements.requireUppercase && !PATTERNS.uppercase.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula.')
  }

  if (requirements.requireLowercase && !PATTERNS.lowercase.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula.')
  }

  if (requirements.requireNumber && !PATTERNS.number.test(password)) {
    errors.push('Senha deve conter pelo menos um número.')
  }

  if (requirements.requireSpecial && !PATTERNS.special.test(password)) {
    errors.push(
      'Senha deve conter pelo menos um caractere especial (!@#$%^&*...).'
    )
  }

  // Calculate password strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  const hasUppercase = PATTERNS.uppercase.test(password)
  const hasLowercase = PATTERNS.lowercase.test(password)
  const hasNumber = PATTERNS.number.test(password)
  const hasSpecial = PATTERNS.special.test(password)
  const isLong = password.length >= 12

  const criteriaCount = [
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecial,
    isLong
  ].filter(Boolean).length

  if (criteriaCount >= 4 && password.length >= 10) {
    strength = 'strong'
  } else if (criteriaCount >= 3 && password.length >= 8) {
    strength = 'medium'
  }

  return {
    valid: errors.length === 0,
    errors,
    strength
  }
}

/**
 * Validates password confirmation matches
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): { valid: boolean; error?: string } {
  if (password !== confirmPassword) {
    return { valid: false, error: 'As senhas não coincidem.' }
  }
  return { valid: true }
}

/**
 * Get password strength label in Portuguese
 */
export function getPasswordStrengthLabel(
  strength: 'weak' | 'medium' | 'strong'
): string {
  const labels = {
    weak: 'Fraca',
    medium: 'Média',
    strong: 'Forte'
  }
  return labels[strength]
}

/**
 * Get password strength color class
 */
export function getPasswordStrengthColor(
  strength: 'weak' | 'medium' | 'strong'
): string {
  const colors = {
    weak: 'text-red-500',
    medium: 'text-yellow-500',
    strong: 'text-green-500'
  }
  return colors[strength]
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const RATE_LIMIT_STORAGE_KEY = 'verity_rate_limit'

interface StoredRateLimit {
  attempts: number
  lastAttempt: string // ISO date
  lockedUntil?: string // ISO date
}

/**
 * Gets current rate limit state from storage
 */
export function getRateLimitState(): RateLimit {
  if (typeof window === 'undefined') {
    return createEmptyRateLimit()
  }

  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY)
    if (!stored) {
      return createEmptyRateLimit()
    }

    const data: StoredRateLimit = JSON.parse(stored)
    return {
      attempts: data.attempts,
      maxAttempts: 5,
      windowMinutes: 15,
      lastAttempt: new Date(data.lastAttempt),
      lockedUntil: data.lockedUntil ? new Date(data.lockedUntil) : undefined
    }
  } catch {
    return createEmptyRateLimit()
  }
}

/**
 * Creates empty rate limit state
 */
function createEmptyRateLimit(): RateLimit {
  return {
    attempts: 0,
    maxAttempts: 5,
    windowMinutes: 15,
    lastAttempt: new Date()
  }
}

/**
 * Records a failed login attempt
 */
export function recordFailedAttempt(): RateLimit {
  const state = getRateLimitState()
  const now = new Date()

  // Check if window has expired (reset if so)
  const windowExpiry = new Date(state.lastAttempt)
  windowExpiry.setMinutes(windowExpiry.getMinutes() + state.windowMinutes)

  if (now > windowExpiry) {
    // Window expired, reset
    state.attempts = 1
    state.lastAttempt = now
    state.lockedUntil = undefined
  } else {
    // Within window, increment
    state.attempts += 1
    state.lastAttempt = now

    // Lock if max attempts reached
    if (state.attempts >= state.maxAttempts) {
      const lockUntil = new Date(now)
      lockUntil.setMinutes(lockUntil.getMinutes() + state.windowMinutes)
      state.lockedUntil = lockUntil
    }
  }

  // Persist to storage
  saveRateLimitState(state)

  return state
}

/**
 * Clears rate limit state (on successful login)
 */
export function clearRateLimitState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(RATE_LIMIT_STORAGE_KEY)
  }
}

/**
 * Saves rate limit state to storage
 */
function saveRateLimitState(state: RateLimit): void {
  if (typeof window === 'undefined') return

  const data: StoredRateLimit = {
    attempts: state.attempts,
    lastAttempt: state.lastAttempt.toISOString(),
    lockedUntil: state.lockedUntil?.toISOString()
  }

  localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data))
}

/**
 * Checks if user is currently rate limited
 */
export function isRateLimited(): {
  limited: boolean
  remainingAttempts: number
  lockedUntil?: Date
  message?: string
} {
  const state = getRateLimitState()
  const now = new Date()

  // Check if locked
  if (state.lockedUntil && now < state.lockedUntil) {
    const minutesRemaining = Math.ceil(
      (state.lockedUntil.getTime() - now.getTime()) / 60000
    )
    return {
      limited: true,
      remainingAttempts: 0,
      lockedUntil: state.lockedUntil,
      message: `Muitas tentativas. Tente novamente em ${minutesRemaining} minuto${minutesRemaining > 1 ? 's' : ''}.`
    }
  }

  // Check if window expired (auto-reset)
  const windowExpiry = new Date(state.lastAttempt)
  windowExpiry.setMinutes(windowExpiry.getMinutes() + state.windowMinutes)

  if (now > windowExpiry) {
    return {
      limited: false,
      remainingAttempts: state.maxAttempts
    }
  }

  return {
    limited: false,
    remainingAttempts: state.maxAttempts - state.attempts
  }
}

// ============================================================================
// FORM VALIDATION HELPERS
// ============================================================================

/**
 * Validates a required field
 */
export function validateRequired(
  value: string,
  fieldName: string
): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName} é obrigatório.`
  }
  return null
}

/**
 * Validates minimum length
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): string | null {
  if (value.length < minLength) {
    return `${fieldName} deve ter no mínimo ${minLength} caracteres.`
  }
  return null
}

/**
 * Validates name format (letters, spaces, common accents)
 */
export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: 'Nome deve ter no mínimo 2 caracteres.' }
  }

  if (trimmed.length > 100) {
    return { valid: false, error: 'Nome muito longo.' }
  }

  // Allow letters, spaces, hyphens, apostrophes, and common accents
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Nome contém caracteres inválidos.' }
  }

  return { valid: true }
}
