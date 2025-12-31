/**
 * BFF (Next.js API Route) — Refresh Token
 *
 * Troca um `refresh_token` por um novo `access_token`.
 *
 * Frontend:
 * - `POST /api/auth/refresh`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/auth/refresh` (JSON: `{ refresh_token }`)
 *
 * Auth:
 * - Público (usa `refresh_token`)
 *
 * Notas:
 * - Aceita body `{ refreshToken }` (frontend) ou `{ refresh_token }` (backend).
 * - Se não houver body, tenta ler `refresh_token` do cookie.
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RefreshBody = {
  refreshToken?: string
  refresh_token?: string
}

export async function POST(request: NextRequest) {
  try {
    let body: RefreshBody = {}
    try {
      body = (await request.json()) as RefreshBody
    } catch {
      body = {}
    }

    const cookieRefreshToken = request.cookies.get(
      'verity_refresh_token'
    )?.value
    const refreshToken =
      body.refresh_token || body.refreshToken || cookieRefreshToken

    if (!refreshToken) {
      return NextResponse.json(
        { detail: 'Refresh token required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    const contentType = response.headers.get('content-type') || ''
    const data: unknown = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => null)

    if (!response.ok) {
      const errorData =
        data && typeof data === 'object'
          ? data
          : { detail: data || 'Request failed' }
      return NextResponse.json(errorData, { status: response.status })
    }

    if (data && typeof data === 'object' && 'access_token' in data) {
      const tokenData = data as {
        access_token?: string
        refresh_token?: string
      }

      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

      const jsonResponse = NextResponse.json(
        { expiresAt },
        { status: response.status }
      )

      if (tokenData.access_token) {
        jsonResponse.cookies.set(
          'verity_access_token',
          tokenData.access_token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 60
          }
        )
      }

      if (tokenData.refresh_token) {
        jsonResponse.cookies.set(
          'verity_refresh_token',
          tokenData.refresh_token,
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 30 * 24 * 60 * 60
          }
        )
      }

      return jsonResponse
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/auth/refresh] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
