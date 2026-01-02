/**
 * BFF (Next.js API Route) - Compliance Verification
 *
 * Verifica a conformidade de um documento CPR.
 *
 * Frontend:
 * - `POST /api/compliance/verify`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/compliance/documents/{document_id}/verify`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - document_id: string (document ID)
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
  force_refresh?: boolean
}

interface BackendComplianceItem {
  id: number
  requirement: string
  status: string
  severity: string
  detail?: string | null
  suggestion?: string | null
}

interface BackendComplianceResponse {
  document_id: string
  compliance_id: string
  score: number
  status: string
  grade: string
  items: BackendComplianceItem[]
  summary: Record<string, unknown>
  recommendations: string[]
  verified_at: string
  cached?: boolean
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

  if (!body.document_id) {
    return 'Campo obrigatório ausente: document_id'
  }

  if (typeof body.document_id !== 'string') {
    return 'document_id deve ser uma string'
  }

  return null
}

function mapRequirementStatus(status: string): 'passed' | 'failed' | 'warning' {
  switch (status) {
    case 'ok':
      return 'passed'
    case 'not_applicable':
      return 'warning'
    case 'incomplete':
    case 'missing':
    default:
      return 'failed'
  }
}

function mapSeverity(severity: string): 'critical' | 'major' | 'minor' {
  switch (severity) {
    case 'critical':
      return 'critical'
    case 'high':
      return 'major'
    case 'medium':
      return 'major'
    case 'low':
    default:
      return 'minor'
  }
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

    const documentId = body.document_id as string

    // Forward to backend
    const response = await fetch(
      `${BACKEND_URL}/api/v1/compliance/documents/${encodeURIComponent(documentId)}/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify({
          extracted_data: body.extracted_data,
          force_refresh: body.force_refresh ?? false
        })
      }
    )

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
    const data: BackendComplianceResponse = await response.json()

    const requirements = Array.isArray(data.items)
      ? data.items.map((item) => ({
          id: String(item.id),
          name: item.requirement,
          status: mapRequirementStatus(item.status),
          description: item.detail || item.suggestion || undefined,
          severity: mapSeverity(item.severity)
        }))
      : []

    return NextResponse.json(
      {
        score: data.score,
        grade: data.grade,
        requirements,
        recommendations: data.recommendations || [],
        details: {
          document_id: data.document_id,
          compliance_id: data.compliance_id,
          status: data.status,
          summary: data.summary,
          items: data.items,
          verified_at: data.verified_at,
          cached: data.cached ?? false
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API /api/compliance/verify] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
