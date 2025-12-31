/**
 * BFF (Next.js API Route) - Organization Invites
 *
 * Lists/creates invites for the current organization.
 *
 * Frontend:
 * - `GET  /api/organizations/invites`
 * - `POST /api/organizations/invites`
 *
 * Backend:
 * - `GET  ${BACKEND_URL}/api/v1/organizations/current/invites`
 * - `POST ${BACKEND_URL}/api/v1/organizations/current/invites`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * POST Request Body:
 * - email: string (email to invite)
 * - role?: string (optional role for the invitee)
 *
 * Callers:
 * - `src/hooks/useOrganizationInvites.ts`
 * - `src/components/organization/InviteMembers.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * GET - List all invites for the current organization
 */
export async function GET(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/current/invites`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'private, max-age=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('[API Route /api/organizations/invites] GET Error:', error)
    return NextResponse.json(
      { detail: 'Failed to fetch invites' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new invite
 */
export async function POST(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/current/invites`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify(body)
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[API Route /api/organizations/invites] POST Error:', error)
    return NextResponse.json(
      { detail: 'Failed to create invite' },
      { status: 500 }
    )
  }
}
