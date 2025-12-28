'use client'

/**
 * Token Refresh Utility
 *
 * Provides automatic token refresh functionality for the authentication system.
 * Intercepts 401 responses and attempts to refresh the token before retrying.
 */

/**
 * Token Refresh Utility
 *
 * Provides automatic token refresh functionality for the authentication system.
 * Intercepts 401 responses and attempts to refresh the token before retrying.
 */

import { authApi } from './api'

/**
 * Attempt to refresh the access token using the refresh token (via cookie).
 * @returns boolean indicating success
 */
export async function refreshTokens(): Promise<boolean> {
  try {
    console.log('[TokenRefresh] Attempting token refresh...')
    // Call refresh endpoint with empty body - backend will check cookie
    await authApi.refreshToken()
    console.log('[TokenRefresh] Token refreshed successfully')
    return true
  } catch (error) {
    console.error('[TokenRefresh] Error during refresh:', error)
    return false
  }
}

/**
 * Wrapper for fetch that automatically handles token refresh on 401.
 * Use this instead of fetch for authenticated requests.
 *
 * NOTE: Since we use HttpOnly cookies, we don't need to inject headers.
 * We just need to catch 401 and retry.
 */
export async function fetchWithRefresh(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // No Authorization header injection needed

  let response = await fetch(url, options)

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log('[TokenRefresh] Got 401, attempting refresh...')

    const success = await refreshTokens()

    if (success) {
      // Retry request (cookies are sent automatically)
      console.log('[TokenRefresh] Retrying request...')
      response = await fetch(url, options)
      console.log('[TokenRefresh] Retry response:', response.status)
    }
  }

  return response
}

/**
 * Check if token is about to expire and proactively refresh.
 * Call this periodically (e.g., every 5 minutes) to maintain session.
 *
 * Since we can't read the HTTPOnly cookie to know expiration,
 * we just blindly refresh periodically.
 */
export function scheduleTokenRefresh(
  intervalMs: number = 5 * 60 * 1000
): () => void {
  const intervalId = setInterval(async () => {
    // Blind refresh: just call it. If it fails (e.g. 401), session might be invalid.
    // We could check if we are online/active before refreshing.
    if (
      typeof document !== 'undefined' &&
      document.visibilityState === 'visible'
    ) {
      console.log('[TokenRefresh] Proactive refresh check')
      await refreshTokens().catch((err) => {
        console.error('[TokenRefresh] Scheduled refresh failed:', err)
      })
    }
  }, intervalMs)

  // Return cleanup function
  return () => clearInterval(intervalId)
}
