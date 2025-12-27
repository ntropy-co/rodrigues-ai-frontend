/**
 * BFF (Next.js API Route) - Audit Logs (Recent Activity)
 *
 * Returns recent activity across all users. Admin only.
 *
 * Frontend:
 * - `GET /api/audit/recent` (query: `hours`, `limit`)
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/audit/recent`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 * - Admin access only
 *
 * Callers:
 * - `src/hooks/useAudit.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - Get recent activity across all users (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const hours = searchParams.get('hours') || '24'
    const limit = searchParams.get('limit') || '100'

    const response = await fetch(
      `${BACKEND_URL}/api/v1/audit/recent?hours=${hours}&limit=${limit}`,
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
    console.error('[API Route /api/audit/recent] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch recent activity' },
      { status: 500 }
    )
  }
}
