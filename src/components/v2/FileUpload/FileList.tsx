'use client'

import { FileText, Download, X, Loader2 } from 'lucide-react'

export interface UserDocument {
  id: string
  filename: string
  file_size: number
  mime_type: string
  processed: boolean
  created_at: string
}

interface FileListProps {
  documents: UserDocument[]
  onRemove?: (documentId: string) => void
  onDownload?: (documentId: string) => void
  loading?: boolean
}

export function FileList({ documents, onRemove, onDownload, loading }: FileListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gemini-gray-400" />
      </div>
    )
  }

  if (documents.length === 0) {
    return null
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'DOCX'
    if (mimeType.includes('text')) return 'TXT'
    if (mimeType.includes('image')) return 'Imagem'
    return 'Arquivo'
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gemini-gray-600">
        Documentos anexados ({documents.length})
      </p>

      <div className="space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 rounded-lg border border-gemini-gray-200 bg-white p-3 shadow-sm"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gemini-blue/10">
                <FileText className="h-5 w-5 text-gemini-blue" />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gemini-gray-900">
                {doc.filename}
              </p>
              <div className="mt-1 flex items-center gap-2 text-xs text-gemini-gray-500">
                <span>{getFileTypeLabel(doc.mime_type)}</span>
                <span>•</span>
                <span>{formatFileSize(doc.file_size)}</span>
                {doc.processed && (
                  <>
                    <span>•</span>
                    <span className="text-green-600">Processado</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1">
              {onDownload && (
                <button
                  onClick={() => onDownload(doc.id)}
                  className="rounded-lg p-2 text-gemini-gray-600 hover:bg-gemini-gray-100 transition-colors"
                  title="Baixar documento"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}

              {onRemove && (
                <button
                  onClick={() => onRemove(doc.id)}
                  className="rounded-lg p-2 text-gemini-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="Remover documento"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
