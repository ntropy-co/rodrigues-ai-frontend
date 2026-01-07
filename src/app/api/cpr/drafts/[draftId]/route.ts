/**
 * BFF (Next.js API Route) - CPR Draft by ID
 *
 * Frontend:
 * - GET /api/cpr/drafts/:draftId
 * - PATCH /api/cpr/drafts/:draftId
 *
 * Backend:
 * - GET ${BACKEND_URL}/api/v1/cpr/drafts/:draftId
 * - PATCH ${BACKEND_URL}/api/v1/cpr/drafts/:draftId
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

    const response = await fetch(
      `${BACKEND_URL}/api/v1/cpr/drafts/${draftId}`,
      {
        method: 'GET',
        headers: {
          Authorization: authorization
        }
      }
    )

    if (!response.ok) {
      let errorDetail = 'Erro ao buscar draft'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/cpr/drafts/:id] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/cpr/drafts/:id] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/cpr/drafts/${draftId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify(body)
      }
    )

    if (!response.ok) {
      let errorDetail = 'Erro ao atualizar draft'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/cpr/drafts/:id] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/cpr/drafts/:id] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
