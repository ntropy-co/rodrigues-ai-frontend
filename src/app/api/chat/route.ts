/**
 * Next.js API Route - Chat Proxy
 *
 * This route acts as a proxy to the backend chat API (Dialogflow)
 * Requires authenticated user (Bearer token)
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

    // Forward the request to the backend (trailing slash required by FastAPI)
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify({
        message,
        session_id: session_id || null
      })
    })

    // Get the response data
    const data = await response.json()

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/chat] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
