/**
 * BFF (Next.js API Route) - Audit Action Types
 *
 * Returns all available audit action types.
 *
 * Frontend:
 * - `GET /api/audit/actions`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/audit/actions`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useAudit.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - List all available audit action types
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/audit/actions`, {
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
        // Cache for longer since action types rarely change
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('[API Route /api/audit/actions] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch audit actions' },
      { status: 500 }
    )
  }
}
