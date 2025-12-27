/**
 * BFF (Next.js API Route) — CPR Creation Start
 *
 * Inicia workflow de criação de CPR com LangGraph.
 *
 * Frontend:
 * - `POST /api/cpr/criar/start`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/cpr/criar/start`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - session_id?: string (opcional, para retomar sessão existente)
 * - initial_data?: object (dados iniciais do CPR Wizard)
 *
 * Response:
 * - text: string (mensagem do agente)
 * - session_id: string
 * - workflow_type: "criar_cpr"
 * - is_waiting_input: boolean
 * - current_step: string
 *
 * Chamadores:
 * - `src/hooks/useCPRCreation.ts`
 * - `src/components/v2/CPRWizard/CPRWizard.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface WorkflowResponse {
  text: string
  session_id: string
  workflow_type: 'analise_cpr' | 'criar_cpr'
  is_waiting_input: boolean
  current_step: string
  document_url?: string
  document_data?: Record<string, unknown>
}

interface StartRequest {
  session_id?: string
  initial_data?: Record<string, unknown>
}

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Parse request body (optional)
    let body: StartRequest = {}
    try {
      body = await request.json()
    } catch {
      // Empty body is fine
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/criar/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Erro ao iniciar criação de CPR'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/cpr/criar/start] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Return successful response
    const data: WorkflowResponse = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/cpr/criar/start] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
