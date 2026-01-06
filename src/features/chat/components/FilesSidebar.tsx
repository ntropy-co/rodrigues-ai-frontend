/* eslint-disable react-hooks/static-components */
'use client'

import { memo, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useFilesSidebarStore } from '@/features/chat'
import { useChatFiles } from '../hooks/useChatFiles'
import { X, Download, FileQuestion } from 'lucide-react'
import { formatFileSize, getFileIcon } from '@/lib/utils/file-utils'
import { formatRelativeTime } from '@/lib/utils/time'
import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import type { ChatFile } from '../types'
import { AnimatePresence } from 'framer-motion'

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

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())

  // Reset selection when closing
  const handleClose = useCallback(() => {
    setIsSelectionMode(false)
    setSelectedFiles(new Set())
    if (onClose) onClose()
    else storeClose()
  }, [onClose, storeClose])

  const toggleSelectionMode = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false)
      setSelectedFiles(new Set())
    } else {
      setIsSelectionMode(true)
    }
  }

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId)
    } else {
      newSelected.add(fileId)
    }
    setSelectedFiles(newSelected)
  }

  const handleDownload = () => {
    if (selectedFiles.size > 0) {
      // Download selected
      selectedFiles.forEach((id) => downloadFile(id))
      // Optional: exit selection mode after download?
      // setIsSelectionMode(false)
      // setSelectedFiles(new Set())
    } else {
      // Download all
      const allFiles = [...uploadedFiles, ...generatedFiles]
      allFiles.forEach((f) => downloadFile(f.id))
    }
  }

  const sidebarContent = (
    <div className="flex h-full w-[320px] flex-col">
      {/* Header */}
      <div className="flex flex-col border-b border-sand-300/50 bg-sand-200/50 p-4 backdrop-blur-sm">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-base font-medium text-verity-950">
            Arquivos
          </h3>
          <div className="flex items-center gap-2">
            {(uploadedFiles.length > 0 || generatedFiles.length > 0) && (
              <button
                onClick={toggleSelectionMode}
                className={cn(
                  'text-xs font-medium transition-colors hover:text-verity-900',
                  isSelectionMode ? 'text-verity-900' : 'text-verity-600'
                )}
              >
                {isSelectionMode ? 'Cancelar' : 'Selecionar'}
              </button>
            )}
            <button
              onClick={handleClose}
              className="rounded-full p-1.5 text-verity-600 transition-colors hover:bg-sand-300 hover:text-verity-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-verity-500">Documentos desta análise</p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* Uploads Section */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-verity-600/70">
              Documentos Enviados
            </h4>
            <span className="text-[10px] font-medium text-verity-400">
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
                  onDownload={downloadFile}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedFiles.has(file.id)}
                  onToggleSelection={() => toggleFileSelection(file.id)}
                />
              ))
            )}
          </motion.div>
        </div>

        {/* Generated Section */}
        <div>
          <div className="mb-3 flex items-center justify-between px-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-verity-600/70">
              Documentos Gerados
            </h4>
            <span className="text-[10px] font-medium text-verity-400">
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
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedFiles.has(file.id)}
                  onToggleSelection={() => toggleFileSelection(file.id)}
                />
              ))
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-sand-300 bg-sand-200 p-4">
        <button
          onClick={handleDownload}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-sand-400 bg-sand-300/50 px-4 py-2.5 text-sm font-medium text-verity-800 shadow-sm transition-all hover:bg-sand-300 hover:shadow-md active:scale-95 disabled:opacity-50"
          disabled={uploadedFiles.length === 0 && generatedFiles.length === 0}
        >
          <Download className="h-4 w-4" />
          {isSelectionMode && selectedFiles.size > 0
            ? `Baixar (${selectedFiles.size}) selecionados`
            : 'Baixar todos'}
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
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-sand-400 bg-sand-100/50 py-8 text-center"
    >
      <FileQuestion className="mb-2 h-8 w-8 text-sand-400" />
      <p className="text-xs font-medium text-verity-600">{message}</p>
      {subtext && (
        <p className="mt-0.5 text-[10px] text-verity-500">{subtext}</p>
      )}
    </motion.div>
  )
}

const FileItem = memo(function FileItem({
  file,
  onDownload,
  isGenerated,
  isSelectionMode,
  isSelected,
  onToggleSelection
}: {
  file: ChatFile
  onDownload: (fileId: string) => void
  isGenerated?: boolean
  isSelectionMode?: boolean
  isSelected?: boolean
  onToggleSelection?: () => void
}) {
  const Icon = getFileIcon(file.fileExtension)

  const handleClick = useCallback(() => {
    if (isSelectionMode) {
      onToggleSelection?.()
    } else {
      onDownload(file.id)
    }
  }, [isSelectionMode, onToggleSelection, onDownload, file.id])

  return (
    <motion.button
      variants={item}
      onClick={handleClick}
      className={cn(
        'group flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition-all duration-200 hover:shadow-md',
        isSelected
          ? 'border-verity-600 bg-verity-50'
          : 'border-transparent hover:-translate-y-0.5 hover:border-verity-200 hover:bg-white'
      )}
    >
      <AnimatePresence mode="popLayout">
        {isSelectionMode && (
          <motion.div
            initial={{ width: 0, opacity: 0, marginRight: 0 }}
            animate={{ width: 'auto', opacity: 1, marginRight: 8 }}
            exit={{ width: 0, opacity: 0, marginRight: 0 }}
            className="flex items-center self-center overflow-hidden"
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleSelection?.()}
              // Prevent parent click
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg transition-colors',
          isGenerated
            ? 'bg-ouro-100 text-ouro-700 group-hover:bg-ouro-200'
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
            <span className="flex-shrink-0 rounded bg-ouro-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ouro-700">
              Novo
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-verity-600">
          {formatFileSize(file.fileSize)} ·{' '}
          {formatRelativeTime(file.generatedAt ?? file.uploadedAt)}
        </p>
      </div>

      {!isSelectionMode && (
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <Download className="h-4 w-4 text-verity-400" />
        </div>
      )}
    </motion.button>
  )
})
