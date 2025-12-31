import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PAGE_SIZE = 100
const MAX_PAGES = 50

type BackendHistoryItem = {
  extra_data?: Record<string, unknown> | null
}

type BackendHistoryResponse = {
  items?: BackendHistoryItem[]
  total?: number
  page?: number
  page_size?: number
}

function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export async function GET(request: NextRequest) {
  const authorization = getAuthorizationFromRequest(request)
  if (!authorization) {
    return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
  }

  try {
    let page = 0
    let total = Number.POSITIVE_INFINITY
    let totalValue = 0
    let totalCount = 0

    while (totalCount < total && page < MAX_PAGES) {
      const backendUrl = new URL(`${BACKEND_URL}/api/v1/cpr/history`)
      backendUrl.searchParams.set('status', 'completed')
      backendUrl.searchParams.set('page', String(page))
      backendUrl.searchParams.set('page_size', String(PAGE_SIZE))

      const res = await fetch(backendUrl.toString(), {
        headers: {
          Authorization: authorization
        },
        cache: 'no-store'
      })

      const contentType = res.headers.get('content-type') || ''
      const data: unknown = contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : await res.text().catch(() => null)

      if (!res.ok) {
        const detail =
          data && typeof data === 'object'
            ? data
            : { detail: data || 'Backend error' }
        return NextResponse.json(detail, { status: res.status })
      }

      if (!data || typeof data !== 'object') {
        return NextResponse.json(
          { success: false, error: 'Invalid backend response' },
          { status: 502 }
        )
      }

      const responseData = data as BackendHistoryResponse
      const items = Array.isArray(responseData.items) ? responseData.items : []

      total =
        typeof responseData.total === 'number'
          ? responseData.total
          : totalCount + items.length

      totalCount += items.length

      for (const item of items) {
        const value = parseNumber(item.extra_data?.total_value)
        if (value !== null) {
          totalValue += value
        }
      }

      page += 1
    }

    return NextResponse.json({
      success: true,
      data: {
        totalValue,
        totalCount
      }
    })
  } catch (error) {
    console.error('[API Metrics] Proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics from backend' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  try {
    const body = await request.json()
    const res = await fetch(`${backendUrl}/api/v1/cpr/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await res.json().catch(() => null)
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Proxy failed' },
      { status: 500 }
    )
  }
}
