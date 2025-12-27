import { useCallback } from 'react'
import { toast } from 'sonner'

import { usePlaygroundStore } from '../store'
import { type PlaygroundChatMessage } from '@/types/playground'
import { fetchWithRefresh } from '@/lib/auth/token-refresh'
import { useChatInputRef } from '@/contexts/ChatInputContext'

const useChatActions = () => {
  const chatInputRef = useChatInputRef()
  const setSessionId = usePlaygroundStore((state) => state.setSessionId)
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const setIsEndpointActive = usePlaygroundStore(
    (state) => state.setIsEndpointActive
  )
  const setIsEndpointLoading = usePlaygroundStore(
    (state) => state.setIsEndpointLoading
  )

  // Função para salvar session ID no localStorage (usado quando backend retorna session_id)
  const saveSessionIdToStorage = useCallback((sessionIdToSave: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rodrigues_current_session_id', sessionIdToSave)
    }
  }, [])

  // Função para garantir que sessão existe - agora apenas verifica
  // O backend cria a sessão automaticamente na primeira mensagem
  const ensureSessionExists = useCallback(() => {
    // No-op: backend creates session on first message and returns session_id
    // The session_id will be saved when we receive the response
  }, [])

  // Função para criar uma nova sessão - limpa sessão atual
  // O backend criará nova sessão na próxima mensagem
  const createNewSession = useCallback(() => {
    setSessionId(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rodrigues_current_session_id')
    }
    return null
  }, [setSessionId])

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [setMessages, setSessionId])

  const focusChatInput = useCallback(() => {
    setTimeout(() => {
      requestAnimationFrame(() => chatInputRef?.current?.focus())
    }, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addMessage = useCallback(
    (message: PlaygroundChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message])
    },
    [setMessages]
  )

  // Initialize playground - check if backend is available
  const initializePlayground = useCallback(async () => {
    setIsEndpointLoading(true)
    try {
      // Check backend health using the status endpoint (which calls /api/v1/health)
      const response = await fetchWithRefresh('/api/playground/status')
      const isActive = response.ok

      setIsEndpointActive(isActive)

      if (!isActive) {
        toast.error('Backend não disponível')
      }
    } catch {
      setIsEndpointActive(false)
      toast.error('Erro ao conectar com o backend')
    } finally {
      setIsEndpointLoading(false)
    }
  }, [setIsEndpointActive, setIsEndpointLoading])

  // Fetch chat history from backend
  const fetchChatHistory = useCallback(
    async (sessionId: string): Promise<PlaygroundChatMessage[]> => {
      try {
        const response = await fetchWithRefresh(
          `/api/chat/history/${sessionId}`,
          {
            method: 'GET'
          }
        )

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Failed to fetch chat history:', errorData)
          return []
        }

        const data = await response.json()
        return data.messages || []
      } catch (error) {
        console.error('Error fetching chat history:', error)
        return []
      }
    },
    []
  )

  // Load session by ID - fetches chat history and sets messages
  const loadSessionById = useCallback(
    async (sessionIdToLoad: string): Promise<boolean> => {
      try {
        setIsEndpointLoading(true)

        // Set the session ID
        setSessionId(sessionIdToLoad)

        // Fetch chat history from backend
        const messages = await fetchChatHistory(sessionIdToLoad)

        // Set messages in store
        if (messages.length > 0) {
          setMessages(messages)
        }

        return true
      } catch (error) {
        console.error('Error loading session:', error)
        toast.error('Falha ao carregar a conversa')
        return false
      } finally {
        setIsEndpointLoading(false)
      }
    },
    [setSessionId, setIsEndpointLoading, fetchChatHistory, setMessages]
  )

  return {
    clearChat,
    addMessage,
    focusChatInput,
    initializePlayground,
    ensureSessionExists,
    createNewSession,
    loadSessionById,
    saveSessionIdToStorage
  }
}

export default useChatActions
