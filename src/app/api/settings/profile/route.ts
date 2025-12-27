/**
 * BFF (Next.js API Route) - Settings Profile
 *
 * Manages user profile information.
 *
 * Frontend:
 * - `GET  /api/settings/profile` - Get user profile
 * - `PATCH /api/settings/profile` - Update user profile
 *
 * Backend:
 * - `GET  ${BACKEND_URL}/api/v1/settings/profile`
 * - `PATCH ${BACKEND_URL}/api/v1/settings/profile`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useSettings.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - Get user profile
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/settings/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      }
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('[API Route /api/settings/profile] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/v1/settings/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/settings/profile] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
