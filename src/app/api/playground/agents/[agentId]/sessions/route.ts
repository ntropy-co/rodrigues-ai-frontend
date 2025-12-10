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

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status === 404) {
        // Return empty array when storage is not enabled or no sessions found
        return NextResponse.json([], { status: 200 })
      }
      const errorText = await response.text()
      return NextResponse.json(
        { detail: errorText || 'Failed to fetch sessions' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
