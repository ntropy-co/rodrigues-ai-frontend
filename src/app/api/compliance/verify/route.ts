/**
 * BFF (Next.js API Route) - Compliance Verification
 *
 * Verifica a conformidade de um documento CPR.
 *
 * Frontend:
 * - `POST /api/compliance/verify`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/compliance/verify`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - document_id?: string (optional document ID)
 * - extracted_data: object (extracted document data)
 *
 * Response:
 * - score: number (0-100)
 * - grade: "A" | "B" | "C" | "D" | "F"
 * - requirements: ComplianceRequirement[]
 * - recommendations: string[]
 * - details: object
 *
 * Chamadores:
 * - `src/hooks/useCompliance.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Request validation schema
interface ComplianceVerifyRequest {
  document_id?: string
  extracted_data: Record<string, unknown>
}

// Validate required fields
function validateRequest(
  body: Partial<ComplianceVerifyRequest>
): string | null {
  if (!body.extracted_data) {
    return 'Campo obrigatório ausente: extracted_data'
  }

  if (
    typeof body.extracted_data !== 'object' ||
    Array.isArray(body.extracted_data)
  ) {
    return 'extracted_data deve ser um objeto'
  }

  if (body.document_id !== undefined && typeof body.document_id !== 'string') {
    return 'document_id deve ser uma string'
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationError = validateRequest(body)

    if (validationError) {
      return NextResponse.json({ detail: validationError }, { status: 400 })
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/v1/compliance/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Erro ao verificar compliance'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/compliance/verify] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Return successful response
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/compliance/verify] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
