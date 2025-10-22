import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params
    console.log(
      '[API Proxy] POST /api/playground/agents/:agentId/runs - Agent run started'
    )
    console.log('[API Proxy] Agent ID:', agentId)

    // Get the FormData from the request
    const formData = await request.formData()

    console.log('[API Proxy] FormData fields:', Array.from(formData.keys()))

    // Get authorization header if present
    const authorization = request.headers.get('authorization')

    const headers: HeadersInit = {}
    if (authorization) {
      headers['Authorization'] = authorization
    }

    // Forward to backend with streaming
    const response = await fetch(
      `${BACKEND_URL}/api/v1/playground/agents/${agentId}/runs`,
      {
        method: 'POST',
        headers,
        body: formData
        // Don't set Content-Type - let browser set it with boundary
      }
    )

    console.log('[API Proxy] Backend response status:', response.status)
    console.log(
      '[API Proxy] Backend response headers:',
      Object.fromEntries(response.headers.entries())
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[API Proxy] Agent run error:', errorData)
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stream the response back to the client
    console.log('[API Proxy] Streaming response back to client')
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/json',
        'Transfer-Encoding': 'chunked'
      }
    })
  } catch (error) {
    console.error('[API Proxy] Error in agent run:', error)
    return new Response(JSON.stringify({ detail: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
