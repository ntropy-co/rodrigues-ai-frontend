'use client'

import { useEffect, useRef } from 'react'
import { PlaygroundChatMessage } from '@/types/playground'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer/MarkdownRenderer'

interface ChatAreaProps {
  messages: PlaygroundChatMessage[]
  isStreaming: boolean
}

export function ChatArea({ messages, isStreaming }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return null
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {messages.map((message, index) => (
          <div
            key={`${message.created_at}-${index}`}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gemini-blue text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {/* Avatar/Indicador do papel */}
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    message.role === 'user'
                      ? 'bg-white/20 text-white'
                      : 'bg-gemini-blue text-white'
                  }`}
                >
                  {message.role === 'user' ? 'U' : 'AI'}
                </div>
                <span className="text-xs opacity-70">
                  {message.role === 'user' ? 'Você' : 'Dr. Ubyfol'}
                </span>
              </div>

              {/* Conteúdo da mensagem */}
              <div className="text-sm leading-relaxed">
                {message.content ? (
                  message.role === 'agent' ? (
                    <MarkdownRenderer classname="prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 max-w-none w-full">
                      {message.content}
                    </MarkdownRenderer>
                  ) : (
                    <div>{message.content}</div>
                  )
                ) : (isStreaming && index === messages.length - 1 ? (
                  <div className="flex items-center justify-start">
                    <div className="relative">
                      <div className="w-6 h-6 border-2 border-transparent border-t-gemini-blue border-r-gemini-purple rounded-full animate-spin"></div>
                      <div className="absolute top-1 left-1 w-4 h-4 border-2 border-transparent border-t-gemini-purple border-r-gemini-blue rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                    </div>
                  </div>
                ) : (
                  'Processando...'
                ))}
              </div>

              {/* Error state */}
              {message.streamingError && (
                <div className="mt-2 text-xs text-red-400">
                  ⚠️ Erro no streaming da resposta
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}