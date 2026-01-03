/**
 * BFF (Next.js API Route) — Chat Streaming (SSE)
 *
 * Passthrough de Server-Sent Events do backend.
 * Permite streaming em tempo real das respostas do LLM.
 *
 * Frontend:
 * - `POST /api/chat/stream`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/chat/stream`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - message: string (mensagem do usuário)
 * - session_id: string (ID da sessão)
 *
 * Response (SSE stream):
 * - data: {"type": "content", "content": "..."}\n\n
 * - data: {"type": "usage", "usage": {...}}\n\n
 * - data: {"type": "done"}\n\n
 * - data: [DONE]\n\n
 *
 * Chamadores:
 * - `src/hooks/useAIStreamHandler.tsx` (streaming mode)
 */

import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface StreamChatRequest {
  message: string
  session_id: string
}

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header or extract from HttpOnly cookie
    let authorization = request.headers.get('authorization')

    // If no Authorization header, try to get token from HttpOnly cookie
    if (!authorization) {
      const accessToken = request.cookies.get('verity_access_token')?.value
      if (accessToken) {
        authorization = `Bearer ${accessToken}`
      }
    }

    if (!authorization) {
      return new Response(
        JSON.stringify({ detail: 'Authorization header required' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    let body: StreamChatRequest
    try {
      body = await request.json()
    } catch {
      return new Response(JSON.stringify({ detail: 'Invalid request body' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate required fields
    if (!body.message?.trim()) {
      return new Response(JSON.stringify({ detail: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!body.session_id) {
      return new Response(
        JSON.stringify({ detail: 'Session ID is required for streaming' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Forward to backend streaming endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify({
        message: body.message.trim(),
        session_id: body.session_id
      })
    })

    // Handle error responses
    if (!backendResponse.ok) {
      let errorDetail = 'Erro ao iniciar streaming'
      try {
        const errorData = await backendResponse.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${backendResponse.status} ${backendResponse.statusText}`
      }
      console.error('[API /api/chat/stream] Backend error:', errorDetail)
      return new Response(JSON.stringify({ detail: errorDetail }), {
        status: backendResponse.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Check if we got a stream
    if (!backendResponse.body) {
      console.error('[API /api/chat/stream] No response body from backend')
      return new Response(
        JSON.stringify({ detail: 'No stream from backend' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Passthrough the SSE stream with proper headers
    return new Response(backendResponse.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no' // Disable nginx buffering
      }
    })
  } catch (error) {
    console.error('[API /api/chat/stream] Error:', error)
    return new Response(JSON.stringify({ detail: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
