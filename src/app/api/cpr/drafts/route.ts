/**
 * BFF (Next.js API Route) - CPR Drafts
 *
 * Frontend:
 * - POST /api/cpr/drafts
 *
 * Backend:
 * - POST ${BACKEND_URL}/api/v1/cpr/drafts
 *
 * Auth:
 * - Cookie HttpOnly or Authorization header
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization required' },
        { status: 401 }
      )
    }

    let body = {}
    try {
      body = await request.json()
    } catch {
      // Empty body is allowed
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      let errorDetail = 'Erro ao criar draft'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/cpr/drafts] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[API /api/cpr/drafts] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
