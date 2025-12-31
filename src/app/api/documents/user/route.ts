/**
 * BFF (Next.js API Route) — Documents by User
 *
 * Lista documentos enviados pelo usuário autenticado, com filtro opcional por sessão.
 * O backend extrai o user_id do token JWT automaticamente.
 *
 * Frontend:
 * - `GET /api/documents/user?session_id=<session_id?>`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/documents/user?session_id=...`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Response esperado (backend):
 * - `{ documents: [...], count: number }`
 *
 * Chamadores:
 * - `src/hooks/useDocuments.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    // Backend now uses the user_id from the JWT token
    const backendUrl = new URL(`${BACKEND_URL}/api/v1/documents/user`)
    if (sessionId) backendUrl.searchParams.set('session_id', sessionId)

    console.log('[API Proxy] GET documents for authenticated user')

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: authorization
      }
    })

    console.log('[API Proxy] Documents response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Documents error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log(
      '[API Proxy] Successfully fetched',
      data.count ?? 0,
      'documents'
    )

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Proxy] Error fetching documents:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
