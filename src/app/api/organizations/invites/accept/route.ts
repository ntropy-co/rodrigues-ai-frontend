/**
 * BFF (Next.js API Route) — Accept Organization Invite
 *
 * Aceita um convite de organizacao usando o token.
 *
 * Frontend:
 * - `POST /api/organizations/invites/accept`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/organizations/invites/accept`
 *
 * Auth:
 * - Publico (nao requer autenticacao)
 *
 * Request Body:
 * - token: string (obrigatorio)
 * - full_name?: string (opcional, para novos usuarios)
 * - password: string (obrigatorio)
 *
 * Response:
 * - 200: { user: object, organization: object, expiresAt: string }
 * - 400/404: { detail: string }
 *
 * SECURITY:
 * - Tokens are stored ONLY in HttpOnly cookies (not in JSON response)
 * - This prevents XSS attacks from stealing tokens
 *
 * Chamadores:
 * - Formulario de aceite de convite
 */

import { NextRequest, NextResponse } from 'next/server'

import { transformBackendUser } from '@/types/auth'
import type { BackendUser } from '@/types/auth'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.token) {
      return NextResponse.json(
        { detail: 'Token de convite e obrigatorio' },
        { status: 400 }
      )
    }

    if (!body.password) {
      return NextResponse.json(
        { detail: 'Senha e obrigatoria' },
        { status: 400 }
      )
    }

    // Build request body for backend
    const backendBody: {
      token: string
      password: string
      full_name?: string
    } = {
      token: body.token,
      password: body.password
    }

    // Include full_name if provided
    if (body.full_name) {
      backendBody.full_name = body.full_name
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/invites/accept`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendBody)
      }
    )

    const contentType = response.headers.get('content-type') || ''
    const data: unknown = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (!response.ok) {
      const errorData =
        data && typeof data === 'object'
          ? data
          : { detail: data || 'Falha ao aceitar convite' }
      return NextResponse.json(errorData, { status: response.status })
    }

    // If backend returns access_token, set cookies and return user info
    if (
      data &&
      typeof data === 'object' &&
      'access_token' in data &&
      typeof data.access_token === 'string'
    ) {
      const accessToken = data.access_token
      const refreshToken =
        'refresh_token' in data && typeof data.refresh_token === 'string'
          ? data.refresh_token
          : undefined

      // Fetch user data using the new token
      const userResponse = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      let user = null
      if (userResponse.ok) {
        const userData: BackendUser = await userResponse.json()
        user = transformBackendUser(userData)
      }

      // Calculate expiration (30 minutes for access token, matching backend config)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      // Create response WITHOUT tokens in JSON (security)
      const jsonResponse = NextResponse.json(
        {
          user,
          organization: 'organization' in data ? data.organization : null,
          expiresAt
        },
        { status: response.status }
      )

      // Set HttpOnly cookie with the access token
      jsonResponse.cookies.set('auth_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 60 // 30 minutes (matches backend config)
      })

      // Also set refresh token if available
      if (refreshToken) {
        jsonResponse.cookies.set('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 // 30 days (matches backend config)
        })
      }

      return jsonResponse
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/organizations/invites/accept] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
