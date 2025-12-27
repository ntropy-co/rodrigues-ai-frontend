/**
 * Authentication API Contracts
 * Request/Response types for auth endpoints
 */

import type { User, Organization, Invite, UserRole } from './auth'

// ============================================================================
// API RESPONSES
// ============================================================================

export interface AuthResponse {
  user: User
  organization: Organization
  token: string
  refreshToken?: string
  expiresAt: string // ISO date string
}

export interface InviteValidationResponse {
  valid: boolean
  invite: Invite | null
  organization: Organization | null
  error?: InviteValidationError
}

export type InviteValidationError =
  | 'invalid_token'
  | 'expired'
  | 'already_used'
  | 'revoked'
  | 'organization_suspended'

export interface PasswordResetResponse {
  success: boolean
  message: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken?: string
  expiresAt: string
}

// ============================================================================
// API REQUESTS
// ============================================================================

export interface LoginRequest {
  email: string
  password: string
  deviceInfo?: string
}

export interface SignupRequest {
  inviteToken: string
  email: string
  password: string
  name: string
}

export interface PasswordResetRequest {
  email: string
}

export interface NewPasswordRequest {
  token: string
  password: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// ============================================================================
// INVITE MANAGEMENT (Admin)
// ============================================================================

export interface CreateInviteRequest {
  email: string
  role: UserRole
}

export interface CreateInviteResponse {
  invite: Invite
  inviteUrl: string
}

export interface RevokeInviteRequest {
  inviteId: string
}

export interface ListInvitesResponse {
  invites: Invite[]
  total: number
}

// ============================================================================
// API ERROR RESPONSE
// ============================================================================

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
  timestamp: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

// ============================================================================
// API CLIENT INTERFACE
// ============================================================================

export interface AuthApiClient {
  // Authentication
  login(data: LoginRequest): Promise<AuthResponse>
  signup(data: SignupRequest): Promise<AuthResponse>
  logout(): Promise<void>
  refreshToken(data?: RefreshTokenRequest): Promise<RefreshTokenResponse>

  // Invite Validation
  validateInvite(token: string): Promise<InviteValidationResponse>

  // Password Management
  requestPasswordReset(
    data: PasswordResetRequest
  ): Promise<PasswordResetResponse>
  resetPassword(data: NewPasswordRequest): Promise<PasswordResetResponse>

  // Invite Management (Admin only)
  createInvite(data: CreateInviteRequest): Promise<CreateInviteResponse>
  revokeInvite(data: RevokeInviteRequest): Promise<void>
  listInvites(): Promise<ListInvitesResponse>
}
