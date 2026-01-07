/**
 * BFF (Next.js API Route) — Admin Users List
 *
 * Lista usuários da organização (admin only).
 *
 * Frontend:
 * - `GET /api/admin/users` (query: `skip`, `limit`, `search?`, `role?`, `status?`)
 *
 * Backend:
 * - `GET ${BACKEND_URL}/api/v1/admin/users`
 *
 * Auth:
 * - Obrigatório: `Authorization: Bearer <token>` (admin only)
 *
 * Query Parameters:
 * - skip?: number (default: 0) - Pagination offset
 * - limit?: number (default: 50) - Page size
 * - search?: string - Search by name or email
 * - role?: string - Filter by role (admin, member, viewer)
 * - status?: string - Filter by status (active, inactive, pending)
 *
 * Response:
 * - users: UserSummary[]
 * - total: number
 * - skip: number
 * - limit: number
 *
 * Chamadores:
 * - `src/hooks/useAdminUsers.ts`
 * - `src/app/(dashboard)/admin/users/page.tsx`
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizationFromRequest } from '@/lib/api/auth-header'

// Use server-side env var first, fallback to public for development
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'

export interface UserSummary {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'member' | 'viewer'
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  last_login_at: string | null
}

export interface UsersListResponse {
  users: UserSummary[]
  total: number
  skip: number
  limit: number
}

export async function GET(request: NextRequest) {
  try {
    const authorization = getAuthorizationFromRequest(request)

    if (!authorization) {
      return NextResponse.json(
        { detail: 'Authorization header required' },
        { status: 401 }
      )
    }

    // Get query params for pagination and filtering
    const { searchParams } = new URL(request.url)
    const skipParam = parseInt(searchParams.get('skip') || '0', 10)
    const limitParam = parseInt(searchParams.get('limit') || '50', 10)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    // Validate and sanitize pagination params
    const skip = Math.max(0, isNaN(skipParam) ? 0 : skipParam)
    const limit = Math.min(
      100,
      Math.max(1, isNaN(limitParam) ? 50 : limitParam)
    )

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_URL}/api/v1/admin/users`)
    backendUrl.searchParams.set('skip', String(skip))
    backendUrl.searchParams.set('limit', String(limit))
    if (search) backendUrl.searchParams.set('search', search)
    if (role) backendUrl.searchParams.set('role', role)
    if (status) backendUrl.searchParams.set('status', status)

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      }
    })

    // Handle error responses
    if (!response.ok) {
      let errorDetail = 'Failed to fetch users'
      try {
        const errorData = await response.json()
        errorDetail = errorData.detail || errorDetail
      } catch {
        errorDetail = `Backend error: ${response.status} ${response.statusText}`
      }
      console.error('[API /api/admin/users] Backend error:', errorDetail)
      return NextResponse.json(
        { detail: errorDetail },
        { status: response.status }
      )
    }

    const data: UsersListResponse = await response.json()

    // Admin data should not be cached to ensure fresh data
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'private, no-cache, must-revalidate'
      }
    })
  } catch (error) {
    console.error('[API /api/admin/users] Error:', error)
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    )
  }
}
