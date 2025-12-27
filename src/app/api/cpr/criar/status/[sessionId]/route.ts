/**
 * BFF (Next.js API Route) — CPR Creation Status Polling
 *
 * Polls workflow status for active CPR creation session.
 *
 * Frontend:
 * - `GET /api/cpr/criar/status/[sessionId]`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/cpr/criar/status/{sessionId}`
 *
 * Auth:
 * - HttpOnly cookie: verity_access_token (sent automatically)
 *
 * Response:
 * - text: string
 * - session_id: string
 * - workflow_type: "criar_cpr"
 * - is_waiting_input: boolean
 * - current_step: string
 * - documento_url?: string
 * - documento_gerado?: boolean
 *
 * Callers:
 * - `src/hooks/useCPRWorkflowStatus.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface WorkflowStatusResponse {
  text: string
  session_id: string
  workflow_type: 'analise_cpr' | 'criar_cpr'
  is_waiting_input: boolean
  current_step: string
  documento_url?: string
  documento_gerado?: boolean
  extracted_data?: Record<string, unknown>
  compliance_result?: Record<string, unknown>
  risk_result?: Record<string, unknown>
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params

    // Validate sessionId format (alphanumeric, hyphens, underscores, max 100 chars)
    if (!sessionId || !/^[a-zA-Z0-9_-]{1,100}$/.test(sessionId)) {
      return NextResponse.json(
        { detail: 'Invalid session ID format' },
        { status: 400 }
      )
    }

    // Get cookies from request (HttpOnly cookie sent automatically)
    const cookieHeader = request.headers.get('cookie') || ''

    // Forward to backend with cookie
    const response = await fetch(
      `${BACKEND_URL}/api/v1/cpr/criar/status/${sessionId}`,
      {
        method: 'GET',
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/json'
        }
      }
    )

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Erro ao buscar status do workflow'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/cpr/criar/status] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Return successful response
    const data: WorkflowStatusResponse = await response.json()
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    })
  } catch (error) {
    console.error('[API /api/cpr/criar/status] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
