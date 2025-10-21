'use client'

import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { PlaygroundChatMessage } from '@/types/playground'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer/MarkdownRenderer'
import { StreamingText } from './StreamingText'
import { usePlaygroundStore } from '@/store'
import { CopyButton } from '@/components/ui/CopyButton'
import { useScrollDetection } from '@/hooks/useScrollDetection'
import { formatTimestamp, formatTimestampISO } from '@/lib/utils/format'
import { MESSAGE_ROLES, MIN_TOUCH_TARGET_SIZE } from '@/lib/constants'

interface ChatAreaProps {
  messages: PlaygroundChatMessage[]
  isStreaming: boolean
}

export function ChatArea({ messages, isStreaming }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isStreamingFromStore = usePlaygroundStore((state) => state.isStreaming)

  // Hook personalizado para detectar scroll
  const { showScrollButton, scrollToBottom } = useScrollDetection({
    containerRef
  })

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto px-4 py-6 md:px-6"
    >
      <div className="mx-auto max-w-4xl space-y-6">
        {messages.map((message, index) => {
          const isUser = message.role === MESSAGE_ROLES.USER
          const isAgent = message.role === MESSAGE_ROLES.AGENT

          return (
            <div
              key={`${message.created_at}-${index}`}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                  isUser
                    ? 'bg-gemini-blue text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                {/* Timestamp */}
                {message.created_at && (
                  <div className="mb-2 flex justify-end">
                    <time
                      className="text-xs opacity-50"
                      dateTime={formatTimestampISO(message.created_at)}
                    >
                      {formatTimestamp(message.created_at)}
                    </time>
                  </div>
                )}

                {/* Conteúdo da mensagem */}
                <div className="text-sm leading-relaxed">
                  {message.content ? (
                    isAgent ? (
                      // Se estiver streaming e for a última mensagem, usar StreamingText
                      isStreamingFromStore && index === messages.length - 1 ? (
                        <StreamingText
                          text={message.content}
                          speed={80}
                          renderMarkdown={true}
                          className=""
                        />
                      ) : (
                        <MarkdownRenderer classname="prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 max-w-none w-full">
                          {message.content}
                        </MarkdownRenderer>
                      )
                    ) : (
                      <div>{message.content}</div>
                    )
                  ) : isStreaming && index === messages.length - 1 ? (
                    <div className="flex items-center justify-start">
                      <div className="relative">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-r-gemini-purple border-t-gemini-blue"></div>
                        <div
                          className="absolute left-1 top-1 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-r-gemini-blue border-t-gemini-purple"
                          style={{
                            animationDirection: 'reverse',
                            animationDuration: '1s'
                          }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    'Processando...'
                  )}
                </div>

                {/* Error state */}
                {message.streamingError && (
                  <div className="mt-2 text-xs text-red-400">
                    ⚠️ Erro no streaming da resposta
                  </div>
                )}

                {/* Copy button - apenas para mensagens da AI com conteúdo */}
                {isAgent && message.content && (
                  <div className="mt-2 flex justify-end">
                    <CopyButton content={message.content} formatted={true} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gemini-blue text-white shadow-lg transition-all hover-hover:bg-gemini-blue-hover hover-hover:shadow-xl active:scale-95 md:bottom-28 md:right-8"
          style={{
            minHeight: `${MIN_TOUCH_TARGET_SIZE}px`,
            minWidth: `${MIN_TOUCH_TARGET_SIZE}px`
          }}
          aria-label="Rolar para baixo"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
