/**
 * BFF (Next.js API Route) — Session by ID
 *
 * Obtém/atualiza/remove uma sessão específica.
 *
 * Frontend:
 * - `GET    /api/sessions/:sessionId`
 * - `PATCH  /api/sessions/:sessionId`
 * - `DELETE /api/sessions/:sessionId`
 *
 * Backend:
 * - `GET    ${BACKEND_URL}/api/v1/sessions/{sessionId}`
 * - `PATCH  ${BACKEND_URL}/api/v1/sessions/{sessionId}`
 * - `DELETE ${BACKEND_URL}/api/v1/sessions/{sessionId}`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Chamadores:
 * - `src/hooks/useSessions.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { isValidSessionId, parseRequestBody } from '@/lib/api/bff-utils'

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

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { detail: 'Invalid session ID format' },
        { status: 400 }
      )
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

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { detail: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Parse and validate request body
    const bodyResult = await parseRequestBody<{
      title?: string
      status?: string
    }>(request)

    if ('error' in bodyResult) {
      return bodyResult.error
    }

    const body = bodyResult.data

    // Validate allowed fields and constraints
    const allowedFields = ['title', 'status']
    const invalidFields = Object.keys(body).filter(
      (key) => !allowedFields.includes(key)
    )

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { detail: `Unexpected fields: ${invalidFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate title length if provided
    if (body.title !== undefined && body.title.length > 200) {
      return NextResponse.json(
        { detail: 'Title must be 200 characters or less' },
        { status: 400 }
      )
    }

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

    if (!isValidSessionId(sessionId)) {
      return NextResponse.json(
        { detail: 'Invalid session ID format' },
        { status: 400 }
      )
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
