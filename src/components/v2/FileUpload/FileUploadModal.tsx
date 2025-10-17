'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete: (documentId: string) => void
  userId: string
  sessionId?: string
}

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain', 'image/jpeg', 'image/png']
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export function FileUploadModal({ isOpen, onClose, onUploadComplete, userId, sessionId }: FileUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const validateFile = (selectedFile: File): string | null => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      return 'Tipo de arquivo não permitido. Use PDF, DOCX, TXT ou imagens (JPG, PNG)'
    }
    if (selectedFile.size > MAX_SIZE) {
      return `Arquivo muito grande (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB). Máximo: 10MB`
    }
    return null
  }

  const handleFileSelect = (selectedFile: File) => {
    const validationError = validateFile(selectedFile)
    if (validationError) {
      setError(validationError)
      return
    }

    setFile(selectedFile)
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('user_id', userId)
      if (sessionId) {
        formData.append('session_id', sessionId)
      }
      formData.append('auto_process', 'true')

      // Get API URL from environment or default
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${apiUrl}/api/v1/documents/upload`, {
        method: 'POST',
        body: formData,
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

  const handleClose = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    setUploading(false)
    setUploadProgress(0)
    onClose()
  }

  const getFileIcon = () => {
    if (!file) return <Upload className="h-12 w-12 text-gemini-gray-400" />
    if (success) return <CheckCircle className="h-12 w-12 text-green-500" />
    if (error) return <AlertCircle className="h-12 w-12 text-red-500" />
    return <FileText className="h-12 w-12 text-gemini-blue" />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gemini-gray-900">
            Upload de Documento
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 hover:bg-gemini-gray-100 transition-colors"
            disabled={uploading}
          >
            <X className="h-5 w-5 text-gemini-gray-600" />
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
              <Loader2 className="h-12 w-12 animate-spin text-gemini-blue" />
            ) : (
              getFileIcon()
            )}
          </div>

          {/* Content */}
          {file ? (
            <div className="space-y-2">
              <p className="font-medium text-gemini-gray-900">{file.name}</p>
              <p className="text-sm text-gemini-gray-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              {uploading && (
                <div className="mt-4">
                  <div className="h-2 w-full rounded-full bg-gemini-gray-200">
                    <div
                      className="h-2 rounded-full bg-gemini-blue transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gemini-gray-600">
                    {success ? 'Processado com sucesso!' : 'Processando documento...'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gemini-gray-700">
                Arraste um arquivo aqui ou{' '}
                <button
                  className="font-medium text-gemini-blue hover:underline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  selecione
                </button>
              </p>
              <p className="text-sm text-gemini-gray-500">
                PDF, DOCX, TXT, JPG, PNG (máx. 10MB)
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
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
            className="flex-1 rounded-lg border border-gemini-gray-300 px-4 py-2 text-gemini-gray-700 hover:bg-gemini-gray-50 transition-colors"
            disabled={uploading}
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading || success}
            className={`flex-1 rounded-lg px-4 py-2 font-medium text-white transition-colors ${
              !file || uploading || success
                ? 'bg-gemini-gray-300 cursor-not-allowed'
                : 'bg-gemini-blue hover:bg-gemini-blue-hover'
            }`}
          >
            {uploading ? 'Enviando...' : success ? 'Concluído!' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}
