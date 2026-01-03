/**
 * BFF (Next.js API Route) — Chat (Non-Streaming)
 *
 * Proxy para o endpoint de chat do backend.
 * Mantém compatibilidade com o hook useAIStreamHandler atual.
 *
 * Frontend:
 * - `POST /api/chat`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/chat/`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - message: string (mensagem do usuário)
 * - session_id: string | null (ID da sessão, null para nova sessão)
 *
 * Response:
 * - text: string (resposta do agente)
 * - session_id: string
 * - message_id?: string (ID da mensagem para feedback)
 *
 * Chamadores:
 * - `src/hooks/useAIStreamHandler.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface ChatRequest {
  message: string
  session_id: string | null
}

export interface ChatResponse {
  text: string
  session_id: string
  message_id?: string
  sources?: string[]
}

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header or extract from HttpOnly cookie
    let authorization = request.headers.get('authorization')

    // If no Authorization header, try to get token from HttpOnly cookie
    if (!authorization) {
      const accessToken = request.cookies.get('access_token')?.value
      if (accessToken) {
        authorization = `Bearer ${accessToken}`
      }
    }

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Parse request body
    let body: ChatRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { detail: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate message
    if (!body.message?.trim()) {
      return NextResponse.json(
        { detail: 'Message is required' },
        { status: 400 }
      )
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify({
        message: body.message.trim(),
        session_id: body.session_id || null
      })
    })

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Erro ao enviar mensagem'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/chat] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Return successful response
    const data: ChatResponse = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/chat] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
