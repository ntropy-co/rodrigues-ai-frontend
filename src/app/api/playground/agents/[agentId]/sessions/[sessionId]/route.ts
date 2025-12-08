import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string; sessionId: string }> }
) {
  try {
    const { agentId, sessionId } = await params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    let url = `${BACKEND_URL}/api/v1/playground/agents/${agentId}/sessions/${sessionId}`
    if (userId) {
      url += `?user_id=${userId}`
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { detail: errorText || 'Failed to fetch session' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string; sessionId: string }> }
) {
  try {
    const { agentId, sessionId } = await params
    const url = `${BACKEND_URL}/api/v1/playground/agents/${agentId}/sessions/${sessionId}`

    const response = await fetch(url, {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { detail: errorText || 'Failed to delete session' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
