/**
 * BFF (Next.js API Route) - Audit Logs (Resource)
 *
 * Returns audit logs for a specific resource. Admin only.
 *
 * Frontend:
 * - `GET /api/audit/resource/:type/:id` (query: `limit`)
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/audit/resource/:type/:id`
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

interface RouteContext {
  params: Promise<{ type: string; id: string }>
}

/**
 * GET - Get audit logs for a specific resource (admin only)
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const { type, id } = await context.params

    // Get query params
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '50'

    const response = await fetch(
      `${BACKEND_URL}/api/v1/audit/resource/${type}/${id}?limit=${limit}`,
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
    console.error(
      '[API Route /api/audit/resource/[type]/[id]] GET Error:',
      error
    )
    return NextResponse.json(
      { detail: 'Failed to fetch resource audit logs' },
      { status: 500 }
    )
  }
}
