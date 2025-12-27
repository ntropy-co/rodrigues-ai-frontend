/**
 * BFF (Next.js API Route) — Validate Organization Invite Token
 *
 * Valida um token de convite de organização.
 *
 * Frontend:
 * - `GET /api/organizations/invites/validate/:token`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/organizations/invites/{token}/validate`
 *
 * Auth:
 * - Publico (nao requer autenticacao)
 *
 * Response:
 * - 200: { valid: true, email: string, organization_name: string, role: string, expires_at: string }
 * - 400/404: { detail: string }
 *
 * Chamadores:
 * - Pagina de aceite de convite, hooks de validacao de convite
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { detail: 'Token de convite e obrigatorio' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/invites/${encodeURIComponent(token)}/validate`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    const contentType = response.headers.get('content-type') || ''
    const data: unknown = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (!response.ok) {
      const errorData =
        data && typeof data === 'object'
          ? data
          : { detail: data || 'Falha ao validar convite' }
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(
      '[API Route /api/organizations/invites/validate/[token]] Error:',
      error
    )
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
