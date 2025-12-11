/**
 * Next.js API Route - Chat Proxy
 *
 * This route acts as a proxy to the backend chat API (Dialogflow)
 * Requires authenticated user (Bearer token)
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Validates if a string is a valid session ID (s_xxx format from backend)
 * Accepts: null, undefined, empty string (backend will create new session)
 * Accepts: strings starting with "s_" (existing session from backend)
 */
function isValidSessionId(str: string | null | undefined): boolean {
  // null/undefined/empty is valid - backend will create a new session
  if (!str || typeof str !== 'string') return true
  const trimmed = str.trim()
  if (!trimmed) return true
  // Session IDs from backend start with "s_" prefix
  return trimmed.startsWith('s_') && trimmed.length > 3
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
    // Accept: null, undefined, empty string (backend will create new session)
    // Accept: strings starting with "s_" (existing session from backend)
    let sanitizedSessionId: string | null = null

    if (session_id !== null && session_id !== undefined && session_id !== '') {
      // session_id was provided, validate it
      if (!isValidSessionId(session_id)) {
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
