/**
 * BFF (Next.js API Route) - CPR Draft Submit
 *
 * Frontend:
 * - POST /api/cpr/drafts/:draftId/submit
 *
 * Backend:
 * - POST ${BACKEND_URL}/api/v1/cpr/drafts/:draftId/submit
 *
 * Auth:
 * - Cookie HttpOnly or Authorization header
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ draftId: string }> }
) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization required' },
        { status: 401 }
      )
    }

    const { draftId } = await context.params
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/cpr/drafts/${draftId}/submit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      let errorDetail = 'Erro ao enviar draft'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error(
        '[API /api/cpr/drafts/:id/submit] Backend error:',
        errorDetail
      )
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/cpr/drafts/:id/submit] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
