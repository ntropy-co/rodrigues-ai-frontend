/**
 * BFF (Next.js API Route) - Settings
 *
 * Manages user settings (notifications + UI preferences).
 *
 * Frontend:
 * - `GET  /api/settings` - Get all user settings
 * - `PATCH /api/settings` - Update notifications and/or UI preferences
 *
 * Backend:
 * - `GET  ${BACKEND_URL}/api/v1/settings`
 * - `PATCH ${BACKEND_URL}/api/v1/settings`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useSettings.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - Get all user settings (profile, notifications, UI preferences)
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/settings`, {
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
    console.error('[API Route /api/settings] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update user settings (notifications and/or UI preferences)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/v1/settings`, {
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
    console.error('[API Route /api/settings] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
