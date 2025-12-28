/**
 * Unified error handling for BFF API routes.
 *
 * Provides consistent error responses across all API routes,
 * with proper logging and error normalization.
 */

import { NextResponse } from 'next/server'

/**
 * Standard error response format for BFF routes.
 */
export interface ErrorResponse {
  detail: string
  errors?: Array<{ field: string; message: string }>
}

/**
 * Error types that can occur in BFF routes.
 */
export enum BFFErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  BACKEND_ERROR = 'BACKEND_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

/**
 * Maps error types to HTTP status codes.
 */
const ERROR_STATUS_MAP: Record<BFFErrorType, number> = {
  [BFFErrorType.UNAUTHORIZED]: 401,
  [BFFErrorType.BAD_REQUEST]: 400,
  [BFFErrorType.NOT_FOUND]: 404,
  [BFFErrorType.BACKEND_ERROR]: 502,
  [BFFErrorType.INTERNAL_ERROR]: 500,
  [BFFErrorType.VALIDATION_ERROR]: 422
}

/**
 * Default error messages for each error type.
 */
const DEFAULT_ERROR_MESSAGES: Record<BFFErrorType, string> = {
  [BFFErrorType.UNAUTHORIZED]: 'Authorization required',
  [BFFErrorType.BAD_REQUEST]: 'Invalid request',
  [BFFErrorType.NOT_FOUND]: 'Resource not found',
  [BFFErrorType.BACKEND_ERROR]: 'Backend service error',
  [BFFErrorType.INTERNAL_ERROR]: 'Internal server error',
  [BFFErrorType.VALIDATION_ERROR]: 'Validation failed'
}

/**
 * Create a standardized error response.
 *
 * @param type - The type of error
 * @param message - Optional custom error message
 * @param errors - Optional validation errors
 * @param context - Optional context for logging
 * @returns NextResponse with error details
 *
 * @example
 * ```ts
 * return createErrorResponse(
 *   BFFErrorType.UNAUTHORIZED,
 *   'Token expired',
 *   undefined,
 *   { route: '/api/chat' }
 * )
 * ```
 */
export function createErrorResponse(
  type: BFFErrorType,
  message?: string,
  errors?: Array<{ field: string; message: string }>,
  context?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const statusCode = ERROR_STATUS_MAP[type]
  const detail = message || DEFAULT_ERROR_MESSAGES[type]

  // Log error with context
  const logContext = context ? ` [${JSON.stringify(context)}]` : ''
  console.error(`[BFF Error ${statusCode}] ${type}: ${detail}${logContext}`)

  const body: ErrorResponse = { detail }
  if (errors && errors.length > 0) {
    body.errors = errors
  }

  return NextResponse.json(body, { status: statusCode })
}

/**
 * Handle backend response errors and normalize them.
 *
 * Extracts error details from backend responses and converts
 * them to standardized BFF error responses.
 *
 * @param response - The backend Response object
 * @param context - Optional context for logging
 * @returns NextResponse with normalized error
 *
 * @example
 * ```ts
 * const response = await fetch(backendUrl, ...)
 * if (!response.ok) {
 *   return handleBackendError(response, { route: '/api/chat' })
 * }
 * ```
 */
export async function handleBackendError(
  response: Response,
  context?: Record<string, unknown>
): Promise<NextResponse<ErrorResponse>> {
  let errorDetail = DEFAULT_ERROR_MESSAGES[BFFErrorType.BACKEND_ERROR]
  let validationErrors: Array<{ field: string; message: string }> | undefined

  try {
    const errorData = await response.json()

    // Extract error message
    if (errorData.detail) {
      errorDetail =
        typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail)
    }

    // Extract validation errors if present
    if (errorData.errors && Array.isArray(errorData.errors)) {
      validationErrors = errorData.errors
    }
  } catch {
    // If JSON parsing fails, use HTTP status text
    errorDetail = `Backend error: ${response.status} ${response.statusText}`
  }

  // Map backend status to BFF error type
  let errorType: BFFErrorType
  if (response.status === 401 || response.status === 403) {
    errorType = BFFErrorType.UNAUTHORIZED
  } else if (response.status === 404) {
    errorType = BFFErrorType.NOT_FOUND
  } else if (response.status === 400) {
    errorType = BFFErrorType.BAD_REQUEST
  } else if (response.status === 422) {
    errorType = BFFErrorType.VALIDATION_ERROR
  } else {
    errorType = BFFErrorType.BACKEND_ERROR
  }

  return createErrorResponse(errorType, errorDetail, validationErrors, {
    ...context,
    backendStatus: response.status
  })
}

/**
 * Safe JSON parsing with error handling.
 *
 * @param request - The NextRequest object
 * @param context - Optional context for logging
 * @returns Parsed JSON or error response
 *
 * @example
 * ```ts
 * const result = await safeParseJSON(request, { route: '/api/chat' })
 * if (result.error) return result.error
 * const body = result.data
 * ```
 */
export async function safeParseJSON<T = unknown>(
  request: Request,
  context?: Record<string, unknown>
): Promise<
  { data: T; error: null } | { data: null; error: NextResponse<ErrorResponse> }
> {
  try {
    const data = (await request.json()) as T
    return { data, error: null }
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : 'Invalid JSON in request body'
    return {
      data: null,
      error: createErrorResponse(
        BFFErrorType.BAD_REQUEST,
        errorMsg,
        undefined,
        context
      )
    }
  }
}

/**
 * Wrap an async handler with error boundary.
 *
 * Catches any unhandled errors and returns a standardized 500 response.
 *
 * @param handler - The async handler function
 * @param context - Optional context for logging
 * @returns Wrapped handler with error boundary
 *
 * @example
 * ```ts
 * export const POST = withErrorBoundary(
 *   async (request) => {
 *     // Your handler code
 *   },
 *   { route: '/api/chat' }
 * )
 * ```
 */
export function withErrorBoundary<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
  context?: Record<string, unknown>
): (...args: T) => Promise<R | NextResponse<ErrorResponse>> {
  return async (...args: T): Promise<R | NextResponse<ErrorResponse>> => {
    try {
      return await handler(...args)
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown error occurred'
      console.error('[BFF] Unhandled error:', error)
      return createErrorResponse(
        BFFErrorType.INTERNAL_ERROR,
        errorMsg,
        undefined,
        { ...context, error: String(error) }
      )
    }
  }
}
