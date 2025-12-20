/**
 * BFF (Next.js API Route) — Invite Validation
 *
 * Valida um token de convite usado no fluxo de signup.
 *
 * Frontend:
 * - `GET /api/auth/invite/validate?token=<invite_token>`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/auth/invite/validate?token=...`
 *
 * Auth:
 * - Público
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/hooks/useInviteValidation.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { detail: 'Token de convite é obrigatório' },
        { status: 400 }
      )
    }

    const backendUrl = new URL(`${BACKEND_URL}/api/v1/auth/invite/validate`)
    backendUrl.searchParams.set('token', token)

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const contentType = response.headers.get('content-type') || ''
    const data: unknown = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (!response.ok) {
      const errorData =
        data && typeof data === 'object'
          ? data
          : { detail: data || 'Request failed' }
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/auth/invite/validate] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
