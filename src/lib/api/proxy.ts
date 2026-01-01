/**
 * Unified proxy utilities for BFF API routes.
 *
 * Provides helpers for forwarding requests to the backend with
 * consistent authentication, logging, and error handling.
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleBackendError } from './errors'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Options for proxying requests to the backend.
 */
export interface ProxyOptions {
  /**
   * HTTP method (defaults to request.method)
   */
  method?: string

  /**
   * Request body (JSON object, FormData, or string)
   */
  body?: unknown | FormData | string

  /**
   * Additional headers to include
   */
  headers?: Record<string, string>

  /**
   * Whether to include the Authorization header (default: true)
   */
  includeAuth?: boolean

  /**
   * Custom backend path (overrides the default path mapping)
   */
  backendPath?: string

  /**
   * Context for logging and error tracking
   */
  context?: Record<string, unknown>

  /**
   * Cache control header (optional)
   */
  cache?: RequestCache
}

/**
 * Extract Authorization header from request.
 *
 * @param request - The NextRequest object
 * @returns The authorization header value or null
 */
export function getAuthHeader(request: NextRequest): string | null {
  return getAuthorizationFromRequest(request)
}

/**
 * Map frontend API path to backend API path.
 *
 * Examples:
 * - /api/chat → /api/v1/chat
 * - /api/documents/upload → /api/v1/documents/upload
 *
 * @param frontendPath - The frontend API path (e.g., /api/chat)
 * @returns The backend API path
 */
export function mapBackendPath(frontendPath: string): string {
  // Remove /api prefix and add /api/v1
  const cleanPath = frontendPath.replace(/^\/api/, '')
  return `/api/v1${cleanPath}`
}

/**
 * Proxy a request to the backend.
 *
 * This is the main utility for forwarding requests from the BFF to the backend.
 * It handles authentication, error normalization, logging, and response forwarding.
 *
 * @param request - The incoming NextRequest
 * @param options - Proxy options
 * @returns NextResponse with backend data or error
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   return proxyToBackend(request, {
 *     backendPath: '/api/v1/chat/history/123',
 *     context: { route: '/api/chat/history/[sessionId]' }
 *   })
 * }
 * ```
 */
export async function proxyToBackend(
  request: NextRequest,
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const {
    method = request.method,
    body,
    headers = {},
    includeAuth = true,
    backendPath,
    context = {},
    cache
  } = options

  // Determine backend path
  const path = backendPath || mapBackendPath(new URL(request.url).pathname)
  const url = `${BACKEND_URL}${path}`

  // Build headers
  const requestHeaders: HeadersInit = { ...headers }

  // Add authorization if required
  if (includeAuth) {
    const authHeader = getAuthHeader(request)
    if (authHeader) {
      requestHeaders['Authorization'] = authHeader
    }
  }

  // Add Content-Type for JSON bodies (but not for FormData)
  if (body && !(body instanceof FormData) && typeof body !== 'string') {
    requestHeaders['Content-Type'] = 'application/json'
  }

  // Log request
  const logContext = Object.keys(context).length
    ? ` [${JSON.stringify(context)}]`
    : ''
  console.log(`[BFF Proxy] ${method} ${path}${logContext}`)

  try {
    // Prepare request body
    let requestBody: BodyInit | undefined
    if (body instanceof FormData) {
      requestBody = body
    } else if (typeof body === 'string') {
      requestBody = body
    } else if (body) {
      requestBody = JSON.stringify(body)
    }

    // Make request to backend
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: requestBody,
      cache
    })

    // Log response status
    console.log(`[BFF Proxy] Backend response: ${response.status}`)

    // Handle error responses
    if (!response.ok) {
      return handleBackendError(response, { ...context, path, method })
    }

    // Forward successful response
    const data = await response.json()
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        // Copy cache control headers from backend
        ...(response.headers.get('cache-control')
          ? { 'Cache-Control': response.headers.get('cache-control')! }
          : {})
      }
    })
  } catch (error) {
    console.error('[BFF Proxy] Request failed:', error)

    return NextResponse.json(
      {
        detail:
          error instanceof Error
            ? `Backend request failed: ${error.message}`
            : 'Backend request failed'
      },
      { status: 502 }
    )
  }
}

/**
 * Create a simple GET proxy handler.
 *
 * @param backendPath - The backend path to proxy to
 * @param context - Optional context for logging
 * @returns Handler function
 *
 * @example
 * ```ts
 * export const GET = createGetProxy('/api/v1/chat/history/{sessionId}', {
 *   route: '/api/chat/history/[sessionId]'
 * })
 * ```
 */
export function createGetProxy(
  backendPath: string,
  context?: Record<string, unknown>
) {
  return async (
    request: NextRequest,
    { params }: { params: Record<string, string> }
  ): Promise<NextResponse> => {
    // Replace path parameters (e.g., {sessionId} → actual value)
    let resolvedPath = backendPath
    for (const [key, value] of Object.entries(params)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, value)
    }

    return proxyToBackend(request, {
      backendPath: resolvedPath,
      context
    })
  }
}

/**
 * Create a simple POST proxy handler.
 *
 * @param backendPath - The backend path to proxy to
 * @param context - Optional context for logging
 * @returns Handler function
 *
 * @example
 * ```ts
 * export const POST = createPostProxy('/api/v1/chat', {
 *   route: '/api/chat'
 * })
 * ```
 */
export function createPostProxy(
  backendPath: string,
  context?: Record<string, unknown>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Parse JSON body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { detail: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    return proxyToBackend(request, {
      method: 'POST',
      body,
      backendPath,
      context
    })
  }
}
