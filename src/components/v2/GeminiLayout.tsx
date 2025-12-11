'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './Header/Header'
import { MainContent } from './MainContent/MainContent'
import { InputBar } from './InputBar/InputBar'
import { ChatArea } from './ChatArea/ChatArea'
import { FilesSidebar } from './FilesSidebar'
import { usePlaygroundStore } from '@/store'
import useChatActions from '@/hooks/useChatActions'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { useAuth } from '@/contexts/AuthContext'

// Flag global para garantir que initializePlayground só execute UMA vez
let playgroundInitializationStarted = false

interface GeminiLayoutProps {
  sessionId?: string
}

export function GeminiLayout({ sessionId }: GeminiLayoutProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [hasMessages, setHasMessages] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const agentId = usePlaygroundStore((state) => state.agentId)
  const currentSessionId = usePlaygroundStore((state) => state.sessionId)
  const locallyCreatedSessionIds = usePlaygroundStore(
    (state) => state.locallyCreatedSessionIds
  )

  const { initializePlayground, loadSessionById } = useChatActions()
  const { handleStreamResponse } = useAIChatStreamHandler()

  // Inicializar playground APENAS UMA VEZ (usando flag global)
  useEffect(() => {
    if (!playgroundInitializationStarted) {
      playgroundInitializationStarted = true
      initializePlayground()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Carregar sessão se sessionId for fornecido
  useEffect(() => {
    const loadSession = async () => {
      // Se não há sessionId na URL, não precisa carregar
      if (!sessionId) {
        setIsLoadingSession(false)
        return
      }

      // Se essa sessão foi criada localmente, não tentar carregar do backend
      if (locallyCreatedSessionIds.has(sessionId)) {
        setIsLoadingSession(false)
        return
      }

      // Se o sessionId da URL é igual ao do store, não precisa carregar novamente
      // (já está carregado)
      if (sessionId === currentSessionId) {
        setIsLoadingSession(false)
        return
      }

      // Carregar sessão do backend apenas se for DIFERENTE da atual
      setIsLoadingSession(true)

      const success = await loadSessionById(sessionId)

      setIsLoadingSession(false)

      // Se falhou ao carregar, redirecionar para /chat
      if (!success) {
        router.push('/chat')
      }
    }

    loadSession()
  }, [
    sessionId,
    currentSessionId,
    loadSessionById,
    router,
    locallyCreatedSessionIds
  ])

  // Verificar se há mensagens para alternar entre MainContent e ChatArea
  useEffect(() => {
    setHasMessages(messages.length > 0)
  }, [messages])

  const handleSendMessage = async (
    msg: string,
    files?: File[],
    toolId?: string
  ) => {
    if (!msg.trim() || isStreaming) return

    // IMPORTANTE: Ler sessionId diretamente do store no momento do envio
    // para pegar o valor mais atualizado (pode ter sido setado pelo RunStarted)
    const { sessionId: currentSessionIdFromStore } =
      usePlaygroundStore.getState()

    // Se não há sessionId, enviar null - o backend criará uma nova sessão
    // e retornará o session_id na resposta (formato s_xxx)
    // A navegação para /chat/{session_id} acontece após receber a resposta
    const sessionIdToUse = currentSessionIdFromStore || null

    await handleStreamResponse(msg, files, sessionIdToUse, toolId)
    setMessage('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage(suggestion)
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-verde-50 dark:bg-background">
      {/* Header - Fixed at top */}
      <Header />

      {/* Main Container - Flex Row to accommodate Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left/Center Column - Chat & Input */}
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingSession ? (
              // Loading state
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verde-900 border-t-transparent"></div>
                  <p className="text-verde-700">Carregando conversa...</p>
                </div>
              </div>
            ) : hasMessages ? (
              // Adjust ChatArea to not have its own scroll if needed,
              // but typically ChatArea handles its own scrolling.
              // We might need to ensure ChatArea takes full height.
              <ChatArea messages={messages} isStreaming={isStreaming} />
            ) : (
              <MainContent onSuggestionClick={handleSuggestionClick} />
            )}
            {/* Spacer for InputBar height to prevent content being hidden behind floating input */}
            <div className="h-32 md:h-40" />
          </div>

          {/* Floating Input Bar - Positioned at bottom */}
          <div className="z-10 w-full">
            <InputBar
              onSendMessage={handleSendMessage}
              message={message}
              setMessage={setMessage}
              disabled={isStreaming || isLoadingSession}
              userId={user?.id}
              sessionId={currentSessionId || undefined}
            />
          </div>
        </div>

        {/* Right Sidebar - Files */}
        <FilesSidebar conversationId={currentSessionId || null} />
      </div>
    </div>
  )
}
