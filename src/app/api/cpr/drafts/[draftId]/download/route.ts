/**
 * BFF (Next.js API Route) - CPR Draft Download
 *
 * Frontend:
 * - GET /api/cpr/drafts/:draftId/download?format=pdf|docx
 *
 * Backend:
 * - GET ${BACKEND_URL}/api/v1/cpr/drafts/:draftId/download
 *
 * Auth:
 * - Cookie HttpOnly or Authorization header
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ draftId: string }> }
) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization required' },
        { status: 401 }
      )
    }

    const { draftId } = await context.params
    const url = new URL(`${BACKEND_URL}/api/v1/cpr/drafts/${draftId}/download`)

    const format = request.nextUrl.searchParams.get('format')
    if (format) {
      url.searchParams.set('format', format)
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: authorization
      },
      redirect: 'manual'
    })

    const location = response.headers.get('location')
    if (location && response.status >= 300 && response.status < 400) {
      return NextResponse.redirect(location, 307)
    }

    if (!response.ok) {
      let errorDetail = 'Erro ao baixar documento'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error(
        '[API /api/cpr/drafts/:id/download] Backend error:',
        errorDetail
      )
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream'
    const body = await response.arrayBuffer()

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType
      }
    })
  } catch (error) {
    console.error('[API /api/cpr/drafts/:id/download] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
