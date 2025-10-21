import { NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET() {
  try {
    console.log(
      '[API Proxy] GET /api/playground/agents - Forwarding to backend'
    )

    const response = await fetch(`${BACKEND_URL}/api/v1/playground/agents`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log('[API Proxy] Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API Proxy] Backend error:', errorText)
      return NextResponse.json(
        { detail: errorText || 'Failed to fetch agents' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log(
      '[API Proxy] Successfully fetched agents:',
      data.length,
      'agents'
    )

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Proxy] Error in /api/playground/agents:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
