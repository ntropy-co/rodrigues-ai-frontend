/**
 * Middleware utilities for BFF API routes.
 *
 * Provides reusable validation and authentication helpers.
 */

import { NextRequest, NextResponse } from 'next/server'
import { BFFErrorType, createErrorResponse, ErrorResponse } from './errors'

/**
 * Validate that request has Authorization header.
 *
 * @param request - The NextRequest object
 * @param context - Optional context for logging
 * @returns Error response if unauthorized, null otherwise
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const authError = validateAuth(request)
 *   if (authError) return authError
 *   // ... rest of handler
 * }
 * ```
 */
export function validateAuth(
  request: NextRequest,
  context?: Record<string, unknown>
): NextResponse<ErrorResponse> | null {
  const authorization = request.headers.get('authorization')

  if (!authorization) {
    return createErrorResponse(
      BFFErrorType.UNAUTHORIZED,
      'Authorization header required',
      undefined,
      context
    )
  }

  // Validate Bearer token format
  if (!authorization.startsWith('Bearer ')) {
    return createErrorResponse(
      BFFErrorType.UNAUTHORIZED,
      'Invalid authorization format. Expected: Bearer <token>',
      undefined,
      context
    )
  }

  return null
}

/**
 * Validate required fields in request body.
 *
 * @param body - The request body object
 * @param requiredFields - Array of required field names
 * @param context - Optional context for logging
 * @returns Error response if validation fails, null otherwise
 *
 * @example
 * ```ts
 * const body = await request.json()
 * const validationError = validateRequiredFields(
 *   body,
 *   ['message', 'session_id'],
 *   { route: '/api/chat' }
 * )
 * if (validationError) return validationError
 * ```
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[],
  context?: Record<string, unknown>
): NextResponse<ErrorResponse> | null {
  const missing: string[] = []

  for (const field of requiredFields) {
    if (!(field in body) || body[field] === null || body[field] === undefined) {
      missing.push(field)
    }
  }

  if (missing.length > 0) {
    return createErrorResponse(
      BFFErrorType.VALIDATION_ERROR,
      `Missing required fields: ${missing.join(', ')}`,
      missing.map((field) => ({
        field,
        message: `${field} is required`
      })),
      context
    )
  }

  return null
}

/**
 * Validate that a string field is not empty.
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field (for error message)
 * @param context - Optional context for logging
 * @returns Error response if validation fails, null otherwise
 *
 * @example
 * ```ts
 * const error = validateNonEmptyString(body.message, 'message')
 * if (error) return error
 * ```
 */
export function validateNonEmptyString(
  value: unknown,
  fieldName: string,
  context?: Record<string, unknown>
): NextResponse<ErrorResponse> | null {
  if (typeof value !== 'string' || !value.trim()) {
    return createErrorResponse(
      BFFErrorType.VALIDATION_ERROR,
      `${fieldName} must be a non-empty string`,
      [{ field: fieldName, message: `${fieldName} is required` }],
      context
    )
  }

  return null
}

/**
 * Validate UUID format.
 *
 * @param value - The value to validate
 * @param fieldName - Name of the field (for error message)
 * @param context - Optional context for logging
 * @returns Error response if validation fails, null otherwise
 *
 * @example
 * ```ts
 * const error = validateUUID(params.userId, 'userId')
 * if (error) return error
 * ```
 */
export function validateUUID(
  value: unknown,
  fieldName: string,
  context?: Record<string, unknown>
): NextResponse<ErrorResponse> | null {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (typeof value !== 'string' || !uuidRegex.test(value)) {
    return createErrorResponse(
      BFFErrorType.VALIDATION_ERROR,
      `${fieldName} must be a valid UUID`,
      [{ field: fieldName, message: `Invalid UUID format` }],
      context
    )
  }

  return null
}

/**
 * Compose multiple middleware functions.
 *
 * Runs middlewares in order and returns the first error encountered.
 *
 * @param middlewares - Array of middleware functions
 * @returns Composed middleware function
 *
 * @example
 * ```ts
 * const validate = compose([
 *   (req) => validateAuth(req, { route: '/api/chat' }),
 *   (req) => validateRequiredFields(body, ['message'])
 * ])
 *
 * const error = validate(request)
 * if (error) return error
 * ```
 */
export function compose(
  middlewares: Array<
    (request: NextRequest) => NextResponse<ErrorResponse> | null
  >
): (request: NextRequest) => NextResponse<ErrorResponse> | null {
  return (request: NextRequest): NextResponse<ErrorResponse> | null => {
    for (const middleware of middlewares) {
      const error = middleware(request)
      if (error) return error
    }
    return null
  }
}

/**
 * Rate limit state (in-memory, simple implementation).
 *
 * For production, use Redis or Upstash.
 * This is just a placeholder for development.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

/**
 * Simple in-memory rate limiter.
 *
 * NOTE: This is not production-ready. Use Upstash Redis for production.
 *
 * @param key - Unique key for rate limiting (e.g., IP address or user ID)
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @param context - Optional context for logging
 * @returns Error response if rate limit exceeded, null otherwise
 *
 * @example
 * ```ts
 * const ip = request.headers.get('x-real-ip') || 'unknown'
 * const rateLimitError = rateLimit(ip, 60, 60000) // 60 req/min
 * if (rateLimitError) return rateLimitError
 * ```
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): NextResponse<ErrorResponse> | null {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  // Clean up old records
  if (record && record.resetAt < now) {
    rateLimitStore.delete(key)
  }

  const current = rateLimitStore.get(key) || {
    count: 0,
    resetAt: now + windowMs
  }

  current.count++
  rateLimitStore.set(key, current)

  if (current.count > limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000)

    return new NextResponse(
      JSON.stringify({
        detail: 'Rate limit exceeded. Please try again later.'
      }),
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': current.resetAt.toString()
        }
      }
    )
  }

  return null
}
