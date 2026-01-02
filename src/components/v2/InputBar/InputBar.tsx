'use client'

import { easings } from '@/lib/animations/easings'
import { motion } from 'framer-motion'
import {
  Paperclip,
  ArrowUp,
  X,
  FileText,
  Image as ImageIcon,
  Loader2
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
import { FileUploadModal } from '@/components/v2/FileUpload/FileUploadModal'
import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'
import { useChatInputRefSafe } from '@/contexts/ChatInputContext'
import { useCanvasStore } from '@/stores/useCanvasStore'
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
      ;(
        localTextareaRef as React.MutableRefObject<HTMLTextAreaElement | null>
      ).current = node
      // Update context ref if available
      if (contextRef) {
        ;(
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
        className={`relative w-full px-4 pb-8 pt-2 transition-colors md:px-6 ${
          isDragOver ? 'bg-verity-100/50' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, rotateX: -15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94] // Easing butter
          }}
          className="relative mx-auto max-w-3xl"
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Layer 6: Reflexo Inferior (Chão) */}
          <div
            className="absolute -bottom-10 left-0 right-0 h-10 rounded-[100%] bg-gradient-to-b from-verity-900/5 to-transparent blur-lg"
            style={{
              transform: 'translateZ(-40px) scaleY(0.3)',
              transformOrigin: 'top'
            }}
          />

          {/* Layer 5: Sombra Profunda */}
          <div
            className="absolute inset-0 rounded-2xl bg-verity-900/5 blur-2xl"
            style={{
              transform: 'translateZ(-30px) scale(0.95) translateY(20px)'
            }}
          />

          {/* Attachments Preview - Floating above */}
          {(attachments.length > 0 || externalAttachments.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap gap-2 px-1"
              style={{ transform: 'translateZ(10px)' }}
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
                  className="relative flex items-center gap-2 overflow-hidden rounded-lg border border-sand-200 bg-sand-50/90 py-1.5 pl-3 pr-8 text-xs text-verity-900 shadow-sm backdrop-blur-sm"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-sand-200 text-verity-600">
                    {(file.type || '').startsWith('image/') ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <FileText className="h-3 w-3" />
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
                        // Correct index for local attachments
                        // If it's local, we need to find its index in the 'attachments' array
                        // But since we are mapping a combined array, the index here is global
                        // This is tricky. Let's filter 'attachments' by reference?
                        // Or easier: use the mixed array for display but separate removal logic.
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const localIndex = attachments.indexOf(file as any)
                        if (localIndex !== -1) removeAttachment(localIndex)
                      }
                    }}
                    className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full p-1 text-verity-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Layer 4: Container Principal */}
          <motion.div
            className="group relative flex items-end gap-3 rounded-2xl border border-sand-300 bg-gradient-to-b from-sand-50 to-sand-100/50 px-5 py-4 backdrop-blur-xl"
            style={{
              transform: 'translateZ(0)',
              transformStyle: 'preserve-3d'
            }}
            initial={false}
            animate={isFocused ? 'focus' : 'rest'}
            variants={{
              rest: {
                scale: 1,
                rotateX: 0,
                boxShadow:
                  '0 1px 2px rgba(45, 90, 69, 0.06), 0 4px 12px rgba(45, 90, 69, 0.10), 0 16px 32px rgba(45, 90, 69, 0.14), inset 0 1px 1px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(45, 90, 69, 0.05)',
                borderColor: '#9DC4B0'
              },
              focus: {
                scale: 1.01,
                rotateX: -0.5,
                boxShadow:
                  '0 2px 4px rgba(45, 90, 69, 0.08), 0 8px 16px rgba(45, 90, 69, 0.12), 0 20px 40px rgba(45, 90, 69, 0.16), inset 0 1px 1px rgba(255, 255, 255, 0.6), 0 0 0 3px rgba(90, 149, 119, 0.15)',
                borderColor: '#2D5A45'
              }
            }}
            transition={{ duration: 0.3, ease: easings.butter }}
          >
            {/* Layer 2: Shimmer Effect */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                style={{ transform: 'translateZ(3px) skewX(-20deg)' }}
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 5,
                  ease: 'easeInOut'
                }}
              />
            </div>

            {/* Layer 3: Borda Iluminada Superior */}
            <div
              className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
              style={{ transform: 'translateZ(2px)' }}
            />

            {/* Autosuggestion Floating Menu */}
            <SuggestionList
              isVisible={!!suggestionMode && filteredItems.length > 0}
              items={filteredItems}
              selectedIndex={selectedIndex}
              onSelect={selectItem}
              position={suggestionPos}
              trigger={suggestionMode === 'slash' ? '/' : '@'}
            />

            {/* Text Area */}
            <textarea
              ref={textareaRef}
              id="chat-input"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => {
                setIsFocused(false)
                // Delayed close to allow click on suggestion list
                setTimeout(closeSuggestions, 200)
              }}
              placeholder={
                isLoading
                  ? 'Digite sua próxima mensagem...'
                  : disabled
                    ? 'Aguarde...'
                    : 'Descreva sua análise, use / para comandos ou @ para documentos...'
              }
              role="combobox"
              aria-label="Mensagem para o assistente Verity Agro"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded={!!suggestionMode}
              aria-controls="suggestion-list"
              aria-activedescendant={
                suggestionMode
                  ? `suggestion-option-${selectedIndex}`
                  : undefined
              }
              className="relative z-10 flex-1 resize-none bg-transparent py-2.5 font-sans text-base text-verity-950 placeholder:text-verity-700 focus:outline-none"
              disabled={disabled} // Only disable if strictly disabled (e.g. session loading)
              rows={1}
              style={{ maxHeight: '200px' }}
            />

            {/* Action Buttons Zone */}
            <div
              className="relative z-10 flex flex-shrink-0 items-center gap-2 pb-1.5"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              <TooltipProvider delayDuration={300}>
                {/* Attach Button - Opens Modal */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.05, z: 10, rotateZ: 2 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Anexar documentos"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsUploadModalOpen(true)
                      }}
                      disabled={disabled}
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-verity-700 transition-colors hover:bg-verity-50 hover:text-verity-950 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Paperclip className="h-5 w-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent className="border-verity-900 bg-verity-950 text-white">
                    <p>Anexar documentos</p>
                  </TooltipContent>
                </Tooltip>

                {/* Send Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSend()
                      }}
                      aria-label="Enviar mensagem"
                      disabled={
                        (!input.trim() &&
                          attachments.length === 0 &&
                          externalAttachments.length === 0) ||
                        isLoading ||
                        disabled
                      }
                      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                        (!input.trim() &&
                          attachments.length === 0 &&
                          externalAttachments.length === 0) ||
                        isLoading ||
                        disabled
                          ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-70'
                          : 'bg-gradient-to-br from-verity-900 to-verity-800 text-white shadow-lg shadow-verity-900/20'
                      }`}
                      whileHover={
                        (!input.trim() &&
                          attachments.length === 0 &&
                          externalAttachments.length === 0) ||
                        isLoading ||
                        disabled
                          ? {}
                          : { scale: 1.1, z: 6, y: -2 }
                      }
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Inner 3D Highlight for Button */}
                      <div
                        className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/10"
                        style={{ transform: 'translateZ(1px)' }}
                      />

                      {isLoading ? (
                        <Loader2 className="relative z-10 h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowUp className="relative z-10 h-5 w-5" />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent className="border-verity-900 bg-verity-950 text-white">
                    <p>Enviar mensagem</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-center"
          >
            <p className="text-xs font-medium text-verity-800">
              Verity Agro pode cometer erros. Verifique informações importantes.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
