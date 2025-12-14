'use client'

/**
 * Token Refresh Utility
 *
 * Provides automatic token refresh functionality for the authentication system.
 * Intercepts 401 responses and attempts to refresh the token before retrying.
 */

import {
  getAuthToken,
  setAuthToken,
  getRefreshToken,
  setRefreshToken,
  removeAuthToken,
  removeRefreshToken
} from './cookies'

const API_BASE = '/api/auth'

interface RefreshResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

/**
 * Attempt to refresh the access token using the refresh token.
 * @returns New tokens or null if refresh failed
 */
export async function refreshTokens(): Promise<RefreshResponse | null> {
  const refreshToken = getRefreshToken()

  if (!refreshToken) {
    console.log('[TokenRefresh] No refresh token available')
    return null
  }

  try {
    console.log('[TokenRefresh] Attempting token refresh...')

    const response = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!response.ok) {
      console.error('[TokenRefresh] Refresh failed:', response.status)
      // Clear tokens on refresh failure
      removeAuthToken()
      removeRefreshToken()
      return null
    }

    const data: RefreshResponse = await response.json()

    // Store new tokens
    setAuthToken(data.access_token)
    if (data.refresh_token) {
      setRefreshToken(data.refresh_token)
    }

    console.log('[TokenRefresh] Token refreshed successfully')
    return data
  } catch (error) {
    console.error('[TokenRefresh] Error during refresh:', error)
    removeAuthToken()
    removeRefreshToken()
    return null
  }
}

/**
 * Wrapper for fetch that automatically handles token refresh on 401.
 * Use this instead of fetch for authenticated requests.
 */
export async function fetchWithRefresh(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Add auth header if we have a token
  const token = getAuthToken()
  if (token) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    }
  }

  let response = await fetch(url, options)

  // If unauthorized, try to refresh token and retry
  if (response.status === 401) {
    console.log('[TokenRefresh] Got 401, attempting refresh...')

    const newTokens = await refreshTokens()

    if (newTokens) {
      // Retry with new token
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${newTokens.access_token}`
      }

      response = await fetch(url, options)
      console.log('[TokenRefresh] Retry response:', response.status)
    }
  }

  return response
}

/**
 * Check if token is about to expire and proactively refresh.
 * Call this periodically (e.g., every 5 minutes) to maintain session.
 */
export function scheduleTokenRefresh(
  intervalMs: number = 5 * 60 * 1000
): () => void {
  const intervalId = setInterval(async () => {
    const token = getAuthToken()
    if (!token) return

    // Decode token to check expiration (simple base64 decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiresAt = payload.exp * 1000
      const now = Date.now()
      const timeUntilExpiry = expiresAt - now

      // Refresh if less than 2 minutes until expiry
      if (timeUntilExpiry < 2 * 60 * 1000) {
        console.log('[TokenRefresh] Token expiring soon, proactive refresh')
        await refreshTokens()
      }
    } catch {
      // Token decode failed, ignore
    }
  }, intervalMs)

  // Return cleanup function
  return () => clearInterval(intervalId)
}
