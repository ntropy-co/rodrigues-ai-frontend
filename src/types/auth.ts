/**
 * Enterprise Authentication Types
 * Verity Agro - B2B Platform for CFOs & Rural Credit Managers
 */

// ============================================================================
// ENUMS & STATUS TYPES
// ============================================================================

export type UserStatus =
  | 'invited' // Convidado, não criou conta
  | 'active' // Ativo na plataforma
  | 'suspended' // Suspenso pelo admin
  | 'expired_invite' // Convite expirado

export type InviteStatus =
  | 'pending' // Enviado, não usado
  | 'accepted' // Usuário criou conta
  | 'expired' // Passou de 7 dias
  | 'revoked' // Admin cancelou

export type UserRole = 'admin' | 'analyst' | 'viewer'

export type OrganizationPlan = 'trial' | 'enterprise'

export type OrganizationStatus = 'active' | 'suspended'

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Organization {
  id: string
  name: string
  cnpj: string
  plan: OrganizationPlan
  status: OrganizationStatus
  invitesQuota: number
  invitesUsed: number
  createdAt: Date
  updatedAt?: Date
}

export interface User {
  id: string
  organizationId: string
  email: string
  name: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt?: Date
  inviteId?: string // Referência ao convite original
}

export interface Invite {
  id: string
  token: string
  organizationId: string
  email: string
  role: UserRole
  status: InviteStatus
  sentAt: Date
  expiresAt: Date
  acceptedAt?: Date
  revokedAt?: Date
  invitedBy: string // userId do admin que enviou
}

export interface AuthSession {
  userId: string
  token: string
  refreshToken?: string
  expiresAt: Date
  deviceInfo?: string
  ipAddress?: string
  createdAt: Date
}

// ============================================================================
// VALIDATION & SECURITY
// ============================================================================

export interface PasswordRequirements {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumber: boolean
  requireSpecial: boolean
}

export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
}

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export interface RateLimit {
  attempts: number
  maxAttempts: number
  windowMinutes: number
  lastAttempt: Date
  lockedUntil?: Date
}

export const DEFAULT_RATE_LIMIT: Pick<
  RateLimit,
  'maxAttempts' | 'windowMinutes'
> = {
  maxAttempts: 5,
  windowMinutes: 15
}

// ============================================================================
// AUTH CONTEXT & STATE
// ============================================================================

export interface AuthState {
  user: User | null
  organization: Organization | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (data: SignupData, inviteToken: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  refreshSession: () => Promise<void>
  clearError: () => void
}

// ============================================================================
// FORM DATA
// ============================================================================

export interface LoginData {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupData {
  email: string
  password: string
  confirmPassword: string
  name: string
  acceptTerms: boolean
}

export interface PasswordResetData {
  email: string
}

export interface NewPasswordData {
  token: string
  password: string
  confirmPassword: string
}

// ============================================================================
// ROUTE PROTECTION
// ============================================================================

export interface ProtectedRouteProps {
  requiredRole?: UserRole
  redirectTo?: string
  children: React.ReactNode
}

export const AUTH_ROUTES = {
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',
  dashboard: '/chat'
} as const

export type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES]

// ============================================================================
// BACKWARDS COMPATIBILITY ALIASES
// ============================================================================

/**
 * Legacy AuthContext type for backwards compatibility
 * @deprecated Use AuthContextValue instead
 */
export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  refetchUser: () => Promise<void>
}

/**
 * Legacy register request type
 * @deprecated Use SignupData instead
 */
export interface RegisterRequest {
  email: string
  password: string
  name: string
  inviteToken?: string
}
