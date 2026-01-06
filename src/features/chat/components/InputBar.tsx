/* eslint-disable react-hooks/immutability */
'use client'


import { motion } from 'framer-motion'
import {
  ArrowUp,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus,
  Mic
} from 'lucide-react'
import { useEffect, useRef, useState, ChangeEvent, useCallback } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip/tooltip'
import { formatFileSize } from '@/lib/utils/file-utils'
import { toast } from 'sonner'
import { FileUploadModal } from '@/features/chat'
import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useChatInputRefSafe } from '@/contexts/ChatInputContext'
import { useCanvasStore } from '@/features/canvas'
import {
  SLASH_COMMANDS,
  STATIC_MENTIONS,
  AgentCommand,
  AgentMention,
  CommandType
} from './CommandRegistry'
import { SuggestionList } from './SuggestionList'
import { getCaretCoordinates } from '@/lib/utils/caret-coords'

// Suggestion list positioning constants
const SUGGESTION_LIST_HEIGHT = 280
const SUGGESTION_VERTICAL_OFFSET = -SUGGESTION_LIST_HEIGHT

// Safe hook that doesn't throw error if outside AuthProvider
function useSafeAuth() {
  const context = useContext(AuthContext)
  return context // Returns undefined if outside provider instead of throwing
}

interface InputBarProps {
  onSendMessage: (message: string, attachments?: File[]) => void
  onFileSelect?: (file: File) => void
  onFileUploaded?: (
    documentId: string,
    sessionId: string,
    fileInfo: { name: string; size: number; type?: string }
  ) => void
  isLoading?: boolean
  disabled?: boolean
  // Props from ChatLayout (controlled state)
  message?: string
  setMessage?: (message: string) => void
  userId?: string
  sessionId?: string
  onSessionCreated?: (sessionId: string) => void
  // Staged attachments (already uploaded)
  externalAttachments?: Array<{
    name: string
    size: number
    type: string
    id: string
  }>
  onRemoveExternalAttachment?: (id: string) => void
}

/**
 * Premium 3D Input Bar for Verity Agro.
 * Implements complex layering, depth effects, and micro-interactions.
 */
export function InputBar({
  onSendMessage,
  onFileSelect,
  onFileUploaded,
  isLoading = false,
  disabled = false,
  message = '',
  setMessage,
  userId: propUserId,
  sessionId,
  onSessionCreated,
  externalAttachments = [],
  onRemoveExternalAttachment
}: InputBarProps) {
  const auth = useSafeAuth()
  const userId = propUserId || auth?.user?.id || 'anonymous'
  // Use controlled state if provided, otherwise local state (for standalone usage)
  const [localInput, setLocalInput] = useState('')
  const input = setMessage ? message : localInput
  const handleInputChange = (val: string) => {
    // Capture cursor position before state update to avoid race condition
    const cursorPos = localTextareaRef.current?.selectionStart ?? val.length
    if (setMessage) {
      setMessage(val)
    } else {
      setLocalInput(val)
    }
    checkForTrigger(val, cursorPos)
  }

  // --- Original State (Restored) ---
  const [isFocused, setIsFocused] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

  // Use context ref if available (for focusChatInput from other components)
  const contextRef = useChatInputRefSafe()
  const localTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Callback ref to sync both refs
  const textareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      // Update local ref
      ; (
        localTextareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
      ).current = node
      // Update context ref if available
      if (contextRef) {
        ; (
          contextRef as React.MutableRefObject<HTMLTextAreaElement | null>
        ).current = node
      }
    },
    [contextRef]
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (localTextareaRef.current) {
      localTextareaRef.current.style.height = 'auto'
      localTextareaRef.current.style.height = `${Math.min(
        localTextareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [input])

  // --- Agentic State ---
  const [suggestionMode, setSuggestionMode] = useState<CommandType | null>(null)
  const [suggestionQuery, setSuggestionQuery] = useState('')
  const [suggestionPos, setSuggestionPos] = useState<{
    top: number
    left: number
  } | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredItems =
    suggestionMode === 'slash'
      ? SLASH_COMMANDS.filter((c) =>
        c.trigger.toLowerCase().startsWith(suggestionQuery.toLowerCase())
      )
      : suggestionMode === 'mention'
        ? [
          ...STATIC_MENTIONS,
          // Dynamic file mentions from externalAttachments and attachments
          ...[...externalAttachments, ...attachments].map((file, idx) => ({
            id: `file-${idx}`,
            label: file.name,
            description: formatFileSize(file.size), // Using utility
            type: 'mention' as const,
            trigger: `@${file.name.replace(/\s+/g, '_')}` // Normalize trigger
          }))
        ].filter((m) =>
          m.trigger.toLowerCase().includes(suggestionQuery.toLowerCase())
        )
        : []

  const closeSuggestions = () => {
    setSuggestionMode(null)
    setSuggestionQuery('')
    setSelectedIndex(0)
  }

  const checkForTrigger = (text: string, cursorPos: number) => {
    const textarea = localTextareaRef.current
    if (!textarea) return

    const textBeforeCursor = text.slice(0, cursorPos)

    // 1. Check Slash Command (Start of line)
    const slashMatch = textBeforeCursor.match(/^\/(\w*)$/)
    if (slashMatch) {
      setSuggestionMode('slash')
      setSuggestionQuery(textBeforeCursor) // Includes '/' for filtering convenience
      const coords = getCaretCoordinates(textarea, cursorPos)
      setSuggestionPos({
        top: coords.top + SUGGESTION_VERTICAL_OFFSET,
        left: coords.left
      })
      setSelectedIndex(0)
      return
    }

    // 2. Check Mention (Anywhere)
    // Regex: Look for @ followed by word chars at end of string
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      setSuggestionMode('mention')
      setSuggestionQuery(mentionMatch[0]) // '@sometext'
      const coords = getCaretCoordinates(textarea, cursorPos)
      setSuggestionPos({
        top: coords.top + SUGGESTION_VERTICAL_OFFSET,
        left: coords.left
      })
      setSelectedIndex(0)
      return
    }

    closeSuggestions()
  }

  const handleCreateCanvas = () => {
    useCanvasStore
      .getState()
      .openCanvas(
        '# Modo Canvas Ativado\n\nEste é um espaço de trabalho persistente.\n',
        'Novo Documento'
      )
    handleInputChange('')
    closeSuggestions()
  }

  const selectItem = (item: AgentCommand | AgentMention) => {
    if (item.id === 'canvas') {
      handleCreateCanvas()
      return
    }

    // Replace text
    const textarea = localTextareaRef.current
    if (!textarea) return

    // Logic: Replace the 'trigger' part with the 'label' or specialized text
    // Slash: usually replaces the whole line or input? For now, replace trigger with empty if it's an action, or keep it?
    // Let's assume selecting a command clears input (action) or appends (tag).
    // For mentions: replace @part with @Label + space.

    let newText = input
    const cursor = textarea.selectionStart

    if (item.type === 'slash') {
      if (item.id === 'clean') {
        const confirmClear = window.confirm(
          'Tem certeza que deseja limpar o chat?'
        )
        if (confirmClear) {
          toast.info('Contexto limpo!')
          if (onSessionCreated) {
            // HACK: Start new session via redirect or callback
            window.location.href = '/chat'
          }
        }
        handleInputChange('')
      } else if (item.id === 'upload') {
        setIsUploadModalOpen(true)
        handleInputChange('')
      } else if (item.id === 'help' || item.id === 'commands') {
        // Alias for help
        toast.info(
          'Comandos: /canvas (Editor), /limpar (Novo), /upload (Arq), /juris (Pesquisa Legal)',
          { duration: 5000 }
        )
        handleInputChange('')
      } else if (item.id === 'juris') {
        // Prepend specific context trigger for jurisprudence
        handleInputChange('Pesquisar jurisprudência sobre: ')
        toast.info('Modo Jurisprudência: Digite sua dúvida legal.')
      } else {
        // Default action (like /config)
        handleInputChange('')
      }
    } else {
      // Mention
      const textBefore = input.slice(0, cursor)
      const lastAt = textBefore.lastIndexOf('@')
      if (lastAt !== -1) {
        const prefix = textBefore.slice(0, lastAt)
        const suffix = input.slice(cursor)
        newText = `${prefix}@${item.label} ${suffix}`
        handleInputChange(newText)
      }
    }

    closeSuggestions()
    setTimeout(() => textarea.focus(), 10)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestionMode && filteredItems.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => (i > 0 ? i - 1 : filteredItems.length - 1))
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => (i < filteredItems.length - 1 ? i + 1 : 0))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        selectItem(filteredItems[selectedIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        closeSuggestions()
        return
      }
    }

    // Original Enter logic
    if (isLoading) {
      if (e.key === 'Enter') {
        e.preventDefault()
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    // DEV: Open Canvas Trigger (Legacy check, kept for safety)
    if (input.trim() === '/canvas') {
      handleCreateCanvas()
      return
    }
    if (
      (!input.trim() &&
        attachments.length === 0 &&
        externalAttachments.length === 0) ||
      isLoading ||
      disabled
    )
      return

    onSendMessage(input, attachments) // Pass local attachments to parent
    // Note: externalAttachments are already known by parent

    handleInputChange('')
    setAttachments([]) // Clear local attachments
    if (localTextareaRef.current) {
      localTextareaRef.current.style.height = 'auto'
      // Restore focus immediately
      setTimeout(() => {
        localTextareaRef.current?.focus()
      }, 0)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])

      if (onFileSelect) {
        newFiles.forEach((f) => onFileSelect(f))
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Drag and drop handlers...
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      setAttachments((prev) => [...prev, ...newFiles])
    }
  }

  // Handle upload complete from modal
  const handleUploadComplete = (
    documentId: string,
    uploadedSessionId?: string,
    fileInfo?: { name: string; size: number; type?: string }
  ) => {
    setIsUploadModalOpen(false)

    if (onFileUploaded && uploadedSessionId && fileInfo) {
      onFileUploaded(documentId, uploadedSessionId, fileInfo)
    }

    toast.success('Documento enviado e processado!')
  }

  // Handle session created from modal
  const handleSessionCreated = (newSessionId: string) => {
    if (onSessionCreated) {
      onSessionCreated(newSessionId)
    }
  }

  return (
    <>
      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
        onSessionCreated={handleSessionCreated}
        userId={userId}
        sessionId={sessionId}
        mode="upload"
      />

      <div
        className={`relative w-full px-4 pb-8 pt-2 transition-colors md:px-6 ${isDragOver ? 'bg-verity-100/50' : ''
          }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="relative mx-auto max-w-2xl">
          {/* Attachments Preview - Floating above */}
          {(attachments.length > 0 || externalAttachments.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap gap-2 px-1"
            >
              {[
                ...externalAttachments.map((f) => ({ ...f, isExternal: true })),
                ...attachments.map((f) => ({ ...f, isExternal: false }))
              ].map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-sand-200 bg-sand-50/90 py-1.5 pl-3 pr-8 text-xs text-verity-900 shadow-sm backdrop-blur-md"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sand-200 text-verity-600">
                    {(file.type || '').startsWith('image/') ? (
                      <ImageIcon className="h-3 w-3" strokeWidth={1.5} />
                    ) : (
                      <FileText className="h-3 w-3" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="z-10 flex flex-col">
                    <span className="max-w-[150px] truncate font-medium">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-verity-500">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (file.isExternal && onRemoveExternalAttachment) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onRemoveExternalAttachment((file as any).id)
                      } else {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const localIndex = attachments.indexOf(file as any)
                        if (localIndex !== -1) removeAttachment(localIndex)
                      }
                    }}
                    className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full p-1 text-verity-400 transition-colors hover:bg-error-50 hover:text-error-500"
                  >
                    <X className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ChatGPT-style Pill Container (Verity Brand: Sand & Organic) */}
          <motion.div
            className={`group relative flex min-h-[52px] w-full items-end gap-2 rounded-[26px] border px-4 py-3 transition-colors ${isFocused
              ? 'border-verity-300 bg-white shadow-md shadow-verity-900/5 ring-1 ring-verity-300/20'
              : 'border-sand-300 bg-sand-50 hover:border-sand-400'
              } dark:bg-verity-900 dark:border-verity-800`}
            initial={false}
            animate={{ scale: 1 }}
          >
            {/* Autosuggestion Floating Menu */}
            <SuggestionList
              isVisible={!!suggestionMode && filteredItems.length > 0}
              items={filteredItems}
              selectedIndex={selectedIndex}
              onSelect={selectItem}
              position={suggestionPos}
              trigger={suggestionMode === 'slash' ? '/' : '@'}
            />

            {/* Left Action: Attach (Plus) */}
            <div className="mb-0.5 flex flex-shrink-0 items-center justify-center">
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-verity-500 transition-colors hover:bg-sand-200 hover:text-verity-900 group-hover:text-verity-700"
                      aria-label="Adicionar anexo"
                    >
                      <Plus className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Adicionar anexo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Center: Text Input */}
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false)
                setTimeout(closeSuggestions, 200)
              }}
              placeholder={
                isLoading
                  ? 'Pensando...'
                  : disabled
                    ? 'Aguarde...'
                    : 'Pergunte alguma coisa'
              }
              rows={1}
              style={{ maxHeight: '200px' }}
              className="flex-1 resize-none bg-transparent py-1.5 text-base text-verity-950 placeholder:text-verity-400 focus:outline-none dark:text-sand-100 dark:placeholder:text-verity-600"
            />

            {/* Right Actions: Mic & Send */}
            <div className="mb-0.5 flex flex-shrink-0 items-center gap-2">
              {/* Mic Button (Visual/Mock) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="hidden h-8 w-8 items-center justify-center rounded-full text-verity-900 transition-colors hover:bg-sand-200 sm:flex dark:text-sand-300 dark:hover:bg-verity-800"
                      aria-label="Usar microfone"
                      onClick={() => toast.info('Entrada de voz em breve!')}
                    >
                      <Mic className="h-5 w-5" strokeWidth={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Entrada de voz</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Send Button */}
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSend()
                }}
                disabled={
                  (!input.trim() &&
                    attachments.length === 0 &&
                    externalAttachments.length === 0) ||
                  isLoading ||
                  disabled
                }
                whileTap={{ scale: 0.95 }}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${(!input.trim() &&
                  attachments.length === 0 &&
                  externalAttachments.length === 0) ||
                  isLoading ||
                  disabled
                  ? 'bg-sand-200 text-verity-300 cursor-not-allowed dark:bg-verity-800 dark:text-verity-600'
                  : 'bg-verity-800 text-white hover:bg-verity-900 shadow-sm dark:bg-verity-600 dark:hover:bg-verity-500'
                  }`}
                aria-label="Enviar"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" strokeWidth={2} />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Footer Text */}
          <div className="mt-2 text-center">
            <p className="text-[10px] text-verity-400 dark:text-verity-600">
              Verity Agro pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
