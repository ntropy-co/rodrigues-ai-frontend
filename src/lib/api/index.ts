/**
 * Unified API utilities for BFF routes.
 *
 * This module provides reusable utilities for building consistent
 * BFF API routes with standardized error handling, proxy logic,
 * authentication validation, and request validation.
 *
 * @example
 * ```ts
 * // Simple proxy route
 * import { proxyToBackend, validateAuth } from '@/lib/api'
 *
 * export async function GET(request: NextRequest) {
 *   const authError = validateAuth(request)
 *   if (authError) return authError
 *
 *   return proxyToBackend(request, {
 *     backendPath: '/api/v1/chat/history/123',
 *     context: { route: '/api/chat/history/[sessionId]' }
 *   })
 * }
 * ```
 *
 * @example
 * ```ts
 * // Using helper factories
 * import { createGetProxy } from '@/lib/api'
 *
 * export const GET = createGetProxy(
 *   '/api/v1/users/{userId}',
 *   { route: '/api/users/[userId]' }
 * )
 * ```
 */

// Error handling
export {
  createErrorResponse,
  handleBackendError,
  safeParseJSON,
  withErrorBoundary,
  BFFErrorType,
  type ErrorResponse
} from './errors'

// Proxy utilities
export {
  proxyToBackend,
  getAuthHeader,
  mapBackendPath,
  createGetProxy,
  createPostProxy,
  type ProxyOptions
} from './proxy'

// Middleware/validation
export {
  validateAuth,
  validateRequiredFields,
  validateNonEmptyString,
  validateUUID,
  compose,
  rateLimit
} from './middleware'
