import { toast } from 'sonner'

import { APIRoutes } from './routes'

import { Agent, ComboboxAgent, SessionEntry } from '@/types/playground'

export const getPlaygroundAgentsAPI = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endpoint: string
): Promise<ComboboxAgent[]> => {
  // Use Next.js API Route as proxy to avoid CORS issues
  const url = '/api/playground/agents'
  console.log('[getPlaygroundAgentsAPI] Fetching from:', url)

  try {
    const response = await fetch(url, { method: 'GET', credentials: 'include' })
    console.log('[getPlaygroundAgentsAPI] Response status:', response.status)

    if (!response.ok) {
      console.error(
        '[getPlaygroundAgentsAPI] Response not ok:',
        response.statusText
      )
      toast.error(`Failed to fetch playground agents: ${response.statusText}`)
      return []
    }

    const data = await response.json()
    console.log('[getPlaygroundAgentsAPI] Received data:', data)

    // Transform the API response into the expected shape.
    const agents: ComboboxAgent[] = data.map((item: Agent) => ({
      value: item.agent_id || '',
      label: item.name || '',
      model: item.model || '',
      storage: item.storage || false
    }))

    console.log('[getPlaygroundAgentsAPI] Transformed agents:', agents)
    return agents
  } catch (error) {
    console.error('[getPlaygroundAgentsAPI] Error:', error)
    toast.error('Error fetching playground agents')
    return []
  }
}

export const getPlaygroundStatusAPI = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  base: string
): Promise<number> => {
  // Use Next.js API Route as proxy to avoid CORS issues
  const response = await fetch('/api/playground/status', {
    method: 'GET',
    credentials: 'include'
  })
  return response.status
}

export const getAllPlaygroundSessionsAPI = async (
  base: string,
  agentId: string,
  userId?: string
): Promise<SessionEntry[]> => {
  try {
    let url = APIRoutes.GetPlaygroundSessions(base, agentId)
    if (userId) {
      url += `?user_id=${encodeURIComponent(userId)}`
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 404) {
        // Return empty array when storage is not enabled
        return []
      }
      throw new Error(`Failed to fetch sessions: ${response.statusText}`)
    }
    return response.json()
  } catch {
    return []
  }
}

export const getPlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string,
  userId?: string
) => {
  let url = APIRoutes.GetPlaygroundSession(base, agentId, sessionId)
  if (userId) {
    url += `?user_id=${encodeURIComponent(userId)}`
  }

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include'
  })
  return response.json()
}

export const deletePlaygroundSessionAPI = async (
  base: string,
  agentId: string,
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userId?: string
) => {
  const response = await fetch(
    APIRoutes.DeletePlaygroundSession(base, agentId, sessionId),
    {
      method: 'DELETE',
      credentials: 'include'
    }
  )
  return response
}
