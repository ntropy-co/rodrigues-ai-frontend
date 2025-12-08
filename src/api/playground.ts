import { toast } from 'sonner'

import { Agent, ComboboxAgent, SessionEntry } from '@/types/playground'

export const getPlaygroundAgentsAPI = async (): Promise<ComboboxAgent[]> => {
  const url = '/api/playground/agents'

  try {
    const response = await fetch(url, { method: 'GET', credentials: 'include' })

    if (!response.ok) {
      toast.error(`Failed to fetch playground agents: ${response.statusText}`)
      return []
    }

    const data = await response.json()

    const agents: ComboboxAgent[] = data.map((item: Agent) => ({
      value: item.agent_id || '',
      label: item.name || '',
      model: item.model || '',
      storage: item.storage || false
    }))

    return agents
  } catch {
    toast.error('Error fetching playground agents')
    return []
  }
}

export const getPlaygroundStatusAPI = async (): Promise<number> => {
  const response = await fetch('/api/playground/status', {
    method: 'GET',
    credentials: 'include'
  })
  return response.status
}

export const getAllPlaygroundSessionsAPI = async (
  agentId: string,
  userId?: string
): Promise<SessionEntry[]> => {
  try {
    let url = `/api/playground/agents/${agentId}/sessions`
    if (userId) {
      url += `?user_id=${encodeURIComponent(userId)}`
    }

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status === 404) {
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
  agentId: string,
  sessionId: string,
  userId?: string
) => {
  let url = `/api/playground/agents/${agentId}/sessions/${sessionId}`
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
  agentId: string,
  sessionId: string
) => {
  const url = `/api/playground/agents/${agentId}/sessions/${sessionId}`

  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include'
  })

  return response
}
