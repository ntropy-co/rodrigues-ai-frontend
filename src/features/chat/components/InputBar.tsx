'use client'

// MVP: Feature flags
const CANVAS_ENABLED = false
const ENABLE_IMAGE_CREATION = false
const ENABLE_AGENT_MODE = false
const ENABLE_SLASH_COMMANDS = false
const ENABLE_MENTION_COMMANDS = false

import { easings } from '@/lib/animations/easings'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Paperclip,
  ArrowUp,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Plus
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
    if (ENABLE_SLASH_COMMANDS) {
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
    }

    // 2. Check Mention (Anywhere)
    // Regex: Look for @ followed by word chars at end of string
    if (ENABLE_MENTION_COMMANDS) {
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
    }

    closeSuggestions()
  }

  const handleCreateCanvas = () => {
    if (!CANVAS_ENABLED) return
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
          'Comandos: /limpar (Novo), /upload (Arq), /juris (Pesquisa Legal)',
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
    if (CANVAS_ENABLED && input.trim() === '/canvas') {
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

  // --- ChatGPT Style Layout ---
  const [showAttachMenu, setShowAttachMenu] = useState(false)

  // New Upload State
  const [uploadingFiles, setUploadingFiles] = useState<
    Array<{
      name: string
      size: number
      type?: string
      progress: number
      error?: string
    }>
  >([])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showAttachMenu && !target.closest('.attach-menu-container')) {
        setShowAttachMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAttachMenu])

  // --- Upload Logic ---
  const handleNativeFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    // Close menu if open
    setShowAttachMenu(false)

    const files = Array.from(e.target.files)

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''

    // Add to uploading state
    const newUploads = files.map((f) => ({
      name: f.name,
      size: f.size,
      type: f.type,
      progress: 0,
      file: f
    }))

    setUploadingFiles((prev) => [
      ...prev,
      ...newUploads.map(({ ...rest }) => rest)
    ])

    // Process each file
    for (const { file } of newUploads) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    try {
      // Validations (simulated from modal)
      const MAX_SIZE = 10 * 1024 * 1024 // 10MB
      if (file.size > MAX_SIZE) {
        throw new Error('Arquivo muito grande (Máx 10MB)')
      }

      // Simulate Progress
      setUploadingFiles((prev) =>
        prev.map((u) => (u.name === file.name ? { ...u, progress: 10 } : u))
      )

      // 1. Ensure Session Exists
      let targetSessionId = sessionId
      if (!targetSessionId) {
        // Create session on the fly if needed
        // We need to fetch /api/sessions
        // Ideally this should be a utility, but implementing inline for now
        try {
          const sessionRes = await fetch('/api/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: 'Análise de documento' })
          })
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json()
            targetSessionId = sessionData.id
            if (onSessionCreated && targetSessionId)
              onSessionCreated(targetSessionId)
          }
        } catch (e) {
          console.error('Error creating session', e)
        }
      }

      setUploadingFiles((prev) =>
        prev.map((u) => (u.name === file.name ? { ...u, progress: 30 } : u))
      )

      // 2. Upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', userId)
      if (targetSessionId) formData.append('session_id', targetSessionId)
      formData.append('auto_process', 'true')

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Falha no upload')
      }

      const data = await response.json()

      setUploadingFiles((prev) =>
        prev.map((u) => (u.name === file.name ? { ...u, progress: 100 } : u))
      )

      // 3. Complete
      if (onFileUploaded && targetSessionId) {
        onFileUploaded(data.id, targetSessionId, {
          name: file.name,
          size: file.size,
          type: file.type
        })
      }

      // Remove from uploading list after short delay
      setTimeout(() => {
        setUploadingFiles((prev) => prev.filter((u) => u.name !== file.name))
      }, 500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro'
      setUploadingFiles((prev) =>
        prev.map((u) =>
          u.name === file.name ? { ...u, error: msg, progress: 0 } : u
        )
      )
      toast.error(`Erro ao enviar ${file.name}: ${msg}`)
    }
  }

  return (
    <>
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.4,
            ease: 'easeOut'
          }}
          className="relative mx-auto max-w-2xl pb-2"
        >
          {/* Layer 6: Reflexo Inferior (Chão) */}
          <div
            className="absolute -bottom-10 left-0 right-0 h-10 rounded-[100%] bg-gradient-to-b from-verity-900/10 to-transparent blur-xl"
            style={{
              transform: 'translateZ(-40px) scaleY(0.4)',
              transformOrigin: 'top'
            }}
          />

          {/* Layer 5: Sombra Profunda */}
          <div
            className="absolute inset-0 rounded-[2.5rem] bg-verity-950/20 blur-2xl transition-all duration-500 group-hover:bg-verity-950/25"
            style={{
              transform: 'translateZ(-30px) scale(0.9) translateY(25px)'
            }}
          />

          {/* Attachments Preview - Floating above */}
          {(attachments.length > 0 ||
            externalAttachments.length > 0 ||
            uploadingFiles.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex flex-wrap gap-2 px-4"
              style={{ transform: 'translateZ(10px)' }}
            >
              {[
                ...externalAttachments.map((f) => ({
                  ...f,
                  isExternal: true,
                  isUploading: false
                })),
                ...attachments.map((f) => ({
                  ...f,
                  isExternal: false,
                  isUploading: false
                })),
                ...uploadingFiles.map((f) => ({
                  ...f,
                  isExternal: false,
                  isUploading: true,
                  id: 'temp'
                }))
              ].map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-center gap-2 overflow-hidden rounded-xl border border-sand-200 bg-sand-50/90 py-1.5 pl-3 pr-8 text-xs text-verity-900 shadow-lg backdrop-blur-md"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-sand-200 text-verity-600">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(file as any).isUploading ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (file.type || '').startsWith('image/') ? (
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
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(file as any).error ? (
                        <span className="text-error-500">Erro</span>
                      ) : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (file as any).isUploading ? (
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        `Enviando... ${(file as any).progress}%`
                      ) : (
                        formatFileSize(file.size)
                      )}
                    </span>
                  </div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {!(file as any).isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        if (
                          (file as any).isExternal &&
                          onRemoveExternalAttachment
                        ) {
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
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Attach Menu Dropdown - Positioned relative to the 3D container, or float it?
              Ideally it should be outside or on top. We'll put it in a motion div that floats.
          */}
          <AnimatePresence>
            {showAttachMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="attach-menu-container absolute bottom-full left-0 z-50 mb-4 ml-4 min-w-[240px] overflow-hidden rounded-2xl border border-sand-200 bg-white p-1.5 shadow-xl md:left-0"
                style={{ transform: 'translateZ(30px)' }}
              >
                <button
                  onClick={() => {
                    // setIsUploadModalOpen(true) // OLD
                    fileInputRef.current?.click() // NEW: Native File Picker
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-verity-800 hover:bg-sand-50"
                >
                  <Paperclip className="h-5 w-5 text-verity-600" />
                  Adicionar fotos e arquivos
                </button>
                {ENABLE_IMAGE_CREATION && (
                  <button
                    onClick={() => setShowAttachMenu(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-verity-800 hover:bg-sand-50"
                  >
                    <ImageIcon className="h-5 w-5 text-verity-600" />
                    Criar imagem
                  </button>
                )}
                {ENABLE_AGENT_MODE && (
                  <button
                    onClick={() => setShowAttachMenu(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-verity-800 hover:bg-sand-50"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-verity-600">
                      <span className="text-[10px] font-bold">A</span>
                    </div>
                    Modo Agente
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layer 4: Container Principal (Pílula Orgânica Suprema) */}
          <motion.div
            className="group relative flex items-end gap-2 rounded-full border border-sand-200 bg-white/50 px-5 py-2 backdrop-blur-xl transition-all duration-300 hover:border-verity-200/50 hover:bg-white/70"
            style={{
              transform: 'translateZ(0)',
              transformStyle: 'preserve-3d'
            }}
            initial={false}
            animate={isFocused ? 'focus' : 'rest'}
            variants={{
              rest: {
                scale: 1,
                boxShadow:
                  '0 2px 10px rgba(45, 90, 69, 0.03), 0 10px 40px -10px rgba(45, 90, 69, 0.05)',
                borderColor: 'rgba(212, 212, 208, 0.6)'
              },
              focus: {
                scale: 1.01,
                boxShadow:
                  '0 4px 20px rgba(45, 90, 69, 0.06), 0 20px 60px -20px rgba(45, 90, 69, 0.1)',
                borderColor: '#9DC4B0'
              }
            }}
            transition={{ duration: 0.4, ease: easings.butter }}
          >
            {/* Layer 3: Borda Iluminada Superior */}
            <div
              className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-60"
              style={{ transform: 'translateZ(2px)' }}
            />

            {/* Autosuggestion Floating Menu */}
            <SuggestionList
              isVisible={
                (ENABLE_SLASH_COMMANDS || ENABLE_MENTION_COMMANDS) &&
                !!suggestionMode &&
                filteredItems.length > 0
              }
              items={filteredItems}
              selectedIndex={selectedIndex}
              onSelect={selectItem}
              position={suggestionPos}
              trigger={suggestionMode === 'slash' ? '/' : '@'}
            />

            {/* Plus Button (Kept from Change #2), now integrated */}
            <div className="attach-menu-container mb-1 flex items-center">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-sand-100 text-verity-600 transition-colors hover:bg-verity-900 hover:text-white"
                aria-label="Adicionar anexos"
              >
                <motion.div
                  animate={{ rotate: showAttachMenu ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Plus className="h-5 w-5" />
                </motion.div>
              </button>
            </div>

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
                setTimeout(closeSuggestions, 200)
              }}
              placeholder={
                isLoading
                  ? 'Pensando...'
                  : disabled
                    ? 'Aguarde...'
                    : 'Descreva sua análise...'
              }
              role="combobox"
              aria-label="Mensagem para o assistente Verity Agro"
              className="relative z-10 flex-1 resize-none bg-transparent px-2 py-2 font-sans text-base text-verity-950 placeholder:text-verity-500 focus:outline-none"
              disabled={disabled}
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
                onChange={
                  handleNativeFileSelect
                } /* CHANGED to native handler */
              />

              {/* Send Button - Reverted to Change #3 (Old Style) */}
              <TooltipProvider delayDuration={300}>
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
                        disabled ||
                        uploadingFiles.length > 0 // Disable send while uploading
                      }
                      className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                        (!input.trim() &&
                          attachments.length === 0 &&
                          externalAttachments.length === 0) ||
                        isLoading ||
                        disabled ||
                        uploadingFiles.length > 0
                          ? 'cursor-not-allowed bg-sand-200 text-verity-300 opacity-70'
                          : 'bg-gradient-to-br from-verity-900 to-verity-800 text-white shadow-lg shadow-verity-900/20'
                      }`}
                      whileHover={
                        (!input.trim() &&
                          attachments.length === 0 &&
                          externalAttachments.length === 0) ||
                        isLoading ||
                        disabled ||
                        uploadingFiles.length > 0
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

                      {isLoading || uploadingFiles.length > 0 ? (
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
