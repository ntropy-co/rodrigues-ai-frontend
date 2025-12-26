'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatHeader } from './Header/ChatHeader'
import { MainContent } from './MainContent/MainContent'
import { InputBar } from './InputBar/InputBar'
import { ChatArea } from './ChatArea/ChatArea'
import { FilesSidebar } from './FilesSidebar'
import { ConversationsSidebar } from './ConversationsSidebar'
import { CanvasPanel } from './Canvas/CanvasPanel'
import { usePlaygroundStore } from '@/store'
import { useLayoutStore } from '@/stores/layoutStore'
import { useCanvasStore } from '@/stores/useCanvasStore'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import useChatActions from '@/hooks/useChatActions'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// Flag global para garantir que initializePlayground só execute UMA vez
let playgroundInitializationStarted = false

interface ChatLayoutProps {
  sessionId?: string
}

export function ChatLayout({ sessionId }: ChatLayoutProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [hasMessages, setHasMessages] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const [stagedFiles, setStagedFiles] = useState<
    Array<{ name: string; size: number; type: string; id: string }>
  >([])

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

  // Canvas Store
  const { isOpen: isCanvasOpen, width: canvasWidth } = useCanvasStore()

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
    if ((!msg.trim() && stagedFiles.length === 0) || isStreaming) return

    const { sessionId: currentSessionIdFromStore } =
      usePlaygroundStore.getState()

    const sessionIdToUse = currentSessionIdFromStore || null

    // Combine local files (if any) with staged files
    const allFiles = [
      ...stagedFiles.map((f) => ({ name: f.name, size: f.size })),
      ...(files || [])
    ]

    await handleStreamResponse(msg, allFiles, sessionIdToUse, toolId)
    setMessage('')
    setStagedFiles([]) // Clear staged files after sending
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage(suggestion)
  }

  const handleNewConversation = () => {
    clearChat()
    setStagedFiles([])
    router.push('/chat')
  }

  const handleSelectConversation = (id: string) => {
    setStagedFiles([])
    router.push(`/chat/${id}`)
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-verity-50 dark:bg-background">
      {/* Header */}
      <ChatHeader />

      {/* Main Container - 3-Column Layout */}
      <div className="relative flex flex-1 overflow-hidden">
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
        <motion.div
          layout
          className={cn(
            'relative flex flex-col overflow-hidden bg-verity-50 transition-all duration-300 ease-in-out',
            isCanvasOpen && !isMobile ? 'border-r border-verity-200' : ''
          )}
          style={{
            flex:
              isCanvasOpen && !isMobile
                ? `0 0 ${100 - canvasWidth}%`
                : '1 1 0%',
            maxWidth:
              isCanvasOpen && !isMobile ? `${100 - canvasWidth}%` : '100%'
          }}
        >
          <div className="flex-1 overflow-y-auto">
            {isLoadingSession ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verity-900 border-t-transparent"></div>
                  <p className="text-verity-700">Carregando conversa...</p>
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
              isLoading={isStreaming}
              disabled={isLoadingSession}
              userId={user?.id}
              sessionId={currentSessionId || undefined}
              externalAttachments={stagedFiles}
              onRemoveExternalAttachment={(id) => {
                setStagedFiles((prev) => prev.filter((f) => f.id !== id))
              }}
              onSessionCreated={(newSessionId) => {
                console.log('[ChatLayout] Session created:', newSessionId)
                router.push(`/chat/${newSessionId}`)
              }}
              onFileUploaded={(documentId, uploadedSessionId, fileInfo) => {
                console.log(
                  '[ChatLayout] File uploaded:',
                  documentId,
                  'to session:',
                  uploadedSessionId,
                  'file:',
                  fileInfo
                )

                if (fileInfo) {
                  setStagedFiles((prev) => [
                    ...prev,
                    {
                      id: documentId,
                      name: fileInfo.name,
                      size: fileInfo.size,
                      type: fileInfo.type || ''
                    }
                  ])
                }

                if (
                  uploadedSessionId &&
                  uploadedSessionId !== currentSessionId
                ) {
                  router.push(`/chat/${uploadedSessionId}`)
                }
              }}
            />
          </div>
        </motion.div>

        {/* Right Sidebar - Canvas (Split View) */}
        {!isFilesOpen && (
          <div
            className={cn(
              'relative z-20 h-full bg-white shadow-xl transition-all duration-300 ease-in-out',
              isMobile && isCanvasOpen ? 'absolute inset-0 w-full' : ''
            )}
            style={{
              width:
                isCanvasOpen && !isMobile
                  ? `${canvasWidth}%`
                  : isMobile && isCanvasOpen
                    ? '100%'
                    : '0px',
              display: !isCanvasOpen ? 'none' : 'block'
            }}
          >
            <CanvasPanel />
          </div>
        )}

        {/* Right Sidebar - Files (Old) */}
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
