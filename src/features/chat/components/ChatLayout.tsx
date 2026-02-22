'use client'

// MVP: Feature flags
const CANVAS_ENABLED = false
const ENABLE_FILES_SIDEBAR = false

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { FilesSidebar } from './FilesSidebar'
import dynamic from 'next/dynamic'

const VerityThread = dynamic(
  () => import('./assistant-ui/VerityThread').then((mod) => mod.VerityThread),
  { ssr: false }
)
import { CanvasPanel } from '@/features/canvas'
import { ResizeHandle } from '@/features/canvas/components/ResizeHandle'
import { usePlaygroundStore } from '../stores/playgroundStore'
import { useLayoutStore } from '@/features/chat'
import { useCanvasStore } from '@/features/canvas'
import { useChatActions } from '../hooks/useChatActions'
import { useAIStreamHandler } from '../hooks/useAIStreamHandler'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

// shadcn sidebar
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Separator } from '@/components/ui/separator'
import { Hexagon } from 'lucide-react'

// Flag global para garantir que initializePlayground só execute UMA vez
let playgroundInitializationStarted = false

const isDebug = process.env.NODE_ENV === 'development'

interface ChatLayoutProps {
  sessionId?: string
}

export function ChatLayout({ sessionId }: ChatLayoutProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoadingSession, setIsLoadingSession] = useState(false)

  // Layout store (mantém para files sidebar e canvas)
  const { filesSidebar, isMobile, closeFilesSidebar } = useLayoutStore()

  // Canvas Store
  const { isOpen: isCanvasOpen, width: canvasWidth } = useCanvasStore()

  const isFilesOpen = filesSidebar === 'open'

  const currentSessionId = usePlaygroundStore((state) => state.sessionId)
  const locallyCreatedSessionIds = usePlaygroundStore(
    (state) => state.locallyCreatedSessionIds
  )
  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)

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

  const handleSendMessage = useCallback(
    async (msg: string, files?: File[]) => {
      if (!msg.trim() || isStreaming) return

      const { sessionId: currentSessionIdFromStore } =
        usePlaygroundStore.getState()

      const sessionIdToUse = currentSessionIdFromStore || null

      await handleStreamResponse(msg, files || [], sessionIdToUse)
    },
    [isStreaming, handleStreamResponse]
  )

  const handleNewConversation = () => {
    clearChat()
    if (isDebug) {
      console.debug('[chat] new conversation, navigating to /chat', {
        from: typeof window !== 'undefined' ? window.location.pathname : 'ssr'
      })
    }
    router.push('/chat')
  }

  const handleSelectConversation = (id: string) => {
    if (isDebug) {
      console.debug('[chat] select conversation', {
        from: typeof window !== 'undefined' ? window.location.pathname : 'ssr',
        to: `/chat/${id}`
      })
    }
    router.push(`/chat/${id}`)
  }

  return (
    <SidebarProvider>
      <AppSidebar
        activeConversationId={currentSessionId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />
      <SidebarInset>
        {/* Header simplificado */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-sand-300 bg-sand-200/95 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="font-display text-lg font-semibold tracking-tight text-verity-950">
            Verity Agro
          </span>
        </header>

        {/* Main content area */}
        <div className="relative flex flex-1 overflow-hidden">
          <div
            className={cn(
              'relative flex h-full w-full flex-col transition-all duration-300 ease-in-out',
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
            {isLoadingSession ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-verity-900 border-t-transparent"></div>
                  <p className="text-verity-700">Carregando conversa...</p>
                </div>
              </div>
            ) : (
              <VerityThread onSendMessage={handleSendMessage} />
            )}
          </div>

          {/* Canvas Panel */}
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

          {/* Files Sidebar */}
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
      </SidebarInset>
    </SidebarProvider>
  )
}
