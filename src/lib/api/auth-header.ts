import type { NextRequest } from 'next/server'

export const ACCESS_TOKEN_COOKIE = 'verity_access_token'
export const REFRESH_TOKEN_COOKIE = 'verity_refresh_token'

export function getAuthorizationFromRequest(
  request: NextRequest
): string | null {
  const header = request.headers.get('authorization')
  if (header) {
    return header
  }

  const cookieToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  return cookieToken ? `Bearer ${cookieToken}` : null
}
