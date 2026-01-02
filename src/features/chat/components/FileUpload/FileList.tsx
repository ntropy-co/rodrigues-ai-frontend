'use client'

import { FileText, Download, Trash2, Loader2, Calendar } from 'lucide-react'

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

export function FileList({
  documents,
  onRemove,
  onDownload,
  loading
}: FileListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-verity-400" />
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

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getFileTypeLabel = (mimeType: string): string => {
    if (mimeType.includes('pdf')) return 'PDF'
    if (mimeType.includes('word') || mimeType.includes('document'))
      return 'DOCX'
    if (mimeType.includes('text')) return 'TXT'
    if (mimeType.includes('image')) return 'Imagem'
    return 'Arquivo'
  }

  return (
    <div className="divide-y divide-verity-100">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-verity-50/50"
        >
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-verity-100">
              <FileText className="h-5 w-5 text-verity-600" />
            </div>
          </div>

          {/* Info - Main column */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-verity-900">
              {doc.filename}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-verity-500">
              <span className="rounded bg-verity-100 px-1.5 py-0.5 font-medium">
                {getFileTypeLabel(doc.mime_type)}
              </span>
              {doc.processed && (
                <span className="text-verity-600">Processado</span>
              )}
            </div>
          </div>

          {/* Size column */}
          <div className="hidden w-20 text-right text-xs text-verity-500 sm:block">
            {formatFileSize(doc.file_size)}
          </div>

          {/* Date column */}
          <div className="hidden w-28 items-center gap-1 text-xs text-verity-500 md:flex">
            <Calendar className="h-3 w-3" />
            {formatDate(doc.created_at)}
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            {onDownload && (
              <button
                onClick={() => onDownload(doc.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-verity-600 transition-colors hover:bg-verity-100 hover:text-verity-900"
                aria-label="Baixar documento"
              >
                <Download className="h-4 w-4" />
              </button>
            )}

            {onRemove && (
              <button
                onClick={() => onRemove(doc.id)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-verity-400 transition-colors hover:bg-error-50 hover:text-error-600"
                aria-label="Remover documento"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
