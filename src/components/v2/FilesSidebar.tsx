'use client'

import { memo, useCallback } from 'react'
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
import type { ChatFile } from '@/types/chat-files'

interface FilesSidebarProps {
  conversationId: string | null
  isOpen?: boolean
  overlay?: boolean
  onClose?: () => void
}

const sidebarSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1
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

export function FilesSidebar({
  conversationId,
  isOpen = true,
  overlay = false,
  onClose
}: FilesSidebarProps) {
  const { close: storeClose } = useFilesSidebarStore()
  const { uploadedFiles, generatedFiles, downloadFile } =
    useChatFiles(conversationId)

  const handleClose = onClose || storeClose

  const sidebarContent = (
    <div className="flex h-full w-[320px] flex-col">
      {/* Header */}
      <div className="flex flex-col border-b border-verity-100 p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-verity-950">
            Arquivos
          </h3>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-verity-600 transition-colors hover:bg-verity-100 hover:text-verity-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-verity-600">Documentos desta análise</p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Uploads Section */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-xs font-medium uppercase tracking-wide text-verity-700">
              Enviados por você
            </h4>
            <span className="text-xs font-medium text-verity-400">
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
                <FileItem key={file.id} file={file} onDownload={downloadFile} />
              ))
            )}
          </motion.div>
        </div>

        {/* Generated Section */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-xs font-medium uppercase tracking-wide text-verity-700">
              Gerados pela IA
            </h4>
            <span className="text-xs font-medium text-verity-400">
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
                  onDownload={downloadFile}
                  isGenerated
                />
              ))
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-sand-300 bg-sand-200 p-4">
        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-verity-200 bg-verity-50 px-4 py-2.5 text-sm font-medium text-verity-900 shadow-sm transition-all hover:bg-verity-100 hover:shadow-md active:scale-95 disabled:opacity-50"
          disabled={uploadedFiles.length === 0 && generatedFiles.length === 0}
        >
          <Download className="h-4 w-4" />
          Baixar todos
        </button>
      </div>
    </div>
  )

  if (overlay) {
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-verity-950/20 backdrop-blur-sm"
        />

        {/* Sidebar */}
        <motion.aside
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={sidebarSpring}
          className="fixed right-0 top-0 z-50 h-screen w-[320px] border-l border-sand-300 bg-sand-200"
        >
          {sidebarContent}
        </motion.aside>
      </>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 320 : 0 }}
      transition={sidebarSpring}
      className="relative flex-shrink-0 overflow-hidden border-l border-sand-300 bg-sand-200"
    >
      {sidebarContent}
    </motion.aside>
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
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-verity-200 bg-verity-50/50 py-8 text-center"
    >
      <FileQuestion className="mb-2 h-8 w-8 text-verity-300" />
      <p className="text-xs font-medium text-verity-700">{message}</p>
      {subtext && (
        <p className="mt-0.5 text-[10px] text-verity-500">{subtext}</p>
      )}
    </motion.div>
  )
}

const FileItem = memo(function FileItem({
  file,
  onDownload,
  isGenerated
}: {
  file: ChatFile
  onDownload: (fileId: string) => void
  isGenerated?: boolean
}) {
  const Icon = getFileIcon(file.fileExtension)

  const handleClick = useCallback(() => {
    onDownload(file.id)
  }, [onDownload, file.id])

  return (
    <motion.button
      variants={item}
      onClick={handleClick}
      className="group flex w-full items-start gap-3 rounded-lg border border-transparent p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-verity-200 hover:bg-white hover:shadow-md"
    >
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          isGenerated
            ? 'text-ouro-700 group-hover:bg-ouro-200 bg-ouro-100'
            : 'bg-verity-100 text-verity-700 group-hover:bg-verity-200'
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-verity-950 group-hover:text-verity-900">
            {file.fileName}
          </p>
          {isGenerated && (
            <span className="text-ouro-700 bg-ouro-100 flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Novo
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-verity-600">
          {formatFileSize(file.fileSize)} ·{' '}
          {formatRelativeTime(file.generatedAt ?? file.uploadedAt)}
        </p>
      </div>

      <div className="opacity-0 transition-opacity group-hover:opacity-100">
        <Download className="h-4 w-4 text-verity-400" />
      </div>
    </motion.button>
  )
})
