/**
 * BFF (Next.js API Route) — Verify Reset Token
 *
 * Verifica se um token de redefinição de senha é válido.
 *
 * Frontend:
 * - `GET /api/auth/verify-reset-token/:token`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/auth/verify-reset-token/{token}`
 *
 * Auth:
 * - Público
 *
 * Chamadores:
 * - (opcional) pode ser usado pela tela de reset antes de exibir o formulário.
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const response = await fetch(
      `${BACKEND_URL}/api/v1/auth/verify-reset-token/${token}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/auth/verify-reset-token] Error:', error)
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}
