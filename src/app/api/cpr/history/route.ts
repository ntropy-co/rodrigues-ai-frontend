/**
 * BFF (Next.js API Route) — CPR History
 *
 * Lista e cria registros de histórico de CPRs (análises e criações).
 *
 * Frontend:
 * - `GET  /api/cpr/history` (query: `skip`, `limit`, `type`, `status`, `commodity`, `date_from`, `date_to`)
 * - `POST /api/cpr/history`
 *
 * Backend:
 * - `GET  ${BACKEND_URL}/api/v1/cpr/history`
 * - `POST ${BACKEND_URL}/api/v1/cpr/history`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>`
 *
 * Cache:
 * - GET retorna com `Cache-Control` curto (private).
 *
 * Chamadores:
 * - `src/hooks/useCPRHistory.ts`
 * - `src/app/cpr/historico/page.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  BACKEND_URL,
  getAuthHeader,
  getBackendHeaders,
  handleBackendResponse,
  logRouteError
} from '@/lib/api/bff-utils'

// ============================================================================
// Types
// ============================================================================

export type CPRHistoryType = 'analise' | 'criar' | 'simulacao'
export type CPRHistoryStatus = 'completed' | 'pending' | 'failed'

export interface CPRHistoryItem {
  id: string
  type: CPRHistoryType
  title: string
  status: CPRHistoryStatus
  created_at: string
  updated_at: string
  document_url?: string
  metadata: {
    commodity?: string
    quantity?: number
    unit_price?: number
    total_value?: number
    producer?: string
    due_date?: string
    risk_score?: number
    compliance_score?: number
    compliance_grade?: string
  }
}

export interface CPRHistoryListResponse {
  items: CPRHistoryItem[]
  total: number
  page: number
  limit: number
}

export interface CPRHistoryCreateRequest {
  type: CPRHistoryType
  title: string
  status?: CPRHistoryStatus
  document_url?: string
  session_id?: string
  metadata?: Record<string, unknown>
}

// ============================================================================
// GET - List CPR history
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const authorization = getAuthHeader(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for pagination and filtering
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get('skip') || '0'
    const limit = searchParams.get('limit') || '20'
    const type = searchParams.get('type') // 'analise' | 'criar' | 'simulacao' | null
    const status = searchParams.get('status') // 'completed' | 'pending' | 'failed' | null
    const commodity = searchParams.get('commodity')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_URL}/api/v1/cpr/history`)
    backendUrl.searchParams.set('skip', skip)
    backendUrl.searchParams.set('limit', limit)

    if (type && type !== 'all') {
      backendUrl.searchParams.set('type', type)
    }
    if (status && status !== 'all') {
      backendUrl.searchParams.set('status', status)
    }
    if (commodity) {
      backendUrl.searchParams.set('commodity', commodity)
    }
    if (dateFrom) {
      backendUrl.searchParams.set('date_from', dateFrom)
    }
    if (dateTo) {
      backendUrl.searchParams.set('date_to', dateTo)
    }

    console.log('[API /api/cpr/history] GET:', backendUrl.toString())

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: getBackendHeaders(authorization)
    })

    const backendResponse = await handleBackendResponse(
      response,
      'Failed to fetch CPR history'
    )

    // Add cache headers for GET requests
    const headers = new Headers()
    headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120')

    return new NextResponse(backendResponse.body, {
      status: backendResponse.status,
      headers
    })
  } catch (error) {
    logRouteError('/api/cpr/history', 'GET', error)
    return NextResponse.json(
      { detail: 'Failed to fetch CPR history' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST - Create CPR history entry
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const authorization = getAuthHeader(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    let body: CPRHistoryCreateRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { detail: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!body.type || !body.title) {
      return NextResponse.json(
        { detail: 'Missing required fields: type, title' },
        { status: 400 }
      )
    }

    console.log('[API /api/cpr/history] POST:', body.type, body.title)

    const response = await fetch(`${BACKEND_URL}/api/v1/cpr/history`, {
      method: 'POST',
      headers: getBackendHeaders(authorization),
      body: JSON.stringify({
        ...body,
        status: body.status || 'pending'
      })
    })

    return await handleBackendResponse(response, 'Failed to create CPR history entry')
  } catch (error) {
    logRouteError('/api/cpr/history', 'POST', error)
    return NextResponse.json(
      { detail: 'Failed to create CPR history entry' },
      { status: 500 }
    )
  }
}
