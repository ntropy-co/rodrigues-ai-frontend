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
 *   Returns: { access_token, refresh_token, token_type, user }
 *
 * OPTIMIZED: User data is now included in login response, eliminating
 * the need for a separate /auth/me call (saves ~300ms).
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

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'

type BackendUser = {
  id: string
  organization_id?: string | null
  full_name?: string | null
  phone_number?: string | null
  job_title?: string | null
  avatar_url?: string | null
  company_name?: string | null
  created_at?: string | null
}

type BackendLoginResponse = {
  access_token: string
  refresh_token?: string
  user?: BackendUser
}

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

    const contentType = response.headers.get('content-type') || ''
    let data: unknown = null

    if (contentType.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      data = { detail: text || 'Unexpected response from backend' }
    }

    // If login successful, build complete response
    // Backend now returns: { access_token, token_type, user }
    // Frontend expects: { user, organization, expiresAt }
    if (
      response.ok &&
      typeof data === 'object' &&
      data !== null &&
      'access_token' in data
    ) {
      // Use user data directly from backend response (no separate /auth/me call needed)
      let user = null
      const payload = data as BackendLoginResponse
      if (payload.user) {
        // Backend already returns UserPublic, transform to frontend format
        user = {
          id: payload.user.id,
          organizationId: payload.user.organization_id,
          name: payload.user.full_name || 'Usuário',
          fullName: payload.user.full_name,
          role: 'analyst', // Default role, backend should add this
          phoneNumber: payload.user.phone_number,
          jobTitle: payload.user.job_title,
          avatarUrl: payload.user.avatar_url,
          companyName: payload.user.company_name,
          createdAt: payload.user.created_at,
          status: 'active',
          emailVerified: true
        }
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
      jsonResponse.cookies.set('verity_access_token', payload.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 60 // 30 minutes in seconds (matches backend config)
      })

      // Also set refresh token if available
      // maxAge matches backend REFRESH_TOKEN_EXPIRE_DAYS (30 days)
      if (payload.refresh_token) {
        jsonResponse.cookies.set('verity_refresh_token', payload.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60 // 30 days in seconds (matches backend config)
        })
      }

      return jsonResponse
    }

    console.error('[Auth Login] Backend error', {
      status: response.status,
      contentType,
      data
    })
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
