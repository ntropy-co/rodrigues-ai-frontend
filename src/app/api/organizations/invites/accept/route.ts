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
 * - 200: { access_token: string, token_type: string, user: object, organization: object }
 * - 400/404: { detail: string }
 *
 * Chamadores:
 * - Formulario de aceite de convite
 */

import { NextRequest, NextResponse } from 'next/server'

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

    // If backend returns access_token, map to frontend expected format
    if (
      data &&
      typeof data === 'object' &&
      'access_token' in data &&
      typeof data.access_token === 'string'
    ) {
      const accessToken = data.access_token

      // Fetch user data using the new token
      const userResponse = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      let user = null
      if (userResponse.ok) {
        const userData = (await userResponse.json()) as {
          id: string
          email: string
          full_name?: string
          is_superuser?: boolean
        }
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
          refreshToken:
            'refresh_token' in data ? data.refresh_token : undefined,
          user,
          organization: 'organization' in data ? data.organization : null,
          expiresAt
        },
        { status: response.status }
      )
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
