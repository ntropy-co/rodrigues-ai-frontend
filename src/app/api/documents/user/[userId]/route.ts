/**
 * BFF (Next.js API Route) — Documents by User
 *
 * Lista documentos enviados por um usuário, com filtro opcional por sessão.
 *
 * Frontend:
 * - `GET /api/documents/user/:userId?session_id=<session_id?>`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/documents/user/{userId}?session_id=...`
 *
 * Auth:
 * - Atualmente não exige token no backend (mas pode ser endurecido no futuro).
 *
 * Response esperado (backend):
 * - `{ documents: [...], count: number }`
 *
 * Chamadores:
 * - `src/hooks/useDocuments.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    const backendUrl = new URL(`${BACKEND_URL}/api/v1/documents/user/${userId}`)
    if (sessionId) backendUrl.searchParams.set('session_id', sessionId)

    console.log('[API Proxy] GET documents for user:', userId)

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      credentials: 'include'
    })

    console.log('[API Proxy] Documents response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Documents error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('[API Proxy] Successfully fetched', data.length, 'documents')

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Proxy] Error fetching documents:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
