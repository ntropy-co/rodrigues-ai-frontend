/**
 * Playground API functions
 *
 * Note: The chat functionality now uses /api/chat which proxies to /api/v1/chat
 * Sessions are managed by the backend using session_id parameter
 */

// Health check - verify if backend is available
export const getPlaygroundStatusAPI = async (): Promise<number> => {
  const response = await fetch('/api/playground/status', {
    method: 'GET',
    credentials: 'include'
  })
  return response.status
}
