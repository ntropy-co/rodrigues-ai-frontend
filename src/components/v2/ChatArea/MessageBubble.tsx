import { useState, useCallback, memo } from 'react'
import { motion } from 'framer-motion'
import {
  FileText,
  Image as ImageIcon,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { PlaygroundChatMessage } from '@/types/playground'
import { StreamingText } from './StreamingText'
import { MESSAGE_ROLES } from '@/lib/constants'
import { formatTimestamp } from '@/lib/utils/format'
import { usePlaygroundStore } from '@/store'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/lib/utils/file-utils'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { AgentStateIndicator } from './AgentStateIndicator'
import { SourceCitation } from './SourceCitation'

interface MessageBubbleProps {
  message: PlaygroundChatMessage
  isStreaming: boolean
  isLast: boolean
  onFeedback?: (id: string, type: 'up' | 'down') => void
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isStreaming,
  isLast,
  onFeedback
}: MessageBubbleProps) {
  const isUser = message.role === MESSAGE_ROLES.USER
  const isAgent = message.role === MESSAGE_ROLES.AGENT
  const isStreamingFromStore = usePlaygroundStore((state) => state.isStreaming)
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const handleCopy = useCallback(async () => {
    if (message.content) {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [message.content])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'mb-8 flex w-full', // Increased margin for 3D space
        isUser ? 'justify-end' : 'justify-start'
      )}
      style={{ perspective: '800px' }} // Perspective for 3D items
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          'relative flex flex-col',
          isUser
            ? 'ml-12 max-w-[85%] md:max-w-[75%]'
            : 'mr-12 max-w-[90%] md:max-w-[85%]',
          'group'
        )}
      >
        {/* Timestamp & Status (Above) */}
        <div
          className={cn(
            'mb-2 flex items-center gap-2 px-1 text-xs font-light text-verde-600',
            isUser ? 'justify-end' : 'justify-start'
          )}
        >
          {message.created_at && (
            <time>{formatTimestamp(message.created_at)}</time>
          )}
          {isUser && !message.streamingError && (
            <>{/* Status icons if needed */}</>
          )}
          {/* Icons removed to match cleaner look unless required */}
        </div>

        {/* Bubble Container */}
        <motion.div
          whileHover={{
            y: -4,
            rotateX: isUser ? 2 : 1,
            boxShadow: isUser
              ? '0 20px 40px rgba(45,90,69,0.25), 0 8px 16px rgba(45,90,69,0.15), inset 0 -2px 4px rgba(45,90,69,0.1)'
              : '0 12px 30px rgba(45,90,69,0.15), 0 4px 12px rgba(45,90,69,0.08)'
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'relative px-6 py-5',
            isUser
              ? 'rounded-[1.25rem_1.25rem_0.25rem_1.25rem] bg-gradient-to-br from-[#2D5A45] to-[#3A6B54] text-white shadow-[0_10px_25px_rgba(45,90,69,0.2),0_4px_10px_rgba(45,90,69,0.15),inset_0_-2px_4px_rgba(45,90,69,0.1),inset_0_1px_1px_rgba(255,255,255,0.25)]'
              : 'rounded-[1.25rem_1.25rem_1.25rem_0.25rem] border border-verde-100 bg-white text-verde-950 shadow-[0_8px_20px_rgba(45,90,69,0.08),0_2px_8px_rgba(45,90,69,0.04)]'
          )}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Tail */}
          <div
            className={cn(
              'absolute bottom-3 h-4 w-4 rotate-45 transform shadow-sm',
              isUser
                ? '-right-[6px] rounded-[0_0_0.25rem_0] bg-[#3A6B54]'
                : '-left-[6px] rounded-[0_0_0_0.25rem] border-b border-l border-verde-100 bg-white'
            )}
          />

          {/* Content */}
          <div
            className="relative z-10 text-base leading-relaxed"
            style={{ transform: 'translateZ(10px)' }}
          >
            {/* translateZ for floating content effect */}
            {message.content ? (
              isAgent ? (
                // Agent Content
                // Agent Content
                <div className="flex flex-col gap-2">
                  <div className="markdown-content">
                    {isStreamingFromStore && isLast ? (
                      <StreamingText
                        text={message.content}
                        speed={80}
                        renderMarkdown={true}
                        className=""
                      />
                    ) : (
                      <MarkdownRenderer classname="prose-verde">
                        {message.content}
                      </MarkdownRenderer>
                    )}
                  </div>
                  {!isStreamingFromStore && (
                    <SourceCitation
                      references={message.extra_data?.references}
                    />
                  )}
                </div>
              ) : (
                // User Content
                <div className="whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              )
            ) : isStreaming && isLast ? (
              // Agent State Indicator (Thinking/Analyzing/etc)
              <div className="min-w-[200px] py-1">
                <AgentStateIndicator />
              </div>
            ) : (
              <span className="italic opacity-50">Mensagem vazia</span>
            )}
          </div>

          {/* Attachments */}
          {message.files && message.files.length > 0 && (
            <div className="border-current/10 mt-4 space-y-2 border-t pt-3">
              {message.files.map((file, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-center gap-3 rounded-lg p-2.5 transition-colors',
                    isUser
                      ? 'border border-white/30 bg-white/20 hover:bg-white/30'
                      : 'border border-verde-200 bg-verde-50 hover:bg-verde-100'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-md',
                      isUser
                        ? 'bg-white/25 text-white'
                        : 'bg-white text-verde-600'
                    )}
                  >
                    {file.type?.startsWith('image/') ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span
                      className={cn(
                        'truncate text-sm font-medium',
                        isUser ? 'text-white' : 'text-verde-950'
                      )}
                    >
                      {file.name}
                    </span>
                    <span
                      className={cn(
                        'text-[10px]',
                        isUser ? 'text-white/90' : 'text-verde-700'
                      )}
                    >
                      {formatFileSize(file.size || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions Bar (Agent Only) */}
          {isAgent && !isStreamingFromStore && showActions && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute -bottom-10 left-0 flex items-center gap-1 rounded-xl border border-verde-200 bg-white/95 px-3 py-1.5 shadow-[0_4px_12px_rgba(45,90,69,0.1)] backdrop-blur-sm"
              style={{ transform: 'translateZ(20px)' }}
            >
              <button
                onClick={handleCopy}
                className="rounded-lg p-1.5 text-verde-700 transition-colors hover:bg-verde-50"
                aria-label="Copiar"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
              <div className="h-4 w-px bg-verde-200" />
              <button
                onClick={() => onFeedback?.(message.id || 'unknown', 'up')}
                className="rounded-lg p-1.5 text-verde-700 transition-colors hover:bg-verde-50"
                aria-label="Útil"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => onFeedback?.(message.id || 'unknown', 'down')}
                className="rounded-lg p-1.5 text-verde-700 transition-colors hover:bg-verde-50"
                aria-label="Não útil"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
})
