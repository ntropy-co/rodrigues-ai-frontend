/**
 * BFF (Next.js API Route) - Organization Invite by ID
 *
 * Cancels (deletes) a specific invite.
 *
 * Frontend:
 * - `DELETE /api/organizations/invites/:id`
 *
 * Backend:
 * - `DELETE ${BACKEND_URL}/api/v1/organizations/current/invites/{id}`
 *
 * Auth:
 * - Required: `Authorization: Bearer <token>`
 *
 * Callers:
 * - `src/hooks/useOrganizationInvites.ts`
 * - `src/components/organization/InviteList.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * DELETE - Cancel (delete) an invite
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = request.headers.get('authorization')
    const { id } = await params

    if (!authorization) {
      return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/organizations/current/invites/${id}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: authorization
        }
      }
    )

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(
      '[API Route /api/organizations/invites/[id]] DELETE Error:',
      error
    )
    return NextResponse.json(
      { detail: 'Failed to cancel invite' },
      { status: 500 }
    )
  }
}
