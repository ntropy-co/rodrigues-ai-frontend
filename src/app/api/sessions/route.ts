/**
 * Next.js API Route - Sessions Proxy
 *
 * Proxies to backend session endpoints:
 * - GET /api/v1/sessions/ - List user sessions
 * - POST /api/v1/sessions/ - Create new session
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - List all sessions for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get('skip') || '0'
    const limit = searchParams.get('limit') || '100'

    const response = await fetch(
      `${BACKEND_URL}/api/v1/sessions/?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/sessions] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new session
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Body is optional - can create session with defaults
    let body = null
    try {
      body = await request.json()
    } catch {
      // Empty body is valid
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/sessions/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: body ? JSON.stringify(body) : undefined
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/sessions] POST Error:', error)
    return NextResponse.json(
      { detail: 'Failed to create session' },
      { status: 500 }
    )
  }
}
