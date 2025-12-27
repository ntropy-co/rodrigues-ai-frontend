/**
 * BFF (Next.js API Route) — Admin User by ID
 *
 * Obtém detalhes, atualiza role/status, ou desativa um usuário.
 *
 * Frontend:
 * - `GET    /api/admin/users/:id`
 * - `PATCH  /api/admin/users/:id/role`  (via body: { action: 'role', ... })
 * - `DELETE /api/admin/users/:id`
 *
 * Backend:
 * - `GET    ${BACKEND_URL}/api/v1/admin/users/{id}`
 * - `PATCH  ${BACKEND_URL}/api/v1/admin/users/{id}/role`
 * - `DELETE ${BACKEND_URL}/api/v1/admin/users/{id}`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>` (admin only)
 *
 * Chamadores:
 * - `src/hooks/useAdminUsers.ts`
 * - `src/app/(dashboard)/admin/users/[id]/page.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type RouteParams = { params: Promise<{ id: string }> }

export interface UserDetails {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'member' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  organization_id: string
  created_at: string
  updated_at: string
  last_login_at: string | null
  avatar_url: string | null
}

export interface UpdateRoleRequest {
  role?: 'admin' | 'member' | 'viewer'
  status?: 'active' | 'inactive'
}

/**
 * GET - Get user details by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = request.headers.get('authorization')
    const { id } = await params

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/admin/users/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        }
      }
    )

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Failed to fetch user details'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/admin/users/[id]] GET error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const data: UserDetails = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/admin/users/[id]] GET Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update user role and/or status
 *
 * Request body:
 * - role?: 'admin' | 'member' | 'viewer'
 * - status?: 'active' | 'inactive'
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = request.headers.get('authorization')
    const { id } = await params

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    let body: UpdateRoleRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { detail: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate request body
    if (!body.role && !body.status) {
      return NextResponse.json(
        { detail: 'At least one of role or status is required' },
        { status: 400 }
      )
    }

    if (body.role && !['admin', 'member', 'viewer'].includes(body.role)) {
      return NextResponse.json(
        { detail: 'Invalid role. Must be admin, member, or viewer' },
        { status: 400 }
      )
    }

    if (body.status && !['active', 'inactive'].includes(body.status)) {
      return NextResponse.json(
        { detail: 'Invalid status. Must be active or inactive' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/admin/users/${encodeURIComponent(id)}/role`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization
        },
        body: JSON.stringify(body)
      }
    )

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Failed to update user'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/admin/users/[id]] PATCH error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[API /api/admin/users/[id]] PATCH Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Deactivate user (soft delete)
 *
 * This endpoint deactivates the user rather than permanently deleting them.
 * The user can be reactivated later via PATCH with status: 'active'.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authorization = request.headers.get('authorization')
    const { id } = await params

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/admin/users/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: authorization
        }
      }
    )

    // Handle 204 No Content
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 })
    }

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Failed to deactivate user'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/admin/users/[id]] DELETE error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    // Handle JSON response if backend returns one
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const data = await response.json().catch(() => null)
      if (data !== null) {
        return NextResponse.json(data, { status: response.status })
      }
    }

    return new NextResponse(null, { status: response.status })
  } catch (error) {
    console.error('[API /api/admin/users/[id]] DELETE Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
