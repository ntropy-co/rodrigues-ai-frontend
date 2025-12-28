/**
 * BFF (Backend-for-Frontend) Utilities
 *
 * Shared utilities for Next.js API routes that proxy to the backend.
 * Provides common functionality for auth validation, error handling,
 * and response formatting.
 */

import { NextRequest, NextResponse } from 'next/server'

// ============================================================================
// Constants
// ============================================================================

/**
 * Backend API base URL
 */
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Standard error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authorization header required',
  INVALID_REQUEST: 'Invalid request body',
  INTERNAL_ERROR: 'Internal server error',
  BACKEND_ERROR: 'Backend error',
  INVALID_UUID: 'Invalid ID format',
  INVALID_SESSION_ID: 'Invalid session ID format',
  NOT_FOUND: 'Resource not found',
  FORBIDDEN: 'Access forbidden'
} as const

// ============================================================================
// Auth Utilities
// ============================================================================

/**
 * Extract and validate authorization header from request
 *
 * @param request - Next.js request object
 * @returns Authorization header value or null
 */
export function getAuthHeader(request: NextRequest): string | null {
  return request.headers.get('authorization')
}

/**
 * Validate that authorization header is present
 * Returns error response if missing
 *
 * @param request - Next.js request object
 * @returns Error response or null if valid
 */
export function validateAuth(
  request: NextRequest
): NextResponse<{ detail: string }> | null {
  const auth = getAuthHeader(request)

  if (!auth) {
    return NextResponse.json(
      { detail: ERROR_MESSAGES.UNAUTHORIZED },
      { status: 401 }
    )
  }

  return null
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate UUID format
 *
 * @param id - String to validate as UUID
 * @returns True if valid UUID format
 */
export function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

/**
 * Validate session ID format (s_<uuid>)
 *
 * @param sessionId - Session ID to validate
 * @returns True if valid session ID format
 */
export function isValidSessionId(sessionId: string): boolean {
  if (!sessionId.startsWith('s_')) {
    return false
  }
  const uuid = sessionId.substring(2)
  return isValidUUID(uuid)
}

/**
 * Validate project ID format (p_<uuid>)
 *
 * @param projectId - Project ID to validate
 * @returns True if valid project ID format
 */
export function isValidProjectId(projectId: string): boolean {
  if (!projectId.startsWith('p_')) {
    return false
  }
  const uuid = projectId.substring(2)
  return isValidUUID(uuid)
}

// ============================================================================
// Request Body Parsing
// ============================================================================

/**
 * Safely parse JSON request body
 * Returns error response if parsing fails
 *
 * @param request - Next.js request object
 * @returns Parsed body or error response
 */
export async function parseRequestBody<T>(
  request: NextRequest
): Promise<{ data: T } | { error: NextResponse<{ detail: string }> }> {
  try {
    const body = await request.json()
    return { data: body as T }
  } catch {
    return {
      error: NextResponse.json(
        { detail: ERROR_MESSAGES.INVALID_REQUEST },
        { status: 400 }
      )
    }
  }
}

// ============================================================================
// Backend Proxy Utilities
// ============================================================================

/**
 * Standard headers for backend requests
 *
 * @param authorization - Authorization header value
 * @param includeContentType - Whether to include Content-Type header
 * @returns Headers object
 */
export function getBackendHeaders(
  authorization: string,
  includeContentType = true
): HeadersInit {
  const headers: HeadersInit = {
    Authorization: authorization
  }

  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

/**
 * Make a proxy request to the backend
 *
 * @param endpoint - Backend endpoint path (e.g., '/api/v1/chat/feedback')
 * @param options - Fetch options
 * @returns Response from backend
 */
export async function proxyToBackend(
  endpoint: string,
  options: RequestInit
): Promise<Response> {
  const url = `${BACKEND_URL}${endpoint}`

  try {
    const response = await fetch(url, options)
    return response
  } catch (error) {
    console.error('[BFF Proxy] Error calling backend:', error)
    throw error
  }
}

// ============================================================================
// Response Handling
// ============================================================================

/**
 * Handle backend response and convert to Next.js response
 * Properly handles different status codes and error formats
 *
 * @param response - Backend response
 * @param errorMessage - Custom error message for logging
 * @returns Next.js response
 */
export async function handleBackendResponse(
  response: Response,
  errorMessage = 'Backend request failed'
): Promise<NextResponse> {
  // Handle 204 No Content
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 })
  }

  // Try to parse JSON response
  let data: unknown
  try {
    data = await response.json()
  } catch {
    // If JSON parsing fails and it's an error status, return generic error
    if (!response.ok) {
      console.error(
        `[BFF] ${errorMessage}:`,
        response.status,
        response.statusText
      )
      return NextResponse.json(
        {
          detail: `${ERROR_MESSAGES.BACKEND_ERROR}: ${response.status} ${response.statusText}`
        },
        { status: response.status }
      )
    }
    // If it's a success status but no JSON, return empty object
    return NextResponse.json({}, { status: response.status })
  }

  // Log error responses
  if (!response.ok) {
    console.error(`[BFF] ${errorMessage}:`, data)
  }

  // Return response with same status
  return NextResponse.json(data, { status: response.status })
}

/**
 * Create error response with standard format
 *
 * @param message - Error message
 * @param status - HTTP status code
 * @returns Next.js error response
 */
export function createErrorResponse(
  message: string,
  status: number
): NextResponse<{ detail: string }> {
  return NextResponse.json({ detail: message }, { status })
}

/**
 * Create success response with standard format
 *
 * @param data - Response data
 * @param status - HTTP status code (default: 200)
 * @returns Next.js success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<T> {
  return NextResponse.json(data, { status })
}

// ============================================================================
// CORS Utilities (for OPTIONS requests)
// ============================================================================

/**
 * Handle CORS preflight OPTIONS request
 *
 * @returns CORS response
 */
export function handleCorsOptions(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

// ============================================================================
// Logging Utilities
// ============================================================================

/**
 * Log API route error with context
 *
 * @param route - API route name
 * @param method - HTTP method
 * @param error - Error object or message
 */
export function logRouteError(
  route: string,
  method: string,
  error: unknown
): void {
  console.error(`[API Route ${route}] ${method} Error:`, error)
}

/**
 * Log API route info
 *
 * @param route - API route name
 * @param method - HTTP method
 * @param message - Log message
 */
export function logRouteInfo(
  route: string,
  method: string,
  message: string
): void {
  console.log(`[API Route ${route}] ${method}:`, message)
}
