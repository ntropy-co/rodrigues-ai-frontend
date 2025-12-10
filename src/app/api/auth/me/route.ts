/**
 * Next.js API Route - Get Current User Proxy
 *
 * This route acts as a proxy to the backend user API
 * to avoid CORS issues when running locally
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header from the request
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: authorization
      }
    })

    // Get the response data
    const data = await response.json()

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status })
  } catch {
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
