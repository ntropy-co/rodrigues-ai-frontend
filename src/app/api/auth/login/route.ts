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
 * - Frontend recebe: `{ token, user, organization, expiresAt }`
 *   onde `token` é o `access_token` do backend.
 *
 * Auth:
 * - Público (retorna Bearer token para uso nas próximas requisições)
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

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
        const userData = await userResponse.json()
        user = {
          id: userData.id,
          email: userData.email,
          name: userData.full_name || '',
          role: userData.is_superuser ? 'admin' : 'user'
        }
      }

      // Calculate expiration (8 days from now, matching backend)
      const expiresAt = new Date(
        Date.now() + 8 * 24 * 60 * 60 * 1000
      ).toISOString()

      // Create response with JSON body
      const jsonResponse = NextResponse.json(
        {
          token: data.access_token,
          refreshToken: data.refresh_token,
          user,
          organization: null, // Backend doesn't have organization yet
          expiresAt
        },
        { status: response.status }
      )

      // Set HttpOnly cookie with the access token
      // This allows subsequent requests to automatically include auth
      jsonResponse.cookies.set('auth_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 8 * 24 * 60 * 60 // 8 days in seconds
      })

      // Also set refresh token if available
      if (data.refresh_token) {
        jsonResponse.cookies.set('refresh_token', data.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
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
