/**
 * BFF (Next.js API Route) — Chat History
 *
 * Get conversation history for a specific session.
 * Returns all messages in chronological order with pagination support.
 *
 * Frontend:
 * - `GET /api/chat/history/[sessionId]?skip=0&limit=100`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/chat/history/{session_id}?skip=0&limit=100`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Query Parameters:
 * - skip: Number of messages to skip (default: 0)
 * - limit: Maximum number of messages to return (default: 100)
 *
 * Response:
 * - 200: Array of ConversationMessage objects
 * - 400: Invalid session ID format
 * - 401: Missing authorization header
 * - 403: User doesn't own the session
 * - 404: Session not found
 * - 500: Internal server error
 *
 * Chamadores:
 * - `src/hooks/useChatHistory.ts` (if exists)
 * - `src/components/v2/ChatArea/ChatArea.tsx` (load conversation history)
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  validateAuth,
  isValidSessionId,
  proxyToBackend,
  handleBackendResponse,
  createErrorResponse,
  getBackendHeaders,
  logRouteError,
  ERROR_MESSAGES
} from '@/lib/api/bff-utils'
// ConversationMessage type is used in JSDoc comments

type RouteParams = { params: Promise<{ sessionId: string }> }

/**
 * GET - Get chat history for a session
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const ROUTE_NAME = '/api/chat/history/[sessionId]'

  try {
    // 1. Validate authentication
    const authError = validateAuth(request)
    if (authError) {
      return authError
    }

    const authorization = request.headers.get('authorization')!
    const { sessionId } = await params

    // 2. Validate session ID format (must be s_<uuid>)
    if (!isValidSessionId(sessionId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_SESSION_ID, 400)
    }

    // 3. Extract pagination parameters from query string
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get('skip') || '0'
    const limit = searchParams.get('limit') || '100'

    // 4. Validate pagination parameters
    const skipNum = parseInt(skip, 10)
    const limitNum = parseInt(limit, 10)

    if (isNaN(skipNum) || skipNum < 0) {
      return createErrorResponse('Invalid skip parameter', 400)
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return createErrorResponse(
        'Invalid limit parameter (must be between 1 and 1000)',
        400
      )
    }

    // 5. Build backend URL with query parameters
    const backendUrl = `/api/v1/chat/history/${sessionId}?skip=${skipNum}&limit=${limitNum}`

    // 6. Proxy request to backend
    const backendResponse = await proxyToBackend(backendUrl, {
      method: 'GET',
      headers: getBackendHeaders(authorization, false) // No Content-Type for GET
    })

    // 7. Handle backend response
    return handleBackendResponse(
      backendResponse,
      `Failed to fetch chat history for session ${sessionId}`
    )
  } catch (error) {
    logRouteError(ROUTE_NAME, 'GET', error)
    return createErrorResponse(ERROR_MESSAGES.INTERNAL_ERROR, 500)
  }
}

/**
 * OPTIONS - Handle CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
