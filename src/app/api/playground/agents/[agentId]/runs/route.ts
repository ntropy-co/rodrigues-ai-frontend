import { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { agentId } = await params

    // Get the FormData from the request
    const formData = await request.formData()

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

    if (!response.ok) {
      const errorData = await response.json()
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Stream the response back to the client
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/json',
        'Transfer-Encoding': 'chunked'
      }
    })
  } catch {
    return new Response(JSON.stringify({ detail: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
