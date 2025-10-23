// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { usePlaygroundStore } from '../store'
import useSessionLoader from './useSessionLoader'

import { ComboboxAgent, type PlaygroundChatMessage } from '@/types/playground'
import {
  getPlaygroundAgentsAPI,
  getPlaygroundStatusAPI
} from '@/api/playground'

const useChatActions = () => {
  const { chatInputRef } = usePlaygroundStore()
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const sessionId = usePlaygroundStore((state) => state.sessionId)
  const setSessionId = usePlaygroundStore((state) => state.setSessionId)
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const setIsEndpointActive = usePlaygroundStore(
    (state) => state.setIsEndpointActive
  )
  const setIsEndpointLoading = usePlaygroundStore(
    (state) => state.setIsEndpointLoading
  )
  const setAgents = usePlaygroundStore((state) => state.setAgents)
  const setSelectedModel = usePlaygroundStore((state) => state.setSelectedModel)
  const agentId = usePlaygroundStore((state) => state.agentId)
  const setAgentId = usePlaygroundStore((state) => state.setAgentId)

  // Usar o hook useSessionLoader
  const { getSession } = useSessionLoader()

  // Função para gerar um novo user ID (UUID)
  const generateUserId = useCallback(() => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Função para gerar um novo session ID (UUID v4)
  const generateSessionId = useCallback(() => {
    // Use crypto.randomUUID() if available, otherwise fallback
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    // Fallback UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }, [])

  // Função para salvar user ID no localStorage
  const saveUserIdToStorage = useCallback((userId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rodrigues_user_id', userId)
    }
  }, [])

  // Função para carregar user ID do localStorage
  const loadUserIdFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('rodrigues_user_id')
    }
    return null
  }, [])

  // Função para garantir que existe um user ID
  const ensureUserIdExists = useCallback(() => {
    let userId = loadUserIdFromStorage()
    if (!userId) {
      userId = generateUserId()
      saveUserIdToStorage(userId)
    }
    return userId
  }, [loadUserIdFromStorage, generateUserId, saveUserIdToStorage])

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

  // Função para obter o user ID atual
  const getCurrentUserId = useCallback(() => {
    return ensureUserIdExists()
  }, [ensureUserIdExists])

  // NÃO criar sessão automaticamente - deixar backend criar na primeira mensagem
  // useEffect REMOVIDO: estava criando sessionId antes de enviar a mensagem

  const getStatus = useCallback(async () => {
    try {
      const status = await getPlaygroundStatusAPI(selectedEndpoint)
      return status
    } catch {
      return 503
    }
  }, [selectedEndpoint])

  const getAgents = useCallback(async () => {
    try {
      const agents = await getPlaygroundAgentsAPI(selectedEndpoint)
      return agents
    } catch {
      toast.error('Error fetching agents')
      return []
    }
  }, [selectedEndpoint])

  const clearChat = useCallback(() => {
    setMessages([])
    // Limpar session ID - nova sessão será criada ao enviar primeira mensagem
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

  const initializePlayground = useCallback(async () => {
    setIsEndpointLoading(true)
    try {
      const status = await getStatus()
      let agents: ComboboxAgent[] = []
      if (status === 200) {
        setIsEndpointActive(true)
        agents = await getAgents()
        if (agents.length > 0 && (!agentId || agentId === 'no-agents')) {
          // Apenas setar agentId na primeira vez (se não estiver setado)
          const firstAgent = agents[0]
          setAgentId(firstAgent.value)
          setSelectedModel(firstAgent.model.provider || '')
        }
      } else {
        setIsEndpointActive(false)
      }
      setAgents(agents)
      return agents
    } finally {
      setIsEndpointLoading(false)
    }
  }, [
    getStatus,
    getAgents,
    setIsEndpointActive,
    setIsEndpointLoading,
    setAgents,
    setAgentId,
    setSelectedModel,
    agentId
  ])

  // Função para carregar uma sessão pelo ID
  const loadSessionById = useCallback(
    async (sessionId: string): Promise<boolean> => {
      try {
        setIsEndpointLoading(true)

        // Verificar se agentId está disponível
        if (!agentId) {
          toast.error('Agente não configurado')
          return false
        }

        // Usar getSession do useSessionLoader que faz a transformação correta
        const messages = await getSession(sessionId, agentId)

        if (messages && messages.length > 0) {
          setSessionId(sessionId)
          return true
        }

        // Se não há mensagens, considerar como erro
        toast.error('Sessão não encontrada ou vazia')
        return false
      } catch (error) {
        console.error('Error loading session:', error)
        toast.error('Falha ao carregar a conversa')
        return false
      } finally {
        setIsEndpointLoading(false)
      }
    },
    [agentId, getSession, setSessionId, setIsEndpointLoading]
  )

  return {
    clearChat,
    addMessage,
    getAgents,
    focusChatInput,
    initializePlayground,
    ensureSessionExists,
    createNewSession,
    getCurrentUserId,
    loadSessionById
  }
}

export default useChatActions
