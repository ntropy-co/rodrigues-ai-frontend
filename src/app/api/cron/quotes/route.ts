import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function triggerQuotesCron(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const providedSecret = request.headers.get('x-cron-secret')

  if (!cronSecret) {
    return NextResponse.json(
      { success: false, error: 'Cron secret not configured' },
      { status: 500 }
    )
  }

  if (process.env.NODE_ENV !== 'development' && providedSecret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/cron/quotes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Secret': cronSecret
      }
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

    return NextResponse.json(
      {
        success: true,
        message: 'Triggered backend cron',
        backendStatus: res.status,
        backendResponse: data
      },
      { status: res.status }
    )
  } catch (error) {
    console.error('[Cron] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to trigger update' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return triggerQuotesCron(request)
}

export async function POST(request: NextRequest) {
  return triggerQuotesCron(request)
}
