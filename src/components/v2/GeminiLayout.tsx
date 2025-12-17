'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { ChatHeader } from './Header/ChatHeader'
import { MainContent } from './MainContent/MainContent'
import { InputBar } from './InputBar/InputBar'
import { ChatArea } from './ChatArea/ChatArea'
import { FilesSidebar } from './FilesSidebar'
import { ConversationsSidebar } from './ConversationsSidebar'
import { usePlaygroundStore } from '@/store'
import { useLayoutStore } from '@/stores/layoutStore'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
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

  // Responsive layout hook
  useResponsiveLayout()

  // Layout store
  const {
    conversationsSidebar,
    filesSidebar,
    isMobile,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggleConversationsSidebar: _toggleConversationsSidebar,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    toggleFilesSidebar: _toggleFilesSidebar,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    openConversationsSidebar: _openConversationsSidebar,
    closeConversationsSidebar,
    closeFilesSidebar
  } = useLayoutStore()

  const isConversationsOpen = conversationsSidebar === 'open'
  const isFilesOpen = filesSidebar === 'open'

  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)
  const currentSessionId = usePlaygroundStore((state) => state.sessionId)
  const locallyCreatedSessionIds = usePlaygroundStore(
    (state) => state.locallyCreatedSessionIds
  )

  const { initializePlayground, loadSessionById, clearChat } = useChatActions()

  const { handleStreamResponse } = useAIChatStreamHandler()

  // Inicializar playground APENAS UMA VEZ
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
      if (!sessionId) {
        setIsLoadingSession(false)
        return
      }

      if (locallyCreatedSessionIds.has(sessionId)) {
        setIsLoadingSession(false)
        return
      }

      if (sessionId === currentSessionId) {
        setIsLoadingSession(false)
        return
      }

      setIsLoadingSession(true)
      const success = await loadSessionById(sessionId)
      setIsLoadingSession(false)

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

  // Verificar se há mensagens
  useEffect(() => {
    setHasMessages(messages.length > 0)
  }, [messages])

  const handleSendMessage = async (
    msg: string,
    files?: File[],
    toolId?: string
  ) => {
    if (!msg.trim() || isStreaming) return

    const { sessionId: currentSessionIdFromStore } =
      usePlaygroundStore.getState()

    const sessionIdToUse = currentSessionIdFromStore || null

    await handleStreamResponse(msg, files, sessionIdToUse, toolId)
    setMessage('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage(suggestion)
  }

  const handleNewConversation = () => {
    clearChat()
    router.push('/chat')
  }

  const handleSelectConversation = (id: string) => {
    router.push(`/chat/${id}`)
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-verde-50 dark:bg-background">
      {/* Header */}
      <ChatHeader />

      {/* Main Container - 3-Column Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Conversations */}
        <ConversationsSidebar
          isOpen={isConversationsOpen && !isMobile}
          onToggle={closeConversationsSidebar}
          activeConversationId={currentSessionId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

        {/* Mobile Overlay for Conversations */}
        <AnimatePresence>
          {isMobile && isConversationsOpen && (
            <ConversationsSidebar
              isOpen={true}
              overlay={true}
              onToggle={closeConversationsSidebar}
              activeConversationId={currentSessionId}
              onSelectConversation={(id) => {
                handleSelectConversation(id)
                closeConversationsSidebar()
              }}
              onNewConversation={() => {
                handleNewConversation()
                closeConversationsSidebar()
              }}
            />
          )}
        </AnimatePresence>

        {/* Center Column - Chat & Input */}
        <div className="relative flex flex-1 flex-col overflow-hidden bg-verde-50">
          <div className="flex-1 overflow-y-auto">
            {isLoadingSession ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verde-900 border-t-transparent"></div>
                  <p className="text-verde-700">Carregando conversa...</p>
                </div>
              </div>
            ) : hasMessages ? (
              <ChatArea messages={messages} isStreaming={isStreaming} />
            ) : (
              <MainContent onSuggestionClick={handleSuggestionClick} />
            )}
            <div className="h-32 md:h-40" />
          </div>

          {/* Floating Input Bar */}
          <div className="z-10 w-full">
            <InputBar
              onSendMessage={handleSendMessage}
              message={message}
              setMessage={setMessage}
              disabled={isStreaming || isLoadingSession}
              userId={user?.id}
              sessionId={currentSessionId || undefined}
              onSessionCreated={(newSessionId) => {
                // Navigate to new session when created during file upload
                console.log('[GeminiLayout] Session created:', newSessionId)
                router.push(`/chat/${newSessionId}`)
              }}
              onFileUploaded={(documentId, uploadedSessionId) => {
                // Navigate to session if we're not already there
                console.log(
                  '[GeminiLayout] File uploaded:',
                  documentId,
                  'to session:',
                  uploadedSessionId
                )
                if (
                  uploadedSessionId &&
                  uploadedSessionId !== currentSessionId
                ) {
                  router.push(`/chat/${uploadedSessionId}`)
                }
              }}
            />
          </div>
        </div>

        {/* Right Sidebar - Files */}
        <FilesSidebar
          conversationId={currentSessionId || null}
          isOpen={isFilesOpen && !isMobile}
          onClose={closeFilesSidebar}
        />

        {/* Mobile Overlay for Files */}
        <AnimatePresence>
          {isMobile && isFilesOpen && (
            <FilesSidebar
              conversationId={currentSessionId || null}
              isOpen={true}
              overlay={true}
              onClose={closeFilesSidebar}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
