'use client'

import { useEffect, useRef, useState } from 'react'
import { PlaygroundChatMessage } from '@/types/playground'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer/MarkdownRenderer'
import { StreamingText } from './StreamingText'
import { TypingIndicator } from './TypingIndicator'
import { usePlaygroundStore } from '@/store'
import { Copy, Check, RotateCcw, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'

interface ChatAreaProps {
  messages: PlaygroundChatMessage[]
  isStreaming: boolean
}

export function ChatArea({ messages, isStreaming }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isStreamingFromStore = usePlaygroundStore((state) => state.isStreaming)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isUserScrolling, setIsUserScrolling] = useState(false)

  // Check if user has scrolled away from bottom
  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100

    setShowScrollButton(!isAtBottom)
    if (!isAtBottom) {
      setIsUserScrolling(true)
    } else {
      setIsUserScrolling(false)
    }
  }

  // Auto-scroll para a última mensagem (only if user hasn't scrolled up)
  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isUserScrolling])

  // Scroll to bottom function
  const scrollToBottom = () => {
    setIsUserScrolling(false)
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Format relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const messageTime = new Date(timestamp)
    const diffMs = now.getTime() - messageTime.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'agora'
    if (diffMins < 60) return `${diffMins} min atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`

    return messageTime.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    })
  }

  // Format full timestamp for hover
  const getFullTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Copy message content
  const handleCopyMessage = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedIndex(index)
      toast.success('Mensagem copiada!')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast.error('Erro ao copiar mensagem')
    }
  }

  // Check if message is grouped with previous message
  const isGroupedWithPrevious = (index: number) => {
    if (index === 0) return false
    const currentMessage = messages[index]
    const previousMessage = messages[index - 1]
    return currentMessage.role === previousMessage.role
  }

  if (messages.length === 0) {
    return null
  }

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="relative flex-1 overflow-y-auto px-2 py-4 sm:px-4 sm:py-6 md:px-6"
    >
      <div className="mx-auto max-w-4xl">
        {messages.map((message, index) => {
          const isGrouped = isGroupedWithPrevious(index)
          return (
          <div
            key={`${message.created_at}-${index}`}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            } ${isGrouped ? 'mt-1' : 'mt-4 sm:mt-6'}`}
          >
            <div
              className={`group relative max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                message.role === 'user'
                  ? 'bg-gemini-blue text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {/* Avatar/Indicador do papel - only show if not grouped */}
              {!isGrouped && (
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
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
                      {message.role === 'user' ? 'Você' : 'Rodrigues AI'}
                    </span>
                  </div>

                  {/* Timestamp */}
                  {message.created_at && (
                    <span
                      className="text-xs opacity-50"
                      title={getFullTimestamp(message.created_at)}
                    >
                      {getRelativeTime(message.created_at)}
                    </span>
                  )}
                </div>
              )}

              {/* Conteúdo da mensagem */}
              <div className="text-sm leading-relaxed">
                {message.content ? (
                  message.role === 'agent' ? (
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
                ) : (isStreaming && index === messages.length - 1 ? (
                  <TypingIndicator />
                ) : (
                  <TypingIndicator />
                ))}
              </div>

              {/* Error state */}
              {message.streamingError && (
                <div className="mt-2 text-xs text-red-400">
                  ⚠️ Erro no streaming da resposta
                </div>
              )}

              {/* Message Actions - Only show when message has content and not streaming */}
              {message.content && !(isStreamingFromStore && index === messages.length - 1) && (
                <div className="mt-2 flex items-center gap-1 opacity-70 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Copy button */}
                  <button
                    onClick={() => handleCopyMessage(message.content, index)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      message.role === 'user'
                        ? 'hover:bg-white/10 text-white/70 hover:text-white'
                        : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                    }`}
                    title="Copiar mensagem"
                    aria-label="Copiar mensagem"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* Regenerate button - only for AI messages */}
                  {message.role === 'agent' && index === messages.length - 1 && (
                    <button
                      onClick={() => {
                        // TODO: Implement regenerate functionality
                        toast.info('Funcionalidade em desenvolvimento')
                      }}
                      className="p-1.5 rounded-lg transition-colors hover:bg-background/50 text-muted-foreground hover:text-foreground"
                      title="Gerar nova resposta"
                      aria-label="Gerar nova resposta"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
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
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-8 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-gemini-blue to-gemini-purple text-white shadow-lg transition-all hover:shadow-xl hover:scale-110 active:scale-95"
          aria-label="Rolar para baixo"
          title="Ir para o final"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}