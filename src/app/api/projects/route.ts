/**
 * Next.js API Route - Projects Proxy
 *
 * Proxies to backend project endpoints:
 * - GET /api/v1/projects/ - List user projects
 * - POST /api/v1/projects/ - Create new project
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - List all projects for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get('skip') || '0'
    const limit = searchParams.get('limit') || '100'

    const response = await fetch(
      `${BACKEND_URL}/api/v1/projects/?skip=${skip}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()

    // Add cache headers for GET requests
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('[API Route /api/projects] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/v1/projects/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/projects] POST Error:', error)
    return NextResponse.json(
      { detail: 'Failed to create project' },
      { status: 500 }
    )
  }
}
