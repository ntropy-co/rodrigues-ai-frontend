/**
 * BFF (Next.js API Route) — Document Download
 *
 * Faz download (stream) de um documento.
 *
 * Frontend:
 * - `GET /api/documents/:documentId/download`
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/documents/{documentId}/download`
 *
 * Auth:
 * - Atualmente não exige token no backend (mas pode ser endurecido no futuro).
 *
 * Chamadores:
 * - `src/hooks/useChatFiles.ts`, `src/hooks/useDocuments.ts`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params
    const url = `${BACKEND_URL}/api/v1/documents/${documentId}/download`

    console.log('[API Proxy] Download document:', documentId)

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })

    console.log('[API Proxy] Download response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Download error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    // Forward the file stream
    const blob = await response.blob()
    const headers = new Headers()

    // Copy content-disposition header for filename
    const contentDisposition = response.headers.get('Content-Disposition')
    if (contentDisposition) {
      headers.set('Content-Disposition', contentDisposition)
    }

    // Copy content-type
    const contentType = response.headers.get('Content-Type')
    if (contentType) {
      headers.set('Content-Type', contentType)
    }

    console.log('[API Proxy] Download successful, returning file')

    return new NextResponse(blob, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('[API Proxy] Error downloading document:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
