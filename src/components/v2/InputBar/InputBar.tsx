'use client'

import { useRef, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Send, Plus, Wrench } from 'lucide-react'
import { useUIConfig } from '@/hooks/useUIConfig'
import { useDocuments } from '@/hooks/useDocuments'
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight'
import { useHaptic } from '@/hooks/useHaptic'
import { FileList } from '@/components/v2/FileUpload/FileList'
import { AttachedFiles, type AttachedFile } from './AttachedFiles'
import { SelectedTool, type SelectedToolData } from '../Tools/SelectedTool'

// Dynamic import para code splitting - Modal só carrega quando clicado
// Reduz bundle inicial em ~20KB, pois FileUploadModal raramente é usado
const FileUploadModal = dynamic(
  () =>
    import('@/components/v2/FileUpload/FileUploadModal').then((m) => ({
      default: m.FileUploadModal
    })),
  {
    ssr: false, // Modal não precisa SSR
    loading: () => (
      // Spinner centralizado durante carregamento
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
)

// Dynamic import para ToolsModal
const ToolsModal = dynamic(
  () =>
    import('@/components/v2/Tools/ToolsModal').then((m) => ({
      default: m.ToolsModal
    })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }
)

interface InputBarProps {
  onSendMessage: (message: string, files?: File[], toolId?: string) => void
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
  const [showAttachModal, setShowAttachModal] = useState(false)
  const [showToolsModal, setShowToolsModal] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [selectedTool, setSelectedTool] = useState<SelectedToolData | null>(null)
  const keyboardHeight = useKeyboardHeight()
  const { trigger: triggerHaptic } = useHaptic()

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
      triggerHaptic('medium')
      const filesToSend = attachedFiles.map((af) => af.file)

      // Enviar tool_id se há ferramenta selecionada (backend irá adicionar instruções)
      const toolId = selectedTool?.id

      onSendMessage(
        message.trim(),
        filesToSend.length > 0 ? filesToSend : undefined,
        toolId
      )
      setMessage('')
      setAttachedFiles([]) // Limpar arquivos anexados após enviar
      // NÃO limpar selectedTool aqui - manter a ferramenta ativa durante a conversa
    }
  }

  const handleFilesSelected = (files: File[]) => {
    const newAttachedFiles: AttachedFile[] = files.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`
    }))
    setAttachedFiles((prev) => [...prev, ...newAttachedFiles])
  }

  const handleRemoveAttachedFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleToolSelect = (toolId: string, toolName: string) => {
    setSelectedTool({ id: toolId, name: toolName })
  }

  const handleRemoveTool = () => {
    setSelectedTool(null)
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
    <div
      className="fixed bottom-0 left-0 right-0 transition-all duration-200 ease-out"
      style={{
        paddingBottom: `calc(1rem + env(safe-area-inset-bottom) + ${keyboardHeight}px)`
      }}
    >
      <div className="mx-auto max-w-4xl space-y-3 px-4 landscape:space-y-2">
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
        <div className="flex items-end gap-3 rounded-2xl border border-border bg-card/100 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] transition-all focus-within:border-gemini-blue focus-within:shadow-xl backdrop-safe:backdrop-blur-sm dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)] landscape:p-2">
          {/* Área de texto - 7/10 */}
          <div className="flex-1">
            {/* Ferramenta selecionada */}
            <SelectedTool tool={selectedTool} onRemove={handleRemoveTool} />

            {/* Arquivos anexados */}
            {attachedFiles.length > 0 && (
              <AttachedFiles
                files={attachedFiles}
                onRemove={handleRemoveAttachedFile}
              />
            )}

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
                    className="flex min-h-[44px] items-center gap-1 rounded-full bg-gemini-gray-100 px-4 py-2 text-sm text-gemini-gray-600 transition-all active:scale-95 hover-hover:bg-gemini-gray-200"
                    onClick={() => setShowAttachModal(true)}
                    aria-label="Adicionar arquivo"
                  >
                    <Plus className="h-4 w-4" />
                    Arquivo
                  </button>
                )}

                {ui.features.showToolsButton && (
                  <button
                    className="flex min-h-[44px] items-center gap-1 rounded-full bg-gemini-gray-100 px-4 py-2 text-sm text-gemini-gray-600 transition-all active:scale-95 hover-hover:bg-gemini-gray-200"
                    onClick={() => setShowToolsModal(true)}
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
                  : 'bg-gemini-blue text-white active:scale-95 hover-hover:bg-gemini-blue-hover'
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

      {/* Upload Modal (sistema antigo - upload direto) */}
      <FileUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
        userId={userId || 'default-user'}
        sessionId={sessionId}
        mode="upload"
      />

      {/* Attach Modal (novo sistema - anexar à mensagem) */}
      <FileUploadModal
        isOpen={showAttachModal}
        onClose={() => setShowAttachModal(false)}
        onFilesSelected={handleFilesSelected}
        userId={userId || 'default-user'}
        sessionId={sessionId}
        mode="attach"
      />

      {/* Tools Modal */}
      <ToolsModal
        isOpen={showToolsModal}
        onClose={() => setShowToolsModal(false)}
        onToolSelect={handleToolSelect}
      />
    </div>
  )
}
