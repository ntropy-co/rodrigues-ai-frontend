/**
 * BFF (Next.js API Route) — Document Delete
 *
 * Remove um documento (por `documentId`/`file_id`).
 *
 * Frontend:
 * - `DELETE /api/documents/:documentId`
 *
 * Backend:
 * - `DELETE ${BACKEND_URL}/api/v1/documents/{documentId}`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Chamadores:
 * - `src/hooks/useChatFiles.ts`, `src/hooks/useDocuments.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    const { documentId } = await params
    const url = `${BACKEND_URL}/api/v1/documents/${encodeURIComponent(documentId)}`

    console.log('[API Proxy] DELETE document:', documentId)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: authorization
      }
    })

    console.log('[API Proxy] Delete response status:', response.status)

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || ''
      const errorData = contentType.includes('application/json')
        ? await response
            .json()
            .catch(() => ({ detail: 'Request failed (invalid JSON response)' }))
        : {
            detail:
              (await response.text().catch(() => '')) ||
              'Request failed (non-JSON response)'
          }

      console.error('[API Proxy] Delete error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await response.json().catch(() => null)
      if (data !== null) {
        return NextResponse.json(data, { status: response.status })
      }
    }

    return new NextResponse(null, { status: response.status })
  } catch (error) {
    console.error('[API Proxy] Error deleting document:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
