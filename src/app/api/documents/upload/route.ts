/**
 * BFF (Next.js API Route) — Document Upload
 *
 * Faz upload de arquivos para o backend (multipart/form-data).
 *
 * Frontend:
 * - `POST /api/documents/upload`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/documents/upload`
 *
 * Auth:
 * - Atualmente não exige token no backend, mas este proxy existe para padronizar
 *   o contrato e evitar CORS.
 *
 * Chamadores:
 * - `src/hooks/useChatFiles.ts`, `src/components/v2/FileUpload/FileUploadModal.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    console.log(
      '[API Proxy] POST /api/documents/upload - Uploading file to backend'
    )

    // Get the FormData from the request
    const formData = await request.formData()

    console.log('[API Proxy] FormData fields:', Array.from(formData.keys()))

    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/v1/documents/upload`, {
      method: 'POST',
      body: formData
      // Don't set Content-Type header - let the browser set it with boundary
    })

    console.log('[API Proxy] Backend response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Upload error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    console.log('[API Proxy] Upload successful, document ID:', data.id)

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Proxy] Error in document upload:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
