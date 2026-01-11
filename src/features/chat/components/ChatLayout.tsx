'use client'

// MVP: Feature flags
const CANVAS_ENABLED = false
const ENABLE_FILES_SIDEBAR = false

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatHeader } from './ChatHeader'
import { MainContent } from './MainContent'
import { InputBar } from './InputBar'
import { ChatArea } from './ChatArea'
import { FilesSidebar } from './FilesSidebar'
import { ConversationsSidebar } from './ConversationsSidebar'
import { CanvasPanel } from '@/features/canvas'
import { ResizeHandle } from '@/features/canvas/components/ResizeHandle'
import { usePlaygroundStore } from '../stores/playgroundStore'
import { useLayoutStore } from '@/features/chat'
import { useCanvasStore } from '@/features/canvas'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useChatActions } from '../hooks/useChatActions'
import { useAIStreamHandler } from '../hooks/useAIStreamHandler'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// Flag global para garantir que initializePlayground só execute UMA vez
let playgroundInitializationStarted = false

const isDebug = process.env.NODE_ENV === 'development'

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
  const { handleStreamResponse } = useAIStreamHandler()

  // Inicializar playground APENAS UMA VEZ
  useEffect(() => {
    if (!playgroundInitializationStarted) {
      playgroundInitializationStarted = true
      initializePlayground()
    }
  }, [initializePlayground])

  // Carregar sessão se sessionId for fornecido
  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        if (isDebug) {
          console.debug('[chat] loadSession skip: no route sessionId', {
            routeSessionId: sessionId,
            storeSessionId: currentSessionId
          })
        }
        setIsLoadingSession(false)
        return
      }

      if (locallyCreatedSessionIds.includes(sessionId)) {
        if (isDebug) {
          console.debug('[chat] loadSession skip: locally created', {
            routeSessionId: sessionId,
            storeSessionId: currentSessionId
          })
        }
        setIsLoadingSession(false)
        return
      }

      if (sessionId === currentSessionId) {
        if (isDebug) {
          console.debug('[chat] loadSession skip: already active', {
            routeSessionId: sessionId,
            storeSessionId: currentSessionId
          })
        }
        setIsLoadingSession(false)
        return
      }

      setIsLoadingSession(true)
      if (isDebug) {
        console.debug('[chat] loadSession start', {
          routeSessionId: sessionId,
          storeSessionId: currentSessionId
        })
      }
      const success = await loadSessionById(sessionId)
      setIsLoadingSession(false)

      if (!success) {
        if (isDebug) {
          console.debug('[chat] loadSession failed, redirecting to /chat', {
            routeSessionId: sessionId
          })
        }
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

    const allFiles = [
      ...stagedFiles.map((f) => ({ name: f.name, size: f.size })),
      ...(files || [])
    ]

    await handleStreamResponse(msg, allFiles, sessionIdToUse, toolId)
    setMessage('')
    setStagedFiles([])
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage(suggestion)
  }

  const handleNewConversation = () => {
    clearChat()
    setStagedFiles([])
    if (isDebug) {
      console.debug('[chat] new conversation, navigating to /chat', {
        from: typeof window !== 'undefined' ? window.location.pathname : 'ssr'
      })
    }
    router.push('/chat')
  }

  const handleSelectConversation = (id: string) => {
    setStagedFiles([])
    if (isDebug) {
      console.debug('[chat] select conversation', {
        from: typeof window !== 'undefined' ? window.location.pathname : 'ssr',
        to: `/chat/${id}`
      })
    }
    router.push(`/chat/${id}`)
  }

  // Helper to render the InputBar with common props
  const renderInputBar = () => (
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
        router.push(`/chat/${newSessionId}`)
      }}
      onFileUploaded={(documentId, uploadedSessionId, fileInfo) => {
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

        if (uploadedSessionId && uploadedSessionId !== currentSessionId) {
          router.push(`/chat/${uploadedSessionId}`)
        }
      }}
    />
  )

  return (
    <div className="flex h-screen w-screen flex-col bg-sand-100 dark:bg-background">
      <ChatHeader />

      <div className="relative flex flex-1 overflow-hidden">
        <ConversationsSidebar
          isOpen={isConversationsOpen && !isMobile}
          onToggle={closeConversationsSidebar}
          activeConversationId={currentSessionId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
        />

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

        <div
          className={cn(
            'relative flex h-full flex-col bg-sand-200 transition-all duration-300 ease-in-out',
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
          {/* Scrollable Content Area */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {isLoadingSession ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verity-900 border-t-transparent"></div>
                  <p className="text-verity-700">Carregando conversa...</p>
                </div>
              </div>
            ) : hasMessages ? (
              <>
                <ChatArea messages={messages} isStreaming={isStreaming} />
                {/* Spacer to allow scrolling above InputBar */}
                <div className="h-40" />
              </>
            ) : (
              <MainContent
                onSuggestionClick={handleSuggestionClick}
                inputBar={renderInputBar()}
              />
            )}
          </div>

          {/* Sticky Bottom Input Bar - Always visible at bottom when has messages */}
          {hasMessages && (
            <div
              className="sticky bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-sand-200 via-sand-200/80 to-transparent pb-6 pt-10"
              style={{
                position: 'fixed',
                bottom: 0,
                left: isConversationsOpen && !isMobile ? '256px' : '0',
                right:
                  isCanvasOpen && !isMobile
                    ? `${canvasWidth}%`
                    : isFilesOpen && !isMobile
                      ? '320px'
                      : '0'
              }}
            >
              {renderInputBar()}
            </div>
          )}
        </div>

        {/* Canvas Panel - Always render when open (takes priority over FilesSidebar) */}
        {CANVAS_ENABLED && isCanvasOpen && !isMobile && (
          <ResizeHandle
            onResize={(delta) => {
              const newWidth = Math.min(
                80,
                Math.max(20, canvasWidth + (delta / window.innerWidth) * 100)
              )
              useCanvasStore.getState().setWidth(newWidth)
            }}
          />
        )}

        {CANVAS_ENABLED && isCanvasOpen && (
          <div
            className={cn(
              'relative z-20 h-full bg-sand-100 shadow-xl transition-all duration-500 ease-out',
              isMobile ? 'absolute inset-0 w-full' : ''
            )}
            style={{
              width: isMobile ? '100%' : `${canvasWidth}%`
            }}
          >
            <CanvasPanel />
          </div>
        )}

        {ENABLE_FILES_SIDEBAR && (
          <>
            <FilesSidebar
              conversationId={currentSessionId || null}
              isOpen={isFilesOpen && !isMobile}
              onClose={closeFilesSidebar}
            />

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
          </>
        )}
      </div>
    </div>
  )
}
