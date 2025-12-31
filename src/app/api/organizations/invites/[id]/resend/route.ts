/**
 * BFF (Next.js API Route) - Resend Organization Invite
 *
 * Resends an invite email for a specific invite.
 *
 * Frontend:
 * - `POST /api/organizations/invites/:id/resend`
 *
 * Backend:
 * - `POST ${BACKEND_URL}/api/v1/organizations/current/invites/{id}/resend`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useOrganizationInvites.ts`
 * - `src/components/organization/InviteList.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * POST - Resend an invite email
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = getAuthorizationFromRequest(request)
    const { id } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/current/invites/${id}/resend`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(
      '[API Route /api/organizations/invites/[id]/resend] POST Error:',
      error
    )
    return NextResponse.json(
      { detail: 'Failed to resend invite' },
      { status: 500 }
    )
  }
}
