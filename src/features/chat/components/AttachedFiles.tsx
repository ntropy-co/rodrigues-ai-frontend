'use client'

import { X, FileText, Image as ImageIcon } from 'lucide-react'

export interface AttachedFile {
  file: File
  id: string
}

interface AttachedFilesProps {
  files: AttachedFile[]
  onRemove: (id: string) => void
}

export function AttachedFiles({ files, onRemove }: AttachedFilesProps) {
  if (files.length === 0) return null

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {files.map((attachedFile) => (
        <div
          key={attachedFile.id}
          className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm"
        >
          <div className="text-muted-foreground">
            {getFileIcon(attachedFile.file)}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="max-w-[150px] truncate font-medium text-foreground">
              {attachedFile.file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatFileSize(attachedFile.file.size)}
            </span>
          </div>
          <button
            onClick={() => onRemove(attachedFile.id)}
            className="flex min-h-[24px] min-w-[24px] items-center justify-center rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Remover ${attachedFile.file.name}`}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
    </div>
  )
}
