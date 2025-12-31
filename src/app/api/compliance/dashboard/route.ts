/**
 * BFF (Next.js API Route) - Compliance Dashboard
 *
 * Obtém dados do dashboard de compliance.
 *
 * Frontend:
 * - `GET /api/compliance/dashboard`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/compliance/dashboard`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Response:
 * - total_verified: number
 * - compliance_rate: number (0-100)
 * - recent_verifications: RecentVerification[]
 *
 * Chamadores:
 * - `src/hooks/useCompliance.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/v1/compliance/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      }
    })

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Erro ao obter dashboard de compliance'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error(
        '[API /api/compliance/dashboard] Backend error:',
        errorDetail
      )
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Return successful response
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/compliance/dashboard] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
