import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  
  try {
    const res = await fetch(`${backendUrl}/api/v1/metrics/cpr`, { 
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })
    
    if (!res.ok) {
        throw new Error(`Backend responded with ${res.status}`)
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[API Metrics] Proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics from backend' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
    // Proxy POST as well (if needed by webhook)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    try {
        const body = await request.json()
        const res = await fetch(`${backendUrl}/api/v1/metrics/cpr`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
        const data = await res.json()
        return NextResponse.json(data, { status: res.status })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Proxy failed' }, { status: 500 })
    }
}
