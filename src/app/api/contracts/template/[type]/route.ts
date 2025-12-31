/**
 * BFF (Next.js API Route) - Contract Template
 *
 * Gets the template structure for a specific contract type.
 *
 * Frontend:
 * - `GET /api/contracts/template/:type`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/contracts/template/{contract_type}`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useContracts.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RouteParams = { params: Promise<{ type: string }> }

/**
 * GET - Get template fields for a contract type
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = getAuthorizationFromRequest(request)
    const { type } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/contracts/template/${type}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()

    // Add cache headers for GET requests
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error(
      '[API Route /api/contracts/template/[type]] GET Error:',
      error
    )
    return NextResponse.json(
      { detail: 'Failed to fetch contract template' },
      { status: 500 }
    )
  }
}
