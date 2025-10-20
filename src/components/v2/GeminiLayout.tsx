'use client'

import { useState, useEffect } from 'react'
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
  const [message, setMessage] = useState('')
  const [hasMessages, setHasMessages] = useState(false)
  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)

  const { initializePlayground, ensureSessionExists, loadSessionById } = useChatActions()
  const { handleStreamResponse } = useAIChatStreamHandler()

  // Inicializar playground na montagem
  useEffect(() => {
    initializePlayground()
  }, [initializePlayground])

  // Carregar sessão se sessionId for fornecido
  useEffect(() => {
    if (sessionId) {
      loadSessionById(sessionId)
    }
  }, [sessionId, loadSessionById])

  // Verificar se há mensagens para alternar entre MainContent e ChatArea
  useEffect(() => {
    setHasMessages(messages.length > 0)
  }, [messages])

  const handleSendMessage = async (msg: string) => {
    if (!msg.trim() || isStreaming) return

    ensureSessionExists()
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
      {hasMessages ? (
        <ChatArea messages={messages} isStreaming={isStreaming} />
      ) : (
        <MainContent onSuggestionClick={handleSuggestionClick} />
      )}

      {/* Input Bar - 10-15% da altura da tela */}
      <InputBar
        onSendMessage={handleSendMessage}
        message={message}
        setMessage={setMessage}
        disabled={isStreaming}
      />
    </div>
  )
}
