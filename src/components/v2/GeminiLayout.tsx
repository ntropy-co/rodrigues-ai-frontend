'use client'

import { useState, useEffect, useRef } from 'react'
import { Header } from './Header/Header'
import { MainContent } from './MainContent/MainContent'
import { InputBar } from './InputBar/InputBar'
import { ChatArea } from './ChatArea/ChatArea'
import { usePlaygroundStore } from '@/store'
import useChatActions from '@/hooks/useChatActions'
import useAIChatStreamHandler from '@/hooks/useAIStreamHandler'

export function GeminiLayout() {
  const [message, setMessage] = useState('')
  const [hasMessages, setHasMessages] = useState(false)
  const messages = usePlaygroundStore((state) => state.messages)
  const isStreaming = usePlaygroundStore((state) => state.isStreaming)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const { initializePlayground, ensureSessionExists } = useChatActions()
  const { handleStreamResponse } = useAIChatStreamHandler()

  // Inicializar playground na montagem
  useEffect(() => {
    initializePlayground()
  }, [initializePlayground])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }

      // Escape to blur input
      if (e.key === 'Escape') {
        inputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
        <MainContent 
          onSuggestionClick={handleSuggestionClick}
        />
      )}
      
      {/* Input Bar - 10-15% da altura da tela */}
      <InputBar
        onSendMessage={handleSendMessage}
        message={message}
        setMessage={setMessage}
        disabled={isStreaming}
        inputRef={inputRef}
      />
    </div>
  )
}