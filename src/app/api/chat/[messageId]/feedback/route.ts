/**
 * BFF (Next.js API Route) — Chat Feedback
 *
 * Envia feedback (like/dislike/none) para uma mensagem específica.
 *
 * Frontend:
 * - `POST /api/chat/:messageId/feedback`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/chat/{messageId}/feedback`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Validações no BFF:
 * - `messageId` deve ser UUID
 * - `feedback` ∈ { "like", "dislike", "none" }
 *
 * CORS:
 * - Implementa `OPTIONS` para preflight.
 *
 * Chamadores:
 * - `src/components/v2/ChatArea/ChatArea.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Handle CORS preflight requests
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await params

    // Get the Authorization header from the request
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Validate messageId format (UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!messageId || !uuidRegex.test(messageId)) {
      return NextResponse.json(
        { detail: 'Invalid message ID format' },
        { status: 400 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { feedback } = body

    if (!feedback || !['like', 'dislike', 'none'].includes(feedback)) {
      return NextResponse.json(
        {
          detail:
            'Invalid feedback value. Must be "like", "dislike", or "none".'
        },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(
      `${BACKEND_URL}/api/v1/chat/${messageId}/feedback`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify({ feedback })
      }
    )

    // Handle error responses from backend
    if (!response.ok) {
      let errorDetail = 'Erro ao enviar feedback'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error(
        '[API Route /api/chat/.../feedback] Backend error:',
        errorDetail
      )
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Get the response data
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Route /api/chat/.../feedback] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
