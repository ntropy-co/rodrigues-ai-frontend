'use client'

import { useRef, useEffect, useState } from 'react'
import { Send, Plus, Wrench } from 'lucide-react'
import { useUIConfig } from '@/hooks/useUIConfig'
import { useDocuments } from '@/hooks/useDocuments'
import { FileUploadModal } from '@/components/v2/FileUpload/FileUploadModal'
import { FileList } from '@/components/v2/FileUpload/FileList'

interface InputBarProps {
  onSendMessage: (message: string) => void
  message: string
  setMessage: (message: string) => void
  disabled?: boolean
  userId?: string
  sessionId?: string
}

export function InputBar({
  onSendMessage,
  message,
  setMessage,
  disabled = false,
  userId,
  sessionId
}: InputBarProps) {
  const { ui } = useUIConfig()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  // Document management
  const {
    documents,
    loading: documentsLoading,
    fetchDocuments,
    removeDocument,
    downloadDocument
  } = useDocuments(userId || 'default-user', sessionId)

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [message])

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUploadComplete = async (_documentId: string) => {
    // Refresh documents list
    await fetchDocuments()
  }

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await removeDocument(documentId)
    } catch (error) {
      console.error('Error removing document:', error)
    }
  }

  const handleDownloadDocument = async (documentId: string) => {
    try {
      await downloadDocument(documentId)
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto max-w-4xl space-y-3 px-4">
        {/* File List */}
        {documents.length > 0 && (
          <FileList
            documents={documents}
            onRemove={handleRemoveDocument}
            onDownload={handleDownloadDocument}
            loading={documentsLoading}
          />
        )}

        {/* Barra principal */}
        <div className="flex items-end gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all focus-within:border-gemini-blue focus-within:shadow-xl dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)]">
          {/* Área de texto - 7/10 */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                disabled
                  ? 'Aguarde a resposta...'
                  : 'Pergunte ao Rodrigues AI...'
              }
              className="w-full resize-none border-0 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0"
              disabled={disabled}
              rows={1}
              style={{ minHeight: '20px', maxHeight: '120px' }}
              aria-label="Campo de mensagem"
              aria-describedby="message-disclaimer"
            />

            {/* Botões de ação (abaixo do texto quando não há mensagem) */}
            {!message.trim() && (
              <div className="mt-2 flex gap-2">
                {ui.features.showUploadButton && (
                  <button
                    className="flex min-h-[44px] items-center gap-1 rounded-full bg-gemini-gray-100 px-4 py-2 text-sm text-gemini-gray-600 transition-all hover:bg-gemini-gray-200 active:scale-95"
                    onClick={() => setShowUploadModal(true)}
                    aria-label="Adicionar arquivo"
                  >
                    <Plus className="h-4 w-4" />
                    Arquivo
                  </button>
                )}

                {ui.features.showToolsButton && (
                  <button
                    className="flex min-h-[44px] items-center gap-1 rounded-full bg-gemini-gray-100 px-4 py-2 text-sm text-gemini-gray-600 transition-all hover:bg-gemini-gray-200 active:scale-95"
                    onClick={() => console.log('Open tools')}
                    aria-label="Abrir ferramentas"
                  >
                    <Wrench className="h-4 w-4" />
                    Ferramentas
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Ações principais - 3/10 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              className={`flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-full transition-all ${
                disabled || !message.trim()
                  ? 'cursor-not-allowed bg-gemini-gray-300 text-gemini-gray-500'
                  : 'bg-gemini-blue text-white hover:bg-gemini-blue-hover active:scale-95'
              }`}
              aria-label="Enviar mensagem"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <p
          id="message-disclaimer"
          className="mt-2 text-center text-xs text-gemini-gray-500"
        >
          Rodrigues AI pode cometer erros. Verifique informações importantes.
        </p>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
        userId={userId || 'default-user'}
        sessionId={sessionId}
      />
    </div>
  )
}
