/**
 * Next.js API Route - Session by ID Proxy
 *
 * Proxies to backend session endpoints:
 * - GET /api/v1/sessions/{session_id} - Get session by ID
 * - PATCH /api/v1/sessions/{session_id} - Update session
 * - DELETE /api/v1/sessions/{session_id} - Delete session
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RouteParams = { params: Promise<{ sessionId: string }> }

/**
 * GET - Get a session by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = request.headers.get('authorization')
    const { sessionId } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/sessions/${sessionId}`,
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
    console.error('[API Route /api/sessions/[sessionId]] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update a session
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = request.headers.get('authorization')
    const { sessionId } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/sessions/${sessionId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/sessions/[sessionId]] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete a session
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = request.headers.get('authorization')
    const { sessionId } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/sessions/${sessionId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: authorization
        }
      }
    )

    // DELETE returns 204 No Content on success
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/sessions/[sessionId]] DELETE Error:', error)
    return NextResponse.json(
      { detail: 'Failed to delete session' },
      { status: 500 }
    )
  }
}
