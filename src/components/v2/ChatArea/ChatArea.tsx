'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlaygroundChatMessage } from '@/types/playground'
import { RefreshIndicator } from './RefreshIndicator'
import { EmptyState } from './EmptyState'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { MESSAGE_ROLES } from '@/lib/constants'
// Cookies import removed
import { toast } from 'sonner'
import { usePlaygroundStore } from '@/store'
import { trackChatFeedback } from '@/lib/analytics'

interface ChatAreaProps {
  messages: PlaygroundChatMessage[]
  isStreaming: boolean
  /** Callback opcional para refresh (carregar mais mensagens) */
  onRefresh?: () => Promise<void> | void
}

export function ChatArea({ messages, isStreaming, onRefresh }: ChatAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const sessionId = usePlaygroundStore((state) => state.sessionId)

  // Auto-scroll para última mensagem
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        })
      }, 100)
    }
  }, [messages, isStreaming])

  // Scroll button visibility
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 200
    setShowScrollButton(isNotAtBottom)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  // Hook de pull-to-refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      // Placeholder
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }, [onRefresh])

  const { pullDistance, isRefreshing, pullProgress } = usePullToRefresh({
    containerRef,
    onRefresh: handleRefresh,
    threshold: 80,
    enabled: messages.length > 0
  })

  // Efeito para scroll listener
  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const handleFeedback = useCallback(
    async (messageId: string, type: 'up' | 'down') => {
      const feedbackType = type === 'up' ? 'like' : 'dislike'

      // Track feedback event
      trackChatFeedback(messageId, feedbackType, sessionId || 'unknown')

      try {
        await fetch(`/api/chat/${messageId}/feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ feedback: feedbackType })
        })
        toast.success('Obrigado pelo feedback!')
      } catch (error) {
        console.error('Error sending feedback:', error)
        toast.error('Erro ao enviar feedback')
      }
    },
    [sessionId]
  )

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-y-auto px-4 py-6 md:px-6 landscape:py-3"
    >
      <RefreshIndicator
        progress={pullProgress}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
      />

      <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-end">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-1 flex-col justify-center"
            >
              <EmptyState variant="uploads" />
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 pb-4 landscape:space-y-4"
              role="log"
              aria-label="Mensagens da conversa"
              aria-live="polite"
            >
              {messages.map((message, index) => (
                <MessageBubble
                  key={`${message.created_at}-${index}`}
                  message={message}
                  isStreaming={isStreaming}
                  isLast={index === messages.length - 1}
                  onFeedback={handleFeedback}
                />
              ))}

              {/* Typing Indicator for Loading State */}
              {isStreaming &&
                messages[messages.length - 1]?.role === MESSAGE_ROLES.USER && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <TypingIndicator />
                  </motion.div>
                )}

              <div ref={messagesEndRef} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToBottom}
            className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-verity-900 text-white shadow-lg shadow-verity-900/20 hover:bg-verity-800 md:bottom-28 md:right-8 landscape:bottom-20"
            aria-label="Rolar para baixo"
          >
            <ArrowDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
