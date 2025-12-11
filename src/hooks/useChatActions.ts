import { useCallback } from 'react'
import { toast } from 'sonner'

import { usePlaygroundStore } from '../store'
import { type PlaygroundChatMessage } from '@/types/playground'

const useChatActions = () => {
  const { chatInputRef } = usePlaygroundStore()
  const sessionId = usePlaygroundStore((state) => state.sessionId)
  const setSessionId = usePlaygroundStore((state) => state.setSessionId)
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const setIsEndpointActive = usePlaygroundStore(
    (state) => state.setIsEndpointActive
  )
  const setIsEndpointLoading = usePlaygroundStore(
    (state) => state.setIsEndpointLoading
  )

  // Função para gerar um novo session ID (UUID v4)
  const generateSessionId = useCallback(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }, [])

  // Função para salvar session ID no localStorage
  const saveSessionIdToStorage = useCallback((sessionId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rodrigues_current_session_id', sessionId)
    }
  }, [])

  // Função para criar uma nova sessão automaticamente
  const ensureSessionExists = useCallback(() => {
    if (!sessionId) {
      const newSessionId = generateSessionId()
      setSessionId(newSessionId)
      saveSessionIdToStorage(newSessionId)
    }
  }, [sessionId, setSessionId, generateSessionId, saveSessionIdToStorage])

  // Função para criar uma nova sessão (sempre nova)
  const createNewSession = useCallback(() => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    saveSessionIdToStorage(newSessionId)
    return newSessionId
  }, [generateSessionId, setSessionId, saveSessionIdToStorage])

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
      const response = await fetch('/api/playground/status')
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

  // Load session by ID - sessions are now managed by the backend via session_id
  const loadSessionById = useCallback(
    async (sessionIdToLoad: string): Promise<boolean> => {
      try {
        setIsEndpointLoading(true)
        // Just set the session ID - messages will come from chat responses
        setSessionId(sessionIdToLoad)
        return true
      } catch (error) {
        console.error('Error loading session:', error)
        toast.error('Falha ao carregar a conversa')
        return false
      } finally {
        setIsEndpointLoading(false)
      }
    },
    [setSessionId, setIsEndpointLoading]
  )

  return {
    clearChat,
    addMessage,
    focusChatInput,
    initializePlayground,
    ensureSessionExists,
    createNewSession,
    loadSessionById
  }
}

export default useChatActions
