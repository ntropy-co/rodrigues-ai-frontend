/**
 * BFF (Next.js API Route) - Create Organization
 *
 * Creates a new organization.
 *
 * Frontend:
 * - `POST /api/organizations/create`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/organizations`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Request Body:
 * - name: string (organization name)
 * - slug?: string (optional URL-friendly identifier)
 *
 * Callers:
 * - `src/hooks/useOrganization.ts`
 * - `src/components/organization/CreateOrganizationForm.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * POST - Create a new organization
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization')

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/v1/organizations`, {
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
    console.error('[API Route /api/organizations/create] POST Error:', error)
    return NextResponse.json(
      { detail: 'Failed to create organization' },
      { status: 500 }
    )
  }
}
