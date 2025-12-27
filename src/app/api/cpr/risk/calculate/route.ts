/**
 * BFF (Next.js API Route) — CPR Risk Calculator
 *
 * Calcula o risco de crédito de uma operação CPR.
 *
 * Frontend:
 * - `POST /api/cpr/risk/calculate`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/cpr/risk/calculate`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - commodity: string (soja, milho, etc)
 * - quantity: number
 * - unit: string (sacas, toneladas)
 * - total_value: number
 * - issue_date: string (DD/MM/YYYY)
 * - maturity_date: string (DD/MM/YYYY)
 * - has_guarantees: boolean
 * - guarantee_value?: number
 * - unit_price?: number
 * - historical_volatility?: number
 *
 * Response:
 * - overall_score: number (0-100)
 * - risk_level: "baixo" | "medio" | "alto"
 * - factors: RiskFactor[]
 * - recommendations: string[]
 * - details: object
 *
 * Chamadores:
 * - `src/hooks/useRiskCalculator.ts`
 * - `src/components/v2/RiskCalculator/RiskCalculator.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Request validation schema
interface RiskCalculateRequest {
  commodity: string
  quantity: number
  unit: string
  total_value: number
  issue_date: string
  maturity_date: string
  has_guarantees: boolean
  guarantee_value?: number
  unit_price?: number
  historical_volatility?: number
}

// Validate required fields
function validateRequest(body: Partial<RiskCalculateRequest>): string | null {
  const required: (keyof RiskCalculateRequest)[] = [
    'commodity',
    'quantity',
    'unit',
    'total_value',
    'issue_date',
    'maturity_date',
    'has_guarantees'
  ]

  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      return `Campo obrigatório ausente: ${field}`
    }
  }

  // Validate numeric fields
  if (typeof body.quantity !== 'number' || body.quantity <= 0) {
    return 'Quantidade deve ser um número positivo'
  }
  if (typeof body.total_value !== 'number' || body.total_value <= 0) {
    return 'Valor total deve ser um número positivo'
  }

  // Validate date format (DD/MM/YYYY)
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
  if (!dateRegex.test(body.issue_date || '')) {
    return 'Data de emissão deve estar no formato DD/MM/YYYY'
  }
  if (!dateRegex.test(body.maturity_date || '')) {
    return 'Data de vencimento deve estar no formato DD/MM/YYYY'
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
    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/risk/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Erro ao calcular risco'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/cpr/risk/calculate] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Return successful response
    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/cpr/risk/calculate] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
