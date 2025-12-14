/**
 * BFF (Next.js API Route) — Documents by Conversation/Session
 *
 * Busca documentos associados a uma sessão (o backend chama de `conversation_id`,
 * mas na prática é o mesmo `session_id`).
 *
 * Frontend:
 * - `GET /api/documents/conversation?conversation_id=<session_id>`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/documents/conversation?conversation_id=...`
 *
 * Auth:
 * - Obrigatório no BFF: `Authorization: Bearer <token>`
 *
 * Response esperado (backend):
 * - `{ files: [...], count: number }`
 *
 * Chamadores:
 * - `src/hooks/useChatFiles.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Get conversation_id from query params
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversation_id')

    if (!conversationId) {
      return NextResponse.json(
        { detail: 'conversation_id is required' },
        { status: 400 }
      )
    }

    // Forward the request to the backend
    const targetUrl = `${BACKEND_URL}/api/v1/documents/conversation?conversation_id=${encodeURIComponent(conversationId)}`
    console.log('[Proxy] Fetching documents from:', targetUrl)

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      }
    })

    // Handle error responses from backend
    if (!response.ok) {
      // If backend doesn't have this endpoint, return empty array
      if (response.status === 404) {
        return NextResponse.json({ documents: [] }, { status: 200 })
      }

      let errorDetail = 'Erro ao carregar documentos'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error(
        '[API Route /api/documents/conversation] Backend error:',
        errorDetail
      )
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Get the response data
    const data = await response.json()

    // Return the response with cache headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('[API Route /api/documents/conversation] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
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
