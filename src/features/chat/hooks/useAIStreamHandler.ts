import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

import { useChatActions } from '@/features/chat/hooks/useChatActions'
import { usePlaygroundStore } from '../stores/playgroundStore'
import { trackEvent } from '@/components/providers/PostHogProvider'

// ... existing code ...

const isDebug = process.env.NODE_ENV === 'development'

type SSEEvent =
  | { type: 'content'; content: string }
  | { type: 'usage'; usage: unknown }
  | { type: 'done' }
  | { type: 'error'; error: string }

type ChatResponse = {
  session_id: string
  text: string
  message_id?: string
}

function parseSSELine(line: string): SSEEvent | null {
  if (!line) return null

  const normalized = line.startsWith('data:') ? line.slice(5).trim() : line

  if (!normalized) return null
  if (normalized === '[DONE]') return { type: 'done' }

  try {
    const payload = JSON.parse(normalized) as Record<string, unknown>
    if (payload && typeof payload.type === 'string') {
      if (payload.type === 'content' && typeof payload.content === 'string') {
        return { type: 'content', content: payload.content }
      }
      if (payload.type === 'usage') {
        return { type: 'usage', usage: payload.usage }
      }
      if (payload.type === 'done') {
        return { type: 'done' }
      }
      if (payload.type === 'error') {
        return {
          type: 'error',
          error:
            typeof payload.error === 'string' ? payload.error : 'Unknown error'
        }
      }
    }
    if (typeof payload === 'string') {
      return { type: 'content', content: payload }
    }
  } catch {
    return { type: 'content', content: normalized }
  }

  return null
}

/**
 * useAIStreamHandler is responsible for making API calls to the chat endpoint.
 *
 * Supports two modes:
 * 1. Streaming (SSE) - Real-time streaming via POST /api/chat/stream
 * 2. Non-streaming - Full response via POST /api/chat (fallback)
 *
 * Streaming is used when session_id exists (existing session).
 * Non-streaming is used for new sessions (to get session_id first).
 */
export const useAIStreamHandler = () => {
  const router = useRouter()
  // ... existing code ...

  const abortControllerRef = useRef<AbortController | null>(null)

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

  /**
   * Update the last agent message content (for streaming)
   */
  const appendToLastMessage = useCallback(
    (chunk: string) => {
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.role === 'agent') {
          lastMessage.content = (lastMessage.content || '') + chunk
        }
        return newMessages
      })
    },
    [setMessages]
  )

  /**
   * Handle streaming response via SSE
   */
  const handleStreamingChat = useCallback(
    async (
      message: string,
      currentSessionId: string,
      signal: AbortSignal
    ): Promise<void> => {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Use HttpOnly cookies for auth
        body: JSON.stringify({
          message: message.trim(),
          session_id: currentSessionId
        }),
        signal
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao iniciar streaming'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      if (!response.body) {
        throw new Error('No response body for streaming')
      }

      // Read the stream
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          // Decode chunk and add to buffer
          buffer += decoder.decode(value, { stream: true })

          // Process complete lines
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue

            const event = parseSSELine(trimmedLine)
            if (!event) continue

            switch (event.type) {
              case 'content':
                // Append content chunk to message
                appendToLastMessage(event.content)
                break

              case 'usage':
                // Log usage stats (optional)
                console.debug('[SSE] Usage:', event.usage)
                break

              case 'done':
                // Stream complete
                console.debug('[SSE] Stream complete')
                break

              case 'error':
                throw new Error(event.error)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }

      // Track streaming event
      trackEvent('chat_message_streamed', {
        session_id: currentSessionId,
        message_length: message.trim().length
      })
    },
    [appendToLastMessage]
  )

  /**
   * Handle non-streaming response (for new sessions or fallback)
   */
  const handleNonStreamingChat = useCallback(
    async (
      message: string,
      currentSessionId: string | null,
      signal: AbortSignal
    ): Promise<ChatResponse> => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Use HttpOnly cookies for auth
        body: JSON.stringify({
          message: message.trim(),
          session_id: currentSessionId
        }),
        signal
      })

      if (!response.ok) {
        let errorMessage = 'Erro ao enviar mensagem'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      return response.json()
    },
    []
  )

  /**
   * Cancel ongoing stream
   */
  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  const handleStreamResponse = useCallback(
    async (
      input: string | FormData,
      files?: ({ name: string; size: number } | File)[],
      explicitSessionId?: string | null,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _toolId?: string
    ) => {
      // Cancel any ongoing stream
      cancelStream()

      setIsStreaming(true)
      setStreamingErrorMessage('')

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      // Extract message from input
      const message =
        input instanceof FormData ? (input.get('message') as string) : input

      if (isDebug) {
        console.debug('[chat] handleStreamResponse start', {
          explicitSessionId,
          storeSessionId: sessionId,
          messageLength: message?.trim().length ?? 0,
          path: typeof window !== 'undefined' ? window.location.pathname : 'ssr'
        })
      }

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
      const sessionIdToUse =
        explicitSessionId !== undefined ? explicitSessionId : sessionId

      if (isDebug) {
        console.debug('[chat] resolved sessionId', {
          sessionIdToUse,
          explicitSessionId,
          storeSessionId: sessionId
        })
      }

      try {
        // Use streaming if we have a session ID, otherwise use non-streaming
        // (streaming requires session_id to be set first)
        if (sessionIdToUse) {
          // Streaming mode
          await handleStreamingChat(message, sessionIdToUse, signal)

          // Update message timestamp after streaming completes
          setMessages((prevMessages) => {
            const newMessages = [...prevMessages]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage && lastMessage.role === 'agent') {
              lastMessage.created_at = Math.floor(Date.now() / 1000)
            }
            return newMessages
          })

          // Track event
          trackEvent('chat_message_sent', {
            session_id: sessionIdToUse,
            message_length: message.trim().length,
            has_files: files && files.length > 0,
            file_count: files?.length || 0,
            is_new_session: false,
            streaming: true
          })
        } else {
          // Non-streaming mode (new session)
          const data = await handleNonStreamingChat(message, null, signal)

          if (isDebug) {
            console.debug('[chat] non-streaming response', {
              receivedSessionId: data.session_id,
              currentPath:
                typeof window !== 'undefined' ? window.location.pathname : 'ssr'
            })
          }

          // Track chat message event
          trackEvent('chat_message_sent', {
            session_id: data.session_id,
            message_length: message.trim().length,
            has_files: files && files.length > 0,
            file_count: files?.length || 0,
            is_new_session: true,
            streaming: false
          })

          // Update session ID
          if (data.session_id) {
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
              if (isDebug) {
                console.debug('[chat] navigating to new session', {
                  from: window.location.pathname,
                  to: `/chat/${data.session_id}`
                })
              }
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
        }
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === 'AbortError') {
          console.debug('[Chat] Request aborted')
          return
        }

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
        abortControllerRef.current = null
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
      router,
      handleStreamingChat,
      handleNonStreamingChat,
      cancelStream
    ]
  )

  return { handleStreamResponse, cancelStream }
}
