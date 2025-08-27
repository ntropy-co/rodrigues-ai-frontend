'use client'

import { useEffect, useRef } from 'react'
import { PlaygroundChatMessage } from '@/types/playground'

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
                {message.content || (isStreaming && index === messages.length - 1 ? (
                  <div className="flex items-center gap-1">
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-current rounded-full animate-pulse"></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="h-2 w-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs opacity-60 ml-2">Pensando...</span>
                  </div>
                ) : (
                  'Processando...'
                ))}
              </div>

              {/* Tool calls se existirem */}
              {message.tool_calls && message.tool_calls.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.tool_calls.map((toolCall, toolIndex) => (
                    <div
                      key={`${toolCall.tool_call_id || toolIndex}`}
                      className="rounded-lg bg-background/50 p-2 text-xs"
                    >
                      <div className="font-medium opacity-80">
                        🔧 {toolCall.tool_name}
                      </div>
                      {toolCall.args && (
                        <div className="mt-1 opacity-60">
                          {JSON.stringify(toolCall.args, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

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