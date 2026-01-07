/**
 * BFF (Next.js API Route) — Message Feedback
 *
 * Submit feedback (like/dislike/none) for a chat message.
 * Proxies to backend and validates message ID format and feedback type.
 *
 * Frontend:
 * - `POST /api/chat/[messageId]/feedback`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/chat/{message_id}/feedback`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - feedback: 'like' | 'dislike' | 'none' (required)
 *
 * Response:
 * - 200: { status: 'success' }
 * - 400: Invalid message ID format or invalid feedback value
 * - 401: Missing authorization header
 * - 403: User doesn't own the message's session
 * - 404: Message not found
 * - 500: Internal server error
 *
 * Chamadores:
 * - `src/components/v2/ChatArea/ChatArea.tsx` (message feedback buttons)
 * - `src/hooks/useChatFeedback.ts` (if exists)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'
import {
  validateAuth,
  isValidUUID,
  parseRequestBody,
  proxyToBackend,
  handleBackendResponse,
  createErrorResponse,
  getBackendHeaders,
  logRouteError,
  ERROR_MESSAGES
} from '@/lib/api/bff-utils'
import type { FeedbackRequest } from '@/types/chat'

type RouteParams = { params: Promise<{ messageId: string }> }

/**
 * POST - Submit feedback for a message
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const ROUTE_NAME = '/api/chat/[messageId]/feedback'

  try {
    // 1. Validate authentication
    const authError = validateAuth(request)
    if (authError) {
      return authError
    }

    const authorization = getAuthorizationFromRequest(request)!
    const { messageId } = await params

    // 2. Validate message ID format (must be UUID)
    if (!isValidUUID(messageId)) {
      return createErrorResponse(ERROR_MESSAGES.INVALID_UUID, 400)
    }

    // 3. Parse and validate request body
    const bodyResult = await parseRequestBody<FeedbackRequest>(request)
    if ('error' in bodyResult) {
      return bodyResult.error
    }

    const { feedback } = bodyResult.data

    // 4. Validate feedback value
    const validFeedbackValues = ['like', 'dislike', 'none']
    if (!validFeedbackValues.includes(feedback)) {
      return createErrorResponse(
        `Invalid feedback value. Must be one of: ${validFeedbackValues.join(', ')}`,
        400
      )
    }

    // 5. Proxy request to backend
    const backendResponse = await proxyToBackend(
      `/api/v1/chat/${messageId}/feedback`,
      {
        method: 'POST',
        headers: getBackendHeaders(authorization),
        body: JSON.stringify({ feedback })
      }
    )

    // 6. Handle backend response
    return handleBackendResponse(
      backendResponse,
      `Failed to submit feedback for message ${messageId}`
    )
  } catch (error) {
    logRouteError(ROUTE_NAME, 'POST', error)
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}
