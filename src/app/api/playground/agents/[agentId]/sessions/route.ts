import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    let url = `${BACKEND_URL}/api/v1/playground/agents/${agentId}/sessions`
    if (userId) {
      url += `?user_id=${userId}`
    }

    console.log('[API Proxy] GET sessions for agent:', agentId, 'user:', userId)

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })

    console.log('[API Proxy] Sessions response status:', response.status)

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty array when storage is not enabled or no sessions found
        return NextResponse.json([], { status: 200 })
      }
      const errorText = await response.text()
      console.error('[API Proxy] Sessions error:', errorText)
      return NextResponse.json(
        { detail: errorText || 'Failed to fetch sessions' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[API Proxy] Successfully fetched', data.length, 'sessions')

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API Proxy] Error fetching sessions:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
