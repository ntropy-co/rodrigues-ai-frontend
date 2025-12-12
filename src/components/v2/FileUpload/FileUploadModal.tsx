'use client'

import { useState, useRef } from 'react'
import {
  Upload,
  X,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: (documentId: string) => void
  onFilesSelected?: (files: File[]) => void
  userId: string
  sessionId?: string
  mode?: 'upload' | 'attach' // 'upload' para sistema antigo, 'attach' para anexar à mensagem
}

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/jpeg',
  'image/png'
]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUploadModal({
  isOpen,
  onClose,
  onUploadComplete,
  onFilesSelected,
  userId,
  sessionId,
  mode = 'upload' // Padrão é upload para compatibilidade
}: FileUploadModalProps) {
  const [files, setFiles] = useState<File[]>([]) // Mudou de file para files (array)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const validateFile = (selectedFile: File): string | null => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      return 'Tipo de arquivo não permitido. Use PDF, DOC, TXT, MD, CSV, XLS ou imagens (JPG, PNG)'
    }
    if (selectedFile.size > MAX_SIZE) {
      return `Arquivo muito grande (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB). Máximo: 10MB`
    }
    return null
  }

  const handleFileSelect = (selectedFiles: FileList | File[]) => {
    const filesToAdd = Array.from(selectedFiles)

    // Validar todos os arquivos
    for (const file of filesToAdd) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    if (mode === 'attach') {
      // Modo anexar: adiciona à lista existente
      setFiles((prev) => [...prev, ...filesToAdd])
    } else {
      // Modo upload: substitui (comportamento original, só 1 arquivo)
      setFiles([filesToAdd[0]])
    }

    setError(null)
    setSuccess(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleConfirm = async () => {
    if (files.length === 0) return

    // Modo anexar: apenas retorna os arquivos selecionados
    if (mode === 'attach' && onFilesSelected) {
      onFilesSelected(files)
      handleClose()
      return
    }

    // Modo upload: faz upload do arquivo (comportamento original)
    if (mode === 'upload' && onUploadComplete) {
      setUploading(true)
      setError(null)
      setUploadProgress(0)

      try {
        const formData = new FormData()
        formData.append('file', files[0]) // No modo upload, só envia o primeiro
        formData.append('user_id', userId)
        if (sessionId) {
          formData.append('session_id', sessionId)
        }
        formData.append('auto_process', 'true')

        // Use Next.js API Route as proxy to avoid CORS issues
        console.log(
          '[FileUploadModal] Uploading to proxy:',
          '/api/documents/upload'
        )

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.detail || 'Erro ao fazer upload')
        }

        const data = await response.json()

        setUploadProgress(100)
        setSuccess(true)

        // Wait a bit to show success message
        setTimeout(() => {
          onUploadComplete(data.id)
          handleClose()
        }, 1500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
        setUploading(false)
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClose = () => {
    setFiles([])
    setError(null)
    setSuccess(false)
    setUploading(false)
    setUploadProgress(0)
    onClose()
  }

  const getFileIcon = () => {
    if (files.length === 0)
      return <Upload className="text-gemini-gray-400 h-12 w-12" />
    if (success) return <CheckCircle className="h-12 w-12 text-green-500" />
    if (error) return <AlertCircle className="h-12 w-12 text-red-500" />
    return <FileText className="text-gemini-blue h-12 w-12" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-gemini-gray-900 text-xl font-semibold">
            Upload de Documento
          </h2>
          <button
            onClick={handleClose}
            className="hover-hover:bg-gemini-gray-100 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors"
            disabled={uploading}
            aria-label="Fechar modal"
          >
            <X className="text-gemini-gray-600 h-5 w-5" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? 'border-gemini-blue bg-gemini-blue/5'
              : 'border-gemini-gray-300 bg-gemini-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Icon */}
          <div className="mb-4 flex justify-center">
            {uploading ? (
              <Loader2 className="text-gemini-blue h-12 w-12 animate-spin" />
            ) : (
              getFileIcon()
            )}
          </div>

          {/* Content */}
          {files.length > 0 ? (
            <div className="space-y-2">
              {mode === 'attach' && files.length > 1 ? (
                // Modo anexar com múltiplos arquivos - mostrar lista
                <div className="space-y-2">
                  <p className="text-gemini-gray-900 font-medium">
                    {files.length} arquivo{files.length > 1 ? 's' : ''}{' '}
                    selecionado{files.length > 1 ? 's' : ''}
                  </p>
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="bg-gemini-gray-100 flex items-center justify-between rounded px-2 py-1"
                      >
                        <div className="flex-1 truncate text-sm">
                          {file.name}
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-gemini-gray-500 ml-2 hover:text-red-500"
                          aria-label={`Remover ${file.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    className="text-gemini-blue text-sm font-medium hover-hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    + Adicionar mais arquivos
                  </button>
                </div>
              ) : (
                // Modo upload ou um único arquivo - mostrar detalhes
                <>
                  <p className="text-gemini-gray-900 font-medium">
                    {files[0].name}
                  </p>
                  <p className="text-gemini-gray-600 text-sm">
                    {(files[0].size / 1024 / 1024).toFixed(2)} MB
                  </p>

                  {uploading && (
                    <div className="mt-4">
                      <div className="bg-gemini-gray-200 h-2 w-full rounded-full">
                        <div
                          className="bg-gemini-blue h-2 rounded-full transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-gemini-gray-600 mt-2 text-sm">
                        {success
                          ? 'Processado com sucesso!'
                          : 'Processando documento...'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gemini-gray-700">
                Arraste {mode === 'attach' ? 'arquivos' : 'um arquivo'} aqui ou{' '}
                <button
                  className="text-gemini-blue font-medium hover-hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  selecione
                </button>
              </p>
              <p className="text-gemini-gray-500 text-sm">
                PDF, DOC, TXT, MD, CSV, XLS, JPG, PNG (máx. 10MB
                {mode === 'attach' ? ' cada' : ''})
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.md,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
            multiple={mode === 'attach'}
            onChange={(e) =>
              e.target.files &&
              e.target.files.length > 0 &&
              handleFileSelect(e.target.files)
            }
            disabled={uploading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleClose}
            className="border-gemini-gray-300 text-gemini-gray-700 hover-hover:bg-gemini-gray-50 flex-1 rounded-lg border px-4 py-2 transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={files.length === 0 || uploading || success}
            className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
              files.length === 0 || uploading || success
                ? 'bg-gemini-gray-300 cursor-not-allowed'
                : 'bg-gemini-blue hover-hover:bg-gemini-blue-hover'
            }`}
          >
            {uploading
              ? 'Enviando...'
              : success
                ? 'Concluído!'
                : mode === 'attach'
                  ? 'OK'
                  : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
