import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import useChatActions from '@/hooks/useChatActions'
import { usePlaygroundStore } from '../store'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Chat response from backend
 */
interface ChatResponse {
  text: string
  session_id: string
}

/**
 * useAIChatStreamHandler is responsible for making API calls to the chat endpoint.
 * Uses POST /api/chat which proxies to /api/v1/chat on the backend.
 */
const useAIChatStreamHandler = () => {
  const router = useRouter()
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const { addMessage, focusChatInput } = useChatActions()
  const sessionId = usePlaygroundStore((state) => state.sessionId)
  const setSessionId = usePlaygroundStore((state) => state.setSessionId)
  const setStreamingErrorMessage = usePlaygroundStore(
    (state) => state.setStreamingErrorMessage
  )
  const setIsStreaming = usePlaygroundStore((state) => state.setIsStreaming)
  const setSessionsData = usePlaygroundStore((state) => state.setSessionsData)
  const addLocallyCreatedSessionId = usePlaygroundStore(
    (state) => state.addLocallyCreatedSessionId
  )
  const { token } = useAuth()

  const updateMessagesWithErrorState = useCallback(() => {
    setMessages((prevMessages) => {
      const newMessages = [...prevMessages]
      const lastMessage = newMessages[newMessages.length - 1]
      if (lastMessage && lastMessage.role === 'agent') {
        lastMessage.streamingError = true
      }
      return newMessages
    })
  }, [setMessages])

  const handleStreamResponse = useCallback(
    async (
      input: string | FormData,
      _files?: File[],
      explicitSessionId?: string | null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _toolId?: string
    ) => {
      setIsStreaming(true)
      setStreamingErrorMessage('')

      // Extract message from input
      const message =
        input instanceof FormData ? (input.get('message') as string) : input

      if (!message?.trim()) {
        setIsStreaming(false)
        return
      }

      // Remove previous error messages if retrying
      setMessages((prevMessages) => {
        if (prevMessages.length >= 2) {
          const lastMessage = prevMessages[prevMessages.length - 1]
          const secondLastMessage = prevMessages[prevMessages.length - 2]
          if (
            lastMessage.role === 'agent' &&
            lastMessage.streamingError &&
            secondLastMessage.role === 'user'
          ) {
            return prevMessages.slice(0, -2)
          }
        }
        return prevMessages
      })

      // Add user message
      addMessage({
        role: 'user',
        content: message,
        created_at: Math.floor(Date.now() / 1000)
      })

      // Add placeholder for agent response
      addMessage({
        role: 'agent',
        content: '',
        streamingError: false,
        created_at: Math.floor(Date.now() / 1000) + 1
      })

      // Determine session ID to use
      const sessionIdToSend =
        explicitSessionId !== undefined ? explicitSessionId : sessionId

      try {
        if (!token) {
          throw new Error('Usuário não autenticado')
        }

        // Call chat API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            message: message.trim(),
            session_id: sessionIdToSend || null
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Erro ao enviar mensagem')
        }

        const data: ChatResponse = await response.json()

        // Update session ID if backend returned a new one
        if (data.session_id && data.session_id !== sessionId) {
          setSessionId(data.session_id)
          addLocallyCreatedSessionId(data.session_id)

          // Add to sessions list
          setSessionsData((prevSessionsData) => {
            const sessionExists = prevSessionsData?.some(
              (session) => session.session_id === data.session_id
            )
            if (sessionExists) {
              return prevSessionsData
            }
            return [
              {
                session_id: data.session_id,
                title: message.substring(0, 50),
                created_at: Math.floor(Date.now() / 1000)
              },
              ...(prevSessionsData ?? [])
            ]
          })

          // Navigate to session URL
          if (window.location.pathname !== `/chat/${data.session_id}`) {
            router.push(`/chat/${data.session_id}`)
          }
        }

        // Update agent message with response
        setMessages((prevMessages) => {
          const newMessages = [...prevMessages]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && lastMessage.role === 'agent') {
            lastMessage.content = data.text
            lastMessage.created_at = Math.floor(Date.now() / 1000)
          }
          return newMessages
        })
      } catch (error) {
        updateMessagesWithErrorState()
        setStreamingErrorMessage(
          error instanceof Error ? error.message : String(error)
        )
      } finally {
        focusChatInput()
        setIsStreaming(false)
      }
    },
    [
      setMessages,
      addMessage,
      updateMessagesWithErrorState,
      setStreamingErrorMessage,
      setIsStreaming,
      focusChatInput,
      setSessionsData,
      sessionId,
      setSessionId,
      addLocallyCreatedSessionId,
      token,
      router
    ]
  )

  return { handleStreamResponse }
}

export default useAIChatStreamHandler
