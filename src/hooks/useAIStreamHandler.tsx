import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import useChatActions from '@/hooks/useChatActions'
import { usePlaygroundStore } from '../store'
import { useAuth } from '@/contexts/AuthContext'
import { trackEvent } from '@/components/providers/PostHogProvider'

/**
 * Chat response from backend
 */
interface ChatResponse {
  text: string
  session_id: string
  message_id?: string
}

/**
 * useAIChatStreamHandler is responsible for making API calls to the chat endpoint.
 * Uses POST /api/chat which proxies to /api/v1/chat on the backend.
 */
const useAIChatStreamHandler = () => {
  const router = useRouter()

  // Consolidated Zustand selectors with shallow equality to prevent unnecessary re-renders
  const {
    setMessages,
    sessionId,
    setSessionId,
    setStreamingErrorMessage,
    setIsStreaming,
    setSessionsData,
    addLocallyCreatedSessionId
  } = usePlaygroundStore(
    useShallow((state) => ({
      setMessages: state.setMessages,
      sessionId: state.sessionId,
      setSessionId: state.setSessionId,
      setStreamingErrorMessage: state.setStreamingErrorMessage,
      setIsStreaming: state.setIsStreaming,
      setSessionsData: state.setSessionsData,
      addLocallyCreatedSessionId: state.addLocallyCreatedSessionId
    }))
  )

  const { addMessage, focusChatInput, saveSessionIdToStorage } =
    useChatActions()
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
      files?: File[],
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

      // Add user message with attached files
      addMessage({
        role: 'user',
        content: message,
        created_at: Math.floor(Date.now() / 1000),
        files: files?.map((f) => ({ name: f.name, size: f.size }))
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
          let errorMessage = 'Erro ao enviar mensagem'
          try {
            const errorData = await response.json()
            errorMessage = errorData.detail || errorMessage
          } catch {
            // Response is not JSON (e.g., HTML error page)
            errorMessage = `Erro ${response.status}: ${response.statusText}`
          }
          throw new Error(errorMessage)
        }

        const data: ChatResponse = await response.json()

        // Track chat message event
        trackEvent('chat_message_sent', {
          session_id: data.session_id,
          message_length: message.trim().length,
          has_files: files && files.length > 0,
          file_count: files?.length || 0,
          is_new_session: data.session_id !== sessionId
        })

        // Update session ID if backend returned a new one
        if (data.session_id && data.session_id !== sessionId) {
          setSessionId(data.session_id)
          saveSessionIdToStorage(data.session_id)
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
            lastMessage.id = data.message_id
            lastMessage.created_at = Math.floor(Date.now() / 1000)
          }
          return newMessages
        })
      } catch (error) {
        updateMessagesWithErrorState()
        let errorMessage =
          error instanceof Error ? error.message : String(error)

        // Handle specific error types with better messages
        if (
          errorMessage.toLowerCase().includes('sessão') ||
          errorMessage.toLowerCase().includes('session')
        ) {
          errorMessage =
            'Sessão inválida ou expirada. Por favor, inicie uma nova conversa.'
          // Clear the invalid session
          setSessionId(null)
        } else if (errorMessage.includes('401')) {
          errorMessage = 'Sua sessão expirou. Por favor, faça login novamente.'
        } else if (errorMessage.includes('500')) {
          errorMessage =
            'Erro interno do servidor. Tente novamente em alguns instantes.'
        }

        setStreamingErrorMessage(errorMessage)
        toast.error(errorMessage)
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
      saveSessionIdToStorage,
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
