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
 * - Atualmente não exige token no backend (mas pode ser endurecido no futuro).
 *
 * Chamadores:
 * - `src/hooks/useChatFiles.ts`, `src/hooks/useDocuments.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params
    const url = `${BACKEND_URL}/api/v1/documents/${documentId}`

    console.log('[API Proxy] DELETE document:', documentId)

    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    })

    console.log('[API Proxy] Delete response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Delete error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Proxy] Error deleting document:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
