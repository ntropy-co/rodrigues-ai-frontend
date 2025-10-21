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
  const agentId = usePlaygroundStore((state) => state.agentId)
  const currentSessionId = usePlaygroundStore((state) => state.sessionId)

  const { initializePlayground, loadSessionById } = useChatActions()
  const { handleStreamResponse } = useAIChatStreamHandler()

  // Inicializar playground na montagem
  useEffect(() => {
    initializePlayground()
  }, [initializePlayground])

  // Carregar sessão se sessionId for fornecido E agentId estiver disponível
  useEffect(() => {
    const loadSession = async () => {
      // Se não há sessionId na URL, resetar loading
      if (!sessionId) {
        setIsLoadingSession(false)
        return
      }

      // Se o sessionId da URL é igual ao do store E há mensagens, não precisa carregar
      if (sessionId === currentSessionId && messages.length > 0) {
        setIsLoadingSession(false)
        return
      }

      // Se agentId ainda não está disponível, aguardar
      if (!agentId || agentId === 'no-agents') {
        setIsLoadingSession(true)
        return
      }

      // Carregar sessão do backend
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
    agentId,
    messages.length,
    loadSessionById,
    router
  ])

  // Verificar se há mensagens para alternar entre MainContent e ChatArea
  useEffect(() => {
    setHasMessages(messages.length > 0)
  }, [messages])

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim() || isStreaming) return

    // Se não há sessionId, criar um novo UUID no frontend antes de enviar
    if (!currentSessionId) {
      const newSessionId = crypto.randomUUID()
      const { setSessionId } = usePlaygroundStore.getState()
      setSessionId(newSessionId)
      // Navegar imediatamente para a URL com o novo sessionId
      router.push(`/chat/${newSessionId}`)
    }

    await handleStreamResponse(msg)
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
