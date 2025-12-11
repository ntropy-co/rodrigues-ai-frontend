/**
 * Next.js API Route - Register Proxy
 *
 * This route acts as a proxy to the backend registration API
 * to avoid CORS issues when running locally
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body (JSON for register)
    const body = await request.json()

    // Map frontend request to backend expected format
    // Frontend sends: { email, password, name, inviteToken? }
    // Backend expects: { email, password, full_name }
    const backendBody = {
      email: body.email,
      password: body.password,
      full_name: body.name || body.full_name || ''
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(backendBody)
    })

    // Get the response data
    const data = await response.json()

    // Map backend response to frontend expected format
    // Backend returns: { access_token, token_type }
    // Frontend expects: { token }
    if (response.ok && data.access_token) {
      return NextResponse.json(
        {
          ...data,
          token: data.access_token
        },
        { status: response.status }
      )
    }

    // Return error response as-is
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
