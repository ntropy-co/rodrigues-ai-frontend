/**
 * BFF (Next.js API Route) - Audit Logs (Security Events)
 *
 * Returns security-related events (failed logins, access denied, etc.). Admin only.
 *
 * Frontend:
 * - `GET /api/audit/security` (query: `hours`)
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/audit/security`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 * - Admin access only
 *
 * Callers:
 * - `src/hooks/useAudit.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - Get security events (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const hours = searchParams.get('hours') || '24'

    const response = await fetch(
      `${BACKEND_URL}/api/v1/audit/security?hours=${hours}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('[API Route /api/audit/security] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch security events' },
      { status: 500 }
    )
  }
}
