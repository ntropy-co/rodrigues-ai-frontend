import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { usePlaygroundStore } from '../store'

import { ComboboxAgent, type PlaygroundChatMessage } from '@/types/playground'
import {
  getPlaygroundAgentsAPI,
  getPlaygroundStatusAPI
} from '@/api/playground'
import { useQueryState } from 'nuqs'

const useChatActions = () => {
  const { chatInputRef } = usePlaygroundStore()
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const [sessionId, setSessionId] = useQueryState('session')
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const setIsEndpointActive = usePlaygroundStore(
    (state) => state.setIsEndpointActive
  )
  const setIsEndpointLoading = usePlaygroundStore(
    (state) => state.setIsEndpointLoading
  )
  const setAgents = usePlaygroundStore((state) => state.setAgents)
  const setSelectedModel = usePlaygroundStore((state) => state.setSelectedModel)
  const [agentId, setAgentId] = useQueryState('agent')
  
  // Função para gerar um novo user ID (UUID)
  const generateUserId = useCallback(() => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])
  
  // Função para gerar um novo session ID
  const generateSessionId = useCallback(() => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }, [])
  
  // Função para salvar user ID no localStorage
  const saveUserIdToStorage = useCallback((userId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ubyfol_user_id', userId)
    }
  }, [])
  
  // Função para carregar user ID do localStorage
  const loadUserIdFromStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ubyfol_user_id')
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
      localStorage.setItem('ubyfol_current_session_id', sessionId)
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
  
  // Efeito para criar nova sessão quando agente for selecionado
  useEffect(() => {
    if (agentId && agentId !== 'no-agents' && !sessionId) {
      createNewSession()
    }
  }, [agentId, sessionId, createNewSession])

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
    // Criar uma nova sessão automaticamente
    const newSessionId = createNewSession()
    // Trigger a refresh of sessions list
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sessionCreated', { detail: { sessionId: newSessionId } }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNewSession])

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
        if (agents.length > 0) {
          if (!agentId || agentId === 'no-agents') {
            const firstAgent = agents[0]
            setAgentId(firstAgent.value)
            setSelectedModel(firstAgent.model.provider || '')
          }
        }
      } else {
        setIsEndpointActive(false)
      }
      setAgents(agents)
      return agents
    } catch {
      setIsEndpointLoading(false)
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

  return {
    clearChat,
    addMessage,
    getAgents,
    focusChatInput,
    initializePlayground,
    ensureSessionExists,
    createNewSession,
    getCurrentUserId
  }
}

export default useChatActions
