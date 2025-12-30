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

// Aligned with backend plan_tier values (app/models/user.py:179)
export type PlanTier = 'free' | 'pro' | 'enterprise'

// Legacy alias for backwards compatibility
export type OrganizationPlan = PlanTier

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

/**
 * Backend User model (matches app/models/user.py:128-186)
 * These are the actual fields returned by the backend API
 */
export interface BackendUser {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  is_superuser: boolean
  organization_id: string | null
  phone_number: string | null
  job_title: string | null
  avatar_url: string | null
  company_name: string | null
  last_login_at: string | null
  login_count: number
  onboarding_completed: boolean
  onboarding_step: number
  plan_tier: PlanTier
  storage_used_bytes: number
  created_at: string
  updated_at: string
}

/**
 * Frontend User model
 * Transformed from BackendUser by the BFF layer
 */
export interface User {
  id: string
  organizationId: string | null
  email: string
  name: string // Mapped from full_name
  fullName: string | null // Original backend field
  role: UserRole // Derived from is_superuser
  isActive: boolean
  isSuperuser: boolean
  // Profile fields
  phoneNumber: string | null
  jobTitle: string | null
  avatarUrl: string | null
  companyName: string | null
  // Engagement
  lastLoginAt?: Date
  loginCount: number
  // Onboarding
  onboardingCompleted: boolean
  onboardingStep: number
  // Plan
  planTier: PlanTier
  storageUsedBytes: number
  // Timestamps
  createdAt: Date
  updatedAt?: Date
  // Legacy fields (for backwards compatibility)
  status?: UserStatus
  emailVerified?: boolean
  inviteId?: string
}

/**
 * Transform backend user to frontend user
 */
export function transformBackendUser(backend: BackendUser): User {
  return {
    id: backend.id,
    organizationId: backend.organization_id,
    email: backend.email,
    name: backend.full_name || backend.email.split('@')[0],
    fullName: backend.full_name,
    role: backend.is_superuser ? 'admin' : 'analyst',
    isActive: backend.is_active,
    isSuperuser: backend.is_superuser,
    phoneNumber: backend.phone_number,
    jobTitle: backend.job_title,
    avatarUrl: backend.avatar_url,
    companyName: backend.company_name,
    lastLoginAt: backend.last_login_at
      ? new Date(backend.last_login_at)
      : undefined,
    loginCount: backend.login_count,
    onboardingCompleted: backend.onboarding_completed,
    onboardingStep: backend.onboarding_step,
    planTier: backend.plan_tier,
    storageUsedBytes: backend.storage_used_bytes,
    createdAt: new Date(backend.created_at),
    updatedAt: backend.updated_at ? new Date(backend.updated_at) : undefined,
    // Legacy defaults
    status: backend.is_active ? 'active' : 'suspended',
    emailVerified: true // Backend doesn't track this separately
  }
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
