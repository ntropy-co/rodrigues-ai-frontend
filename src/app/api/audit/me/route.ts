/**
 * BFF (Next.js API Route) - Audit Logs (Current User)
 *
 * Returns audit logs for the currently authenticated user.
 *
 * Frontend:
 * - `GET /api/audit/me` (query: `action`, `resource_type`, `page`, `page_size`)
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/audit/me`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useAudit.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - Get audit logs for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for filtering and pagination
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const resourceType = searchParams.get('resource_type')
    const page = searchParams.get('page') || '1'
    const pageSize = searchParams.get('page_size') || '50'

    // Build query string
    const params = new URLSearchParams()
    if (action) params.set('action', action)
    if (resourceType) params.set('resource_type', resourceType)
    params.set('page', page)
    params.set('page_size', pageSize)

    const response = await fetch(
      `${BACKEND_URL}/api/v1/audit/me?${params.toString()}`,
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
    console.error('[API Route /api/audit/me] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
