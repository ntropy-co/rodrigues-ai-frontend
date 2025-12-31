/**
 * BFF (Next.js API Route) — Register
 *
 * Registra um novo usuário no backend e retorna um token.
 *
 * Frontend:
 * - `POST /api/auth/register`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/auth/register`
 *
 * Auth:
 * - Público
 *
 * Transformações de contrato:
 * - Frontend envia: `{ email, password, name, inviteToken? }`
 * - Backend espera: `{ email, password, full_name }`
 *
 * Chamadores:
 * - `src/lib/auth/api.ts`, `src/contexts/AuthContext.tsx`, `src/hooks/useAuthHook.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body (JSON for register)
    const body = await request.json()

    // Map frontend request to backend expected format
    // Frontend sends: { email, password, name, inviteToken? }
    // Backend expects: { email, password, full_name }
    const backendBody = {
      email: body.email,
      password: body.password,
      full_name: body.name || body.full_name || ''
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendBody)
    })

    // Get the response data
    const data = await response.json()

    // Map backend response to frontend expected format
    // Backend returns: { access_token, token_type, refresh_token? }
    // Frontend expects: { user, organization, expiresAt } (tokens in HttpOnly cookies)
    if (response.ok && data.access_token) {
      const accessToken = data.access_token as string
      const refreshToken = data.refresh_token as string | undefined

      // Fetch user data using the new token (same contract as /api/auth/login)
      const userResponse = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
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

      // Calculate expiration (30 minutes for access token, matching backend config)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      const jsonResponse = NextResponse.json(
        {
          user,
          organization: null,
          expiresAt
        },
        { status: response.status }
      )

      // Set HttpOnly cookie with the access token
      jsonResponse.cookies.set('verity_access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 60
      })

      // Also set refresh token if available
      if (refreshToken) {
        jsonResponse.cookies.set('verity_refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60
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
