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
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request or HttpOnly cookie
    const authorization = getAuthorizationFromRequest(request)

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

    const contentType = response.headers.get('content-type') || ''
    let data: unknown = null

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { detail: text || 'Unexpected response from backend' }
    }

    // Map backend response to frontend expected format
    // Backend returns: { id, email, full_name, is_active, is_superuser, created_at, organization_id }
    // Frontend expects: { id, email, name, role }
    if (response.ok) {
      return NextResponse.json(
        {
          id: (data as { id: string }).id,
          email: (data as { email: string }).email,
          name: (data as { full_name?: string }).full_name || '',
          role: (data as { is_superuser?: boolean }).is_superuser
            ? 'admin'
            : 'user'
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
