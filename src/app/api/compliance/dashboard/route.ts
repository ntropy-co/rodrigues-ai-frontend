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

    const data: {
      total_documents?: number
      approved?: number
      documents?: Array<{
        document_id: string
        score: number
        grade: string
        verified_at: string
      }>
    } = await response.json()

    const totalVerified = data.total_documents ?? 0
    const approved = data.approved ?? 0
    const complianceRate =
      totalVerified > 0 ? (approved / totalVerified) * 100 : 0

    const recentVerifications = Array.isArray(data.documents)
      ? data.documents
          .slice()
          .sort(
            (a, b) =>
              new Date(b.verified_at).getTime() -
              new Date(a.verified_at).getTime()
          )
          .map((doc) => ({
            id: doc.document_id,
            document_id: doc.document_id,
            score: doc.score,
            grade: doc.grade,
            verified_at: doc.verified_at
          }))
      : []

    return NextResponse.json(
      {
        total_verified: totalVerified,
        compliance_rate: complianceRate,
        recent_verifications: recentVerifications
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /api/compliance/dashboard] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
