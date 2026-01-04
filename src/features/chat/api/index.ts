import { fetchWithRefresh } from '@/lib/auth/token-refresh'
import type { ChatFile } from '../types'
import type { SessionEntry } from '@/features/chat'

/**
 * Backend session structure
 */
interface BackendSession {
  id: string
  user_id: string
  title: string | null
  project_id?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface BackendFile {
  id: string
  conversationId?: string
  conversation_id?: string
  type?: 'generated' | 'upload'
  fileName?: string
  filename?: string
  fileExtension?: string
  fileCategory?: string
  fileSize?: number
  file_size?: number
  mimeType?: string
  mime_type?: string
  uploadedAt?: string
  created_at?: string
  document_id?: string
  url?: string
}

/**
 * Maps backend session to frontend SessionEntry format
 */
function mapToSessionEntry(session: BackendSession): SessionEntry {
  return {
    session_id: session.id,
    title: session.title || 'Nova Conversa',
    project_id: session.project_id,
    created_at: Math.floor(new Date(session.created_at).getTime() / 1000)
  }
}

export const chatApi = {
  /**
   * Sessions
   */
  async getSessions(projectId?: string | null): Promise<SessionEntry[]> {
    const url = projectId
      ? `/api/sessions?project_id=${projectId}`
      : '/api/sessions'

    const response = await fetchWithRefresh(url)
    if (!response.ok) throw new Error('Erro ao carregar sessões')

    const data: BackendSession[] = await response.json()
    return data.map(mapToSessionEntry)
  },

  async createSession(
    title?: string,
    projectId?: string
  ): Promise<SessionEntry> {
    const response = await fetchWithRefresh('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, project_id: projectId })
    })
    if (!response.ok) throw new Error('Erro ao criar sessão')

    const data: BackendSession = await response.json()
    return mapToSessionEntry(data)
  },

  async updateSession(
    sessionId: string,
    data: { title?: string; project_id?: string | null }
  ): Promise<SessionEntry> {
    const response = await fetchWithRefresh(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Erro ao atualizar sessão')

    const result: BackendSession = await response.json()
    return mapToSessionEntry(result)
  },

  async deleteSession(sessionId: string): Promise<void> {
    const response = await fetchWithRefresh(`/api/sessions/${sessionId}`, {
      method: 'DELETE'
    })
    if (!response.ok && response.status !== 204)
      throw new Error('Erro ao deletar sessão')
  },

  /**
   * Files
   */
  async getFiles(
    conversationId: string,
    userId?: string,
    signal?: AbortSignal
  ): Promise<ChatFile[]> {
    const url = new URL('/api/documents/conversation', window.location.origin)
    url.searchParams.append('conversation_id', conversationId)
    if (userId) url.searchParams.append('user_id', userId)

    const response = await fetchWithRefresh(url.toString(), { signal })
    if (!response.ok) throw new Error('Erro ao carregar arquivos')

    const data = await response.json()
    return (data.files || []).map((file: BackendFile) => ({
      id: file.id,
      conversationId:
        file.conversationId || file.conversation_id || conversationId,
      type: file.type === 'generated' ? 'generated' : 'upload',
      fileName: file.fileName || file.filename || 'unknown',
      fileExtension: file.fileExtension || '',
      fileCategory: file.fileCategory || 'other',
      fileSize: file.fileSize || file.file_size || 0,
      mimeType: file.mimeType || file.mime_type || 'application/octet-stream',
      uploadedAt: new Date(file.uploadedAt || file.created_at || new Date()),
      url: file.url || ''
    }))
  },

  async uploadFile(
    file: File,
    conversationId: string,
    userId?: string
  ): Promise<BackendFile> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('conversation_id', conversationId)
    if (userId) formData.append('user_id', userId)

    const response = await fetchWithRefresh('/api/documents/upload', {
      method: 'POST',
      body: formData
    })
    if (!response.ok) throw new Error('Erro ao enviar arquivo')
    return response.json()
  },

  /**
   * Projects
   */
  async getProjects(): Promise<Project[]> {
    const response = await fetchWithRefresh('/api/projects')
    if (!response.ok) {
      if (response.status === 401 || response.status === 404) return []
      throw new Error('Erro ao carregar projetos')
    }
    return response.json()
  },

  async getProject(id: string): Promise<Project> {
    const response = await fetchWithRefresh(`/api/projects/${id}`)
    if (!response.ok) throw new Error('Erro ao carregar projeto')
    return response.json()
  },

  async createProject(data: {
    title: string
    description?: string
  }): Promise<Project> {
    const response = await fetchWithRefresh('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Erro ao criar projeto')
    return response.json()
  },

  async updateProject(
    id: string,
    data: { title?: string; description?: string }
  ): Promise<Project> {
    const response = await fetchWithRefresh(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Erro ao atualizar projeto')
    return response.json()
  },

  async deleteProject(id: string): Promise<void> {
    const response = await fetchWithRefresh(`/api/projects/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok && response.status !== 204)
      throw new Error('Erro ao deletar projeto')
  }
}

/**
 * Project from backend
 */
export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
