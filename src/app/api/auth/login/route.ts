/**
 * BFF (Next.js API Route) — Login
 *
 * Rota pública usada pelo frontend para obter um JWT (access_token).
 *
 * Frontend:
 * - `POST /api/auth/login`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/auth/login` (OAuth2PasswordRequestForm)
 * - `GET  ${BACKEND_URL}/api/v1/auth/me` (buscar dados do usuário após login)
 *
 * Transformações de contrato:
 * - Frontend envia JSON: `{ email, password }`
 * - Backend espera `application/x-www-form-urlencoded`: `{ username=email, password }`
 * - Frontend recebe: `{ user, organization, expiresAt }`
 *
 * SECURITY:
 * - Tokens are stored ONLY in HttpOnly cookies (not in JSON response)
 * - This prevents XSS attacks from stealing tokens
 *
 * Auth:
 * - Público (retorna Bearer token para uso nas próximas requisições)
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

import { transformBackendUser } from '@/types/auth'
import type { BackendUser } from '@/types/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Parse the JSON request body from frontend
    const body = await request.json()

    // Convert to OAuth2 form-urlencoded format
    // Frontend sends: { email, password }
    // Backend OAuth2 expects: { username, password } as form-urlencoded
    const formData = new URLSearchParams()
    formData.append('username', body.email)
    formData.append('password', body.password)

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })

    // Get the response data
    const data = await response.json()

    // If login successful, fetch user data and build complete response
    // Backend returns: { access_token, token_type }
    // Frontend expects: { token, user, organization, expiresAt }
    if (response.ok && data.access_token) {
      // Fetch user data using the new token
      const userResponse = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${data.access_token}`
        }
      })

      let user = null
      if (userResponse.ok) {
        const userData: BackendUser = await userResponse.json()
        user = transformBackendUser(userData)
      }

      // Calculate expiration (30 minutes for access token, matching backend config)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      // Create response with JSON body
      // SECURITY: tokens are NOT included in JSON response (stored in HttpOnly cookies only)
      const jsonResponse = NextResponse.json(
        {
          user,
          organization: null, // TODO: Backend should return organization in login response
          expiresAt
        },
        { status: response.status }
      )

      // Set HttpOnly cookie with the access token
      // SECURITY: HttpOnly prevents XSS from stealing tokens
      // maxAge matches backend ACCESS_TOKEN_EXPIRE_MINUTES (30 min)
      jsonResponse.cookies.set('auth_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 60 // 30 minutes in seconds (matches backend config)
      })

      // Also set refresh token if available
      // maxAge matches backend REFRESH_TOKEN_EXPIRE_DAYS (30 days)
      if (data.refresh_token) {
        jsonResponse.cookies.set('refresh_token', data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 // 30 days in seconds (matches backend config)
        })
      }

      return jsonResponse
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
