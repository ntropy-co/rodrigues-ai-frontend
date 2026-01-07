/**
 * BFF (Next.js API Route) - Contract Generation
 *
 * Generates contract documents (PDF/DOCX) from the backend.
 *
 * Frontend:
 * - `POST /api/contracts/generate`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/contracts/generate`
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

/**
 * POST - Generate a contract document
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/v1/contracts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/contracts/generate] POST Error:', error)
    return NextResponse.json(
      { detail: 'Failed to generate contract' },
      { status: 500 }
    )
  }
}
