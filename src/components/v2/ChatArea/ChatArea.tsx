'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Check, ArrowDown } from 'lucide-react'
import { PlaygroundChatMessage } from '@/types/playground'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer/MarkdownRenderer'
import { StreamingText } from './StreamingText'
import { usePlaygroundStore } from '@/store'
import { toast } from 'sonner'

interface ChatAreaProps {
  messages: PlaygroundChatMessage[]
  isStreaming: boolean
}

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      toast.success('Copiado para a área de transferência')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Erro ao copiar texto')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs opacity-0 transition-all hover:bg-background/50 group-hover:opacity-100"
      aria-label="Copiar mensagem"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-500">Copiado</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copiar</span>
        </>
      )}
    </button>
  )
}

export function ChatArea({ messages, isStreaming }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isStreamingFromStore = usePlaygroundStore((state) => state.isStreaming)
  const [showScrollButton, setShowScrollButton] = useState(false)

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Detectar se o usuário rolou para cima
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200
      setShowScrollButton(!isNearBottom)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  if (messages.length === 0) {
    return null
  }

  return (
    <div ref={containerRef} className="relative flex-1 overflow-y-auto px-4 py-6 md:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {messages.map((message, index) => (
          <div
            key={`${message.created_at}-${index}`}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`group relative max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-gemini-blue text-white'
                  : 'bg-muted text-foreground'
              }`}
            >
              {/* Avatar/Indicador do papel */}
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
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
                {message.created_at && (
                  <time className="text-xs opacity-50" dateTime={new Date(message.created_at * 1000).toISOString()}>
                    {new Date(message.created_at * 1000).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                )}
              </div>

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
              {message.role === 'agent' && message.content && (
                <div className="mt-2 flex justify-end">
                  <CopyButton content={message.content} />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-10 flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-gemini-blue text-white shadow-lg transition-all hover:bg-gemini-blue-hover hover:shadow-xl active:scale-95 md:bottom-28 md:right-8"
          aria-label="Rolar para baixo"
        >
          <ArrowDown className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
