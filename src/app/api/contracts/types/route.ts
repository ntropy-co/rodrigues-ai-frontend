/**
 * BFF (Next.js API Route) - Contract Types
 *
 * Lists available contract types from the backend.
 *
 * Frontend:
 * - `GET /api/contracts/types`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/contracts/types`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useContracts.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - List all available contract types
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/contracts/types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      }
    })

    const data = await response.json()

    // Add cache headers for GET requests
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('[API Route /api/contracts/types] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch contract types' },
      { status: 500 }
    )
  }
}
