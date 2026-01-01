/**
 * BFF (Next.js API Route) - Audit Resource Types
 *
 * Returns all available resource types.
 *
 * Frontend:
 * - `GET /api/audit/resource-types`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/audit/resource-types`
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
 * GET - List all available resource types
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/audit/resource-types`, {
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
        // Cache for longer since resource types rarely change
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('[API Route /api/audit/resource-types] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch resource types' },
      { status: 500 }
    )
  }
}
