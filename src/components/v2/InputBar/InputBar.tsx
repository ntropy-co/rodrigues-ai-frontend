'use client'

import { motion } from 'framer-motion'
import {
  Paperclip,
  Send,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Sparkles
} from 'lucide-react'
import { useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip/tooltip'
import { formatFileSize } from '@/lib/utils/file-utils'

interface InputBarProps {
  onSendMessage: (message: string, attachments?: File[]) => void
  onFileSelect?: (file: File) => void
  isLoading?: boolean
  disabled?: boolean
  // Props from GeminiLayout (controlled state)
  message?: string
  setMessage?: (message: string) => void
  userId?: string
  sessionId?: string
}

/**
 * Command-style input area for financial analysis.
 * Enterprise design: Structured, distinct background, specific tool icons.
 */
export function InputBar({
  onSendMessage,
  onFileSelect,
  isLoading = false,
  disabled = false,
  message = '',
  setMessage,
  // kept for interface compatibility
  sessionId: _sessionId // kept for interface compatibility
}: InputBarProps) {
  void _sessionId // suppress unused warning
  // Use controlled state if provided, otherwise local state (for standalone usage)
  const [localInput, setLocalInput] = useState('')
  const input = setMessage ? message : localInput
  const handleInputChange = (val: string) => {
    if (setMessage) {
      setMessage(val)
    } else {
      setLocalInput(val)
    }
  }

  const [isDragOver, setIsDragOver] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`
    }
  }, [input])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading || disabled)
      return
    onSendMessage(input, attachments) // Pass attachments to parent
    handleInputChange('')
    setAttachments([]) // Clear attachments locally after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setAttachments((prev) => [...prev, ...newFiles])
      // Opcional: Notificar pai sobre seleção (se necessário, mas onSendMessage já envia)
      if (onFileSelect) {
        newFiles.forEach((f) => onFileSelect(f))
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div
      className={`relative w-full bg-verde-50 px-4 pb-6 transition-colors dark:bg-background md:px-6 ${
        isDragOver ? 'bg-verde-100 dark:bg-gray-800' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragOver(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const newFiles = Array.from(e.dataTransfer.files)
          setAttachments((prev) => [...prev, ...newFiles])
        }
      }}
    >
      <div
        className="mx-auto max-w-4xl cursor-text"
        onClick={() => textareaRef.current?.focus()}
      >
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 flex flex-wrap gap-2 px-1"
          >
            {attachments.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 rounded-md border border-verde-200 bg-white px-3 py-1.5 text-xs text-verde-800 shadow-sm transition-all hover:border-verde-300 hover:shadow-md"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded bg-verde-50 text-verde-600">
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="max-w-[150px] truncate font-medium">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-verde-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeAttachment(index)
                  }}
                  className="ml-1 rounded-full p-0.5 text-verde-400 transition-colors hover:bg-verde-100 hover:text-verde-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Floating Input Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileFocus={{ scale: 1.01 }}
          className="group flex items-end gap-3 rounded-2xl border-2 border-verde-200 bg-white px-5 py-4 shadow-lg shadow-verde-900/5 transition-all duration-200 focus-within:border-verde-500 focus-within:shadow-xl focus-within:shadow-verde-900/10"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled
                ? 'Aguarde a resposta...'
                : 'Descreva sua análise ou consulte sobre CPR...'
            }
            className="flex-1 resize-none bg-transparent py-2 text-base text-verde-950 placeholder:text-verde-400/80 focus:outline-none"
            disabled={disabled}
            rows={1}
            style={{ maxHeight: '200px' }}
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pb-1">
            <input
              type="file"
              multiple
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <TooltipProvider delayDuration={300}>
              {/* Attach Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current?.click()
                    }}
                    className="group/btn flex h-9 w-9 items-center justify-center rounded-lg text-verde-600 transition-all hover:-translate-y-0.5 hover:bg-verde-50 hover:text-verde-800 active:translate-y-0"
                  >
                    <Paperclip className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="border-verde-900 bg-verde-950 text-white">
                  <p>Anexar documentos</p>
                </TooltipContent>
              </Tooltip>

              {/* AI Tools Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="group/btn flex h-9 w-9 items-center justify-center rounded-lg text-verde-600 transition-all hover:-translate-y-0.5 hover:bg-verde-50 hover:text-verde-800 active:translate-y-0"
                  >
                    <Sparkles className="h-5 w-5 transition-transform group-hover/btn:scale-110" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="border-verde-900 bg-verde-950 text-white">
                  <p>Ferramentas de IA</p>
                </TooltipContent>
              </Tooltip>

              {/* Send Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSend()
                    }}
                    disabled={
                      (!input.trim() && attachments.length === 0) ||
                      isLoading ||
                      disabled
                    }
                    className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-md transition-all duration-200 ${
                      (!input.trim() && attachments.length === 0) ||
                      isLoading ||
                      disabled
                        ? 'scale-95 cursor-not-allowed bg-gray-100 text-gray-400 opacity-70 shadow-none'
                        : 'bg-verde-900 text-white hover:scale-105 hover:bg-verde-800 hover:shadow-lg hover:shadow-verde-900/20 active:scale-95'
                    } `}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="ml-0.5 h-5 w-5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="border-verde-900 bg-verde-950 text-white">
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
          className="mt-3 text-center"
        >
          <p className="text-xs font-medium text-verde-600/70">
            Rodrigues AI pode cometer erros. Verifique informações importantes.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
