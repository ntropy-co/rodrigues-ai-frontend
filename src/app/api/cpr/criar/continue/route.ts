/**
 * BFF (Next.js API Route) — CPR Creation Continue
 *
 * Continua workflow de criação de CPR com resposta do usuário.
 *
 * Frontend:
 * - `POST /api/cpr/criar/continue`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/cpr/criar/continue`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - session_id: string (obrigatório)
 * - message: string (resposta do usuário ou confirmação)
 * - step_data?: object (dados do step atual do wizard)
 *
 * Response:
 * - text: string (mensagem do agente)
 * - session_id: string
 * - workflow_type: "criar_cpr"
 * - is_waiting_input: boolean
 * - current_step: string
 * - document_url?: string (URL do documento gerado)
 * - document_data?: object (dados do documento)
 *
 * Chamadores:
 * - `src/hooks/useCPRCreation.ts`
 * - `src/components/v2/CPRWizard/CPRWizard.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ContinueRequest {
  session_id: string
  message: string
  step_data?: Record<string, unknown>
}

export interface WorkflowResponse {
  text: string
  session_id: string
  workflow_type: 'analise_cpr' | 'criar_cpr'
  is_waiting_input: boolean
  current_step: string
  document_url?: string
  document_data?: Record<string, unknown>
}

function validateRequest(body: Partial<ContinueRequest>): string | null {
  if (!body.session_id || typeof body.session_id !== 'string') {
    return 'Campo obrigatório ausente: session_id'
  }
  if (!body.message || typeof body.message !== 'string') {
    return 'Campo obrigatório ausente: message'
  }
  return null
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

    // Parse and validate request body
    const body = await request.json()
    const validationError = validateRequest(body)

    if (validationError) {
      return NextResponse.json({ detail: validationError }, { status: 400 })
    }

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/criar/continue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Erro ao continuar criação de CPR'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/cpr/criar/continue] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Return successful response
    const data: WorkflowResponse = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/cpr/criar/continue] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
