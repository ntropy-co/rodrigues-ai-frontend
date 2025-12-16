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
    // Frontend expects: { token, refreshToken?, user, organization, expiresAt }
    if (response.ok && data.access_token) {
      const accessToken = data.access_token as string

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

      // Calculate expiration (8 days from now, matching backend)
      const expiresAt = new Date(
        Date.now() + 8 * 24 * 60 * 60 * 1000
      ).toISOString()

      return NextResponse.json(
        {
          token: accessToken,
          refreshToken: data.refresh_token,
          user,
          organization: null,
          expiresAt
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
