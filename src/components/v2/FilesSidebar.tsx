'use client'

import { motion } from 'framer-motion'
import { useFilesSidebarStore } from '@/stores/filesSidebarStore'
import { useChatFiles } from '@/hooks/useChatFiles'
import { X, Download, FileQuestion } from 'lucide-react'
import {
  formatFileSize,
  formatRelativeTime,
  getFileIcon
} from '@/lib/utils/file-utils'
import { cn } from '@/lib/utils'

interface FilesSidebarProps {
  conversationId: string | null
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 }
}

export function FilesSidebar({ conversationId }: FilesSidebarProps) {
  const { isOpen, close } = useFilesSidebarStore()
  const { uploadedFiles, generatedFiles, downloadFile } =
    useChatFiles(conversationId)

  if (!isOpen) return null

  return (
    <aside className="animate-slide-in-right fixed inset-y-0 right-0 z-40 flex w-80 flex-col border-l border-verde-200 bg-verde-50 pt-16 shadow-xl transition-all duration-300 md:static md:pt-0 md:shadow-none">
      {/* Header */}
      <div className="flex flex-col border-b border-verde-200 p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-verde-950">
            Arquivos
          </h3>
          <button
            onClick={close}
            className="rounded-full p-1 text-verde-700 transition-colors hover:bg-verde-100 hover:text-verde-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-verde-600">Documentos desta análise</p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Uploads Section */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-xs font-medium uppercase tracking-wide text-verde-700">
              Enviados por você
            </h4>
            <span className="text-xs font-medium text-verde-400">
              {uploadedFiles.length}
            </span>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {uploadedFiles.length === 0 ? (
              <EmptyState
                message="Nenhum arquivo enviado"
                subtext="Envie documentos para análise"
              />
            ) : (
              uploadedFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onDownload={() => downloadFile(file.id)}
                />
              ))
            )}
          </motion.div>
        </div>

        {/* Generated Section */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-xs font-medium uppercase tracking-wide text-verde-700">
              Gerados pela IA
            </h4>
            <span className="text-xs font-medium text-verde-400">
              {generatedFiles.length}
            </span>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            {generatedFiles.length === 0 ? (
              <EmptyState
                message="Nenhum arquivo gerado"
                subtext="Relatórios aparecerão aqui"
              />
            ) : (
              generatedFiles.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  onDownload={() => downloadFile(file.id)}
                  isGenerated
                />
              ))
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-verde-200 bg-verde-50/50 p-4 backdrop-blur-sm">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-verde-300 bg-white px-4 py-2 text-sm font-medium text-verde-900 shadow-sm transition-all hover:bg-verde-50 hover:text-verde-950 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:hover:shadow-sm disabled:active:scale-100"
          disabled={uploadedFiles.length === 0 && generatedFiles.length === 0}
        >
          <Download className="h-4 w-4" />
          Baixar todos
        </button>
      </div>
    </aside>
  )
}

function EmptyState({
  message,
  subtext
}: {
  message: string
  subtext?: string
}) {
  return (
    <motion.div
      variants={item}
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-verde-200 bg-verde-50/50 py-8 text-center"
    >
      <FileQuestion className="mb-2 h-8 w-8 text-verde-300" />
      <p className="text-xs font-medium text-verde-700">{message}</p>
      {subtext && (
        <p className="mt-0.5 text-[10px] text-verde-500">{subtext}</p>
      )}
    </motion.div>
  )
}

function FileItem({
  file,
  onDownload,
  isGenerated
}: {
  file: unknown
  onDownload: () => void
  isGenerated?: boolean
}) {
  const Icon = getFileIcon(file.fileExtension)

  return (
    <motion.button
      variants={item}
      onClick={onDownload}
      className="group flex w-full items-start gap-3 rounded-lg border border-transparent p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-verde-200 hover:bg-white hover:shadow-md"
    >
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          isGenerated
            ? 'text-ouro-700 group-hover:bg-ouro-200 bg-ouro-100'
            : 'bg-verde-100 text-verde-700 group-hover:bg-verde-200'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-verde-950 group-hover:text-verde-900">
            {file.fileName}
          </p>
          {isGenerated && (
            <span className="text-ouro-700 flex-shrink-0 rounded bg-ouro-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Novo
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-verde-600">
          {formatFileSize(file.fileSize)} ·{' '}
          {formatRelativeTime(new Date(file.uploadedAt || file.generatedAt))}
        </p>
      </div>

      <div className="opacity-0 transition-opacity group-hover:opacity-100">
        <Download className="h-4 w-4 text-verde-400" />
      </div>
    </motion.button>
  )
}
