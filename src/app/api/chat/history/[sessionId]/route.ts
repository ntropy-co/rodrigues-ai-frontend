/**
 * BFF (Next.js API Route) — Chat History
 *
 * Fetches conversation history for a session from the backend.
 *
 * Frontend:
 * - `GET /api/chat/history/[sessionId]`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/chat/history/{session_id}`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Response format:
 * Backend returns: ConversationPublic[] { id, session_id, message, response, model_used, feedback, created_at }
 * This route transforms to: PlaygroundChatMessage[] { id, role, content, feedback, created_at }
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface BackendConversation {
  id: string
  session_id: string
  user_id?: string
  message: string
  response: string
  model_used: string
  feedback?: string | null
  created_at: string
}

interface PlaygroundChatMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  feedback?: 'like' | 'dislike' | null
  created_at: number
}

/**
 * Transform backend conversations to frontend message format.
 * Each conversation becomes 2 messages: user message + agent response.
 */
function transformConversations(
  conversations: BackendConversation[]
): PlaygroundChatMessage[] {
  const messages: PlaygroundChatMessage[] = []

  for (const conv of conversations) {
    const timestamp = new Date(conv.created_at).getTime()

    // User message
    messages.push({
      id: `${conv.id}-user`,
      role: 'user',
      content: conv.message,
      created_at: timestamp
    })

    // Agent response
    messages.push({
      id: conv.id,
      role: 'agent',
      content: conv.response,
      feedback: conv.feedback as 'like' | 'dislike' | null,
      created_at: timestamp + 1 // +1ms to ensure proper ordering
    })
  }

  return messages
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // Get the Authorization header from the request
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Validate session_id format
    if (!sessionId || !sessionId.startsWith('s_')) {
      return NextResponse.json(
        { detail: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Fetch history from backend
    const response = await fetch(
      `${BACKEND_URL}/api/v1/chat/history/${sessionId}`,
      {
        method: 'GET',
        headers: {
          Authorization: authorization
        }
      }
    )

    if (!response.ok) {
      let errorDetail = 'Erro ao buscar histórico'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API Route /api/chat/history] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const conversations: BackendConversation[] = await response.json()

    // Transform to frontend format
    const messages = transformConversations(conversations)

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('[API Route /api/chat/history] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
