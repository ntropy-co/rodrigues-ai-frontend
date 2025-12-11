/**
 * Next.js API Route - Chat Proxy
 *
 * This route acts as a proxy to the backend chat API (Dialogflow)
 * Requires authenticated user (Bearer token)
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Validates if a string is a valid UUID v4
 */
function isValidUUID(str: string | null | undefined): boolean {
  if (!str || typeof str !== 'string') return false
  const trimmed = str.trim()
  if (!trimmed) return false
  // UUID v4 regex pattern
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(trimmed)
}

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

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Parse the request body
    const body = await request.json()
    const { message, session_id } = body

    if (!message) {
      return NextResponse.json(
        { detail: 'Message is required' },
        { status: 400 }
      )
    }

    // Validate session_id format if provided
    // Accept: valid UUID, null, undefined, empty string (treated as null)
    let sanitizedSessionId: string | null = null

    if (session_id !== null && session_id !== undefined && session_id !== '') {
      // session_id was provided, validate it
      if (!isValidUUID(session_id)) {
        console.warn(
          '[API Route /api/chat] Invalid session_id format:',
          session_id
        )
        return NextResponse.json(
          {
            detail:
              'Formato de sessão inválido. Por favor, inicie uma nova conversa.'
          },
          { status: 400 }
        )
      }
      // Sanitize: trim whitespace
      sanitizedSessionId = String(session_id).trim()
    }

    // Forward the request to the backend (trailing slash required by FastAPI)
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify({
        message,
        session_id: sanitizedSessionId
      })
    })

    // Handle error responses from backend
    if (!response.ok) {
      let errorDetail = 'Erro ao processar mensagem'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        // Backend returned non-JSON (e.g., HTML error page)
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API Route /api/chat] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Get the response data
    const data = await response.json()

    // Return the response
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Route /api/chat] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
