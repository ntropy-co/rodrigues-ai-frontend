/**
 * BFF (Next.js API Route) — CPR History Item
 *
 * Operações em um registro específico de histórico de CPR.
 *
 * Frontend:
 * - `GET    /api/cpr/history/:id`
 * - `PATCH  /api/cpr/history/:id`
 * - `DELETE /api/cpr/history/:id`
 *
 * Backend:
 * - `GET    ${BACKEND_URL}/api/v1/cpr/history/:id`
 * - `PATCH  ${BACKEND_URL}/api/v1/cpr/history/:id`
 * - `DELETE ${BACKEND_URL}/api/v1/cpr/history/:id`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Chamadores:
 * - `src/hooks/useCPRHistory.ts`
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  BACKEND_URL,
  getAuthHeader,
  getBackendHeaders,
  handleBackendResponse,
  isValidUUID,
  logRouteError
} from '@/lib/api/bff-utils'

interface RouteParams {
  params: Promise<{ id: string }>
}

// ============================================================================
// GET - Get single CPR history item
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authorization = getAuthHeader(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ detail: 'Invalid ID format' }, { status: 400 })
    }

    console.log('[API /api/cpr/history/:id] GET:', id)

    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/history/${id}`, {
      method: 'GET',
      headers: getBackendHeaders(authorization)
    })

    return await handleBackendResponse(
      response,
      'Failed to fetch CPR history item'
    )
  } catch (error) {
    logRouteError('/api/cpr/history/:id', 'GET', error)
    return NextResponse.json(
      { detail: 'Failed to fetch CPR history item' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Update CPR history item
// ============================================================================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authorization = getAuthHeader(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ detail: 'Invalid ID format' }, { status: 400 })
    }

    // Parse request body
    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { detail: 'Invalid request body' },
        { status: 400 }
      )
    }

    console.log('[API /api/cpr/history/:id] PATCH:', id, body)

    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/history/${id}`, {
      method: 'PATCH',
      headers: getBackendHeaders(authorization),
      body: JSON.stringify(body)
    })

    return await handleBackendResponse(
      response,
      'Failed to update CPR history item'
    )
  } catch (error) {
    logRouteError('/api/cpr/history/:id', 'PATCH', error)
    return NextResponse.json(
      { detail: 'Failed to update CPR history item' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Delete CPR history item
// ============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const authorization = getAuthHeader(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Validate ID format
    if (!isValidUUID(id)) {
      return NextResponse.json({ detail: 'Invalid ID format' }, { status: 400 })
    }

    console.log('[API /api/cpr/history/:id] DELETE:', id)

    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/history/${id}`, {
      method: 'DELETE',
      headers: getBackendHeaders(authorization)
    })

    return await handleBackendResponse(
      response,
      'Failed to delete CPR history item'
    )
  } catch (error) {
    logRouteError('/api/cpr/history/:id', 'DELETE', error)
    return NextResponse.json(
      { detail: 'Failed to delete CPR history item' },
      { status: 500 }
    )
  }
}
