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
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header from the request or HttpOnly cookie
    const authorization = getAuthorizationFromRequest(request)

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
      method: 'POST',
      headers: {
        ...(authorization ? { Authorization: authorization } : {})
      },
      credentials: 'include'
    })

    // Get the response data
    const data = await response.json()

    // Clear HttpOnly auth cookies regardless of backend response
    const jsonResponse = NextResponse.json(data, { status: response.status })
    jsonResponse.cookies.set('verity_access_token', '', {
      path: '/',
      maxAge: 0
    })
    jsonResponse.cookies.set('verity_refresh_token', '', {
      path: '/',
      maxAge: 0
    })

    return jsonResponse
  } catch {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
