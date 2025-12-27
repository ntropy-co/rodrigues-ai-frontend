/**
 * BFF (Next.js API Route) — Current User
 *
 * Retorna o usuário atual (perfil) a partir do Bearer token.
 *
 * Frontend:
 * - `GET /api/auth/me`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/auth/me`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Transformações de contrato:
 * - Backend (ex.): `{ id, email, full_name, is_superuser, ... }`
 * - Frontend: `{ id, email, name, role }`
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request or from HttpOnly cookie
    let authorization = request.headers.get('authorization')

    // If no Authorization header, check for auth_token cookie
    if (!authorization) {
      const authToken = request.cookies.get('auth_token')?.value
      if (authToken) {
        authorization = `Bearer ${authToken}`
      }
    }

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: authorization
      }
    })

    // Get the response data
    const data = await response.json()

    // Map backend response to frontend expected format
    // Backend returns: { id, email, full_name, is_active, is_superuser, created_at, organization_id }
    // Frontend expects: { id, email, name, role }
    if (response.ok) {
      return NextResponse.json(
        {
          id: data.id,
          email: data.email,
          name: data.full_name || '',
          role: data.is_superuser ? 'admin' : 'user'
        },
        { status: response.status }
      )
    }

    // Return error response as-is
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
