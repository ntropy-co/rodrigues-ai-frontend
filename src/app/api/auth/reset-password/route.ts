/**
 * BFF (Next.js API Route) — Reset Password
 *
 * Redefine a senha usando um token de reset enviado por e-mail.
 *
 * Frontend:
 * - `POST /api/auth/reset-password`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/auth/reset-password`
 *
 * Auth:
 * - Público (o token de reset substitui a sessão)
 *
 * Transformações de contrato:
 * - Frontend envia: `{ token, password }`
 * - Backend espera: `{ token, new_password }`
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/hooks/useAuthHook.ts`, `src/app/(auth)/reset-password/page.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Map frontend request to backend expected format
    // Frontend sends: { token, password }
    // Backend expects: { token, new_password }
    const backendBody = {
      token: body.token,
      new_password: body.password || body.new_password
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendBody)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/auth/reset-password] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
