'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './Header/Header'
import { MainContent } from './MainContent/MainContent'
import { InputBar } from './InputBar/InputBar'
import { ChatArea } from './ChatArea/ChatArea'
import { usePlaygroundStore } from '@/store'
import useChatActions from '@/hooks/useChatActions'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'

// Flag global para garantir que initializePlayground só execute UMA vez
let playgroundInitializationStarted = false

interface GeminiLayoutProps {
  sessionId?: string
}

export function GeminiLayout({ sessionId }: GeminiLayoutProps) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [hasMessages, setHasMessages] = useState(false)
  const [isLoadingSession, setIsLoadingSession] = useState(false)
  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const agentId = usePlaygroundStore((state) => state.agentId)
  const currentSessionId = usePlaygroundStore((state) => state.sessionId)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playgroundInitialized = usePlaygroundStore((state) => state.playgroundInitialized)
  const setPlaygroundInitialized = usePlaygroundStore((state) => state.setPlaygroundInitialized)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const playgroundInitializing = usePlaygroundStore((state) => state.playgroundInitializing)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setPlaygroundInitializing = usePlaygroundStore((state) => state.setPlaygroundInitializing)
  const locallyCreatedSessionIds = usePlaygroundStore((state) => state.locallyCreatedSessionIds)
  const addLocallyCreatedSessionId = usePlaygroundStore((state) => state.addLocallyCreatedSessionId)

  const { initializePlayground, loadSessionById } = useChatActions()
  const { handleStreamResponse } = useAIChatStreamHandler()

  // Inicializar playground APENAS UMA VEZ (usando flag global)
  useEffect(() => {
    if (!playgroundInitializationStarted) {
      playgroundInitializationStarted = true
      initializePlayground().finally(() => {
        setPlaygroundInitialized(true)
      })
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
  }, [sessionId, currentSessionId, loadSessionById, router, locallyCreatedSessionIds])

  // Verificar se há mensagens para alternar entre MainContent e ChatArea
  useEffect(() => {
    setHasMessages(messages.length > 0)
  }, [messages])

  const handleSendMessage = async (msg: string, files?: File[], toolId?: string) => {
    if (!msg.trim() || isStreaming) return

    // IMPORTANTE: Ler sessionId diretamente do store no momento do envio
    // para pegar o valor mais atualizado (pode ter sido setado pelo RunStarted)
    const { sessionId: currentSessionIdFromStore } = usePlaygroundStore.getState()

    // Se não há sessionId, criar um novo UUID no frontend antes de enviar
    let sessionIdToUse = currentSessionIdFromStore
    if (!currentSessionIdFromStore) {
      const newSessionId = crypto.randomUUID()
      const { setSessionId } = usePlaygroundStore.getState()
      setSessionId(newSessionId)
      // Marcar como criado localmente para NÃO tentar carregar do backend
      addLocallyCreatedSessionId(newSessionId)
      // Navegar imediatamente para a URL com o novo sessionId
      router.push(`/chat/${newSessionId}`)
      sessionIdToUse = newSessionId
    }

    await handleStreamResponse(msg, files, sessionIdToUse, toolId)
    setMessage('')
  }

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion)
    handleSendMessage(suggestion)
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background pb-20 md:pb-24">
      {/* Header - 8-10% da altura da tela */}
      <Header />

      {/* Main Content ou Chat Area - Flexível */}
      {isLoadingSession ? (
        // Loading state - aguardando carregamento da sessão
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Carregando conversa...</p>
          </div>
        </div>
      ) : hasMessages ? (
        <ChatArea messages={messages} isStreaming={isStreaming} />
      ) : (
        <MainContent onSuggestionClick={handleSuggestionClick} />
      )}

      {/* Input Bar - 10-15% da altura da tela */}
      <InputBar
        onSendMessage={handleSendMessage}
        message={message}
        setMessage={setMessage}
        disabled={isStreaming || isLoadingSession}
      />
    </div>
  )
}
