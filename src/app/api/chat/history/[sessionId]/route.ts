/**
 * BFF (Next.js API Route) — Chat History by Session
 *
 * Obtém o histórico de mensagens de uma sessão de chat.
 *
 * Frontend:
 * - `GET /api/chat/history/:sessionId`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/chat/history/{sessionId}`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Chamadores:
 * - `src/features/chat/hooks/useChatActions.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'
import { isValidSessionId } from '@/lib/api/bff-utils'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RouteParams = { params: Promise<{ sessionId: string }> }

/**
 * GET - Get chat history for a session
 *
 * Returns messages in the format expected by the frontend:
 * { messages: PlaygroundChatMessage[] }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = getAuthorizationFromRequest(request)
    const { sessionId } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { detail: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Get query params for pagination
    const url = new URL(request.url)
    const skip = url.searchParams.get('skip') || '0'
    const limit = url.searchParams.get('limit') || '100'

    const response = await fetch(
      `${BACKEND_URL}/api/v1/chat/history/${sessionId}?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(
        '[API Route /api/chat/history/[sessionId]] Backend error:',
        errorData
      )
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to fetch chat history' },
        { status: response.status }
      )
    }

    // Backend returns list of ConversationPublic
    // Each conversation has: id, session_id, message (user), response (assistant), created_at
    // Transform to the format expected by frontend
    const conversations = await response.json()

    // Map backend format to frontend PlaygroundChatMessage format
    // Each conversation becomes 2 messages: user message + assistant response
    interface ConversationPublic {
      id: string
      message: string
      response: string
      created_at: string
      session_id: string
      user_id?: string
      model_used?: string
      feedback?: string | null
      trace_id?: string | null
    }

    const messages: Array<{
      id: string
      role: 'user' | 'assistant'
      content: string
      created_at: string
      session_id: string
    }> = []

    conversations.forEach((conv: ConversationPublic) => {
      // Add user message
      messages.push({
        id: `${conv.id}_user`,
        role: 'user',
        content: conv.message,
        created_at: conv.created_at,
        session_id: conv.session_id
      })

      // Add assistant response
      messages.push({
        id: `${conv.id}_assistant`,
        role: 'assistant',
        content: conv.response,
        created_at: conv.created_at,
        session_id: conv.session_id
      })
    })

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('[API Route /api/chat/history/[sessionId]] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}
