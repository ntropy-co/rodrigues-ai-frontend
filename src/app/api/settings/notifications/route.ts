/**
 * BFF (Next.js API Route) - Settings Notifications
 *
 * Manages user notification preferences.
 *
 * Frontend:
 * - `PATCH /api/settings/notifications` - Update notification settings
 *
 * Backend:
 * - `PATCH ${BACKEND_URL}/api/v1/settings/notifications`
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
 * PATCH - Update notification settings only
 */
export async function PATCH(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/settings/notifications`,
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
    console.error('[API Route /api/settings/notifications] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Failed to update notification settings' },
      { status: 500 }
    )
  }
}
