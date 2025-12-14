/**
 * BFF (Next.js API Route) — Logout
 *
 * Faz logout no backend (se aplicável) e permite o frontend limpar o token.
 *
 * Importante: no backend atual, JWT é stateless; logout é essencialmente
 * client-side (remover token). Mesmo assim, mantemos o endpoint por consistência.
 *
 * Frontend:
 * - `POST /api/auth/logout`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/auth/logout`
 *
 * Auth:
 * - Obrigatório no BFF: `Authorization: Bearer <token>`
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { message: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: authorization
      },
      credentials: 'include'
    })

    // Get the response data
    const data = await response.json()

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
