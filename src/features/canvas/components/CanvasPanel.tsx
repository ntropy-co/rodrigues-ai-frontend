import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Edit2,
  Eye,
  Lock,
  Download,
  FileText,
  FileCode,
  File
} from 'lucide-react'
import { useState } from 'react'
import { useCanvasStore } from '@/features/canvas'
import { useCanvasExport } from '../hooks/useCanvasExport'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { RichEditor } from './RichEditor'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export function CanvasPanel() {
  const { isOpen, content, title, mode, closeCanvas, setMode, updateContent } =
    useCanvasStore()
  const { exportToTxt, exportToHtml, exportToMarkdown } = useCanvasExport()

  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExport = (format: 'txt' | 'html' | 'md') => {
    const exportData = { content: content || '', title: title || 'Documento' }
    switch (format) {
      case 'txt':
        exportToTxt(exportData)
        break
      case 'html':
        exportToHtml(exportData)
        break
      case 'md':
        exportToMarkdown(exportData)
        break
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className={cn(
            'relative flex h-full flex-col items-center justify-center bg-sand-100 p-4 transition-all duration-500 md:p-8',
            isExpanded ? 'fixed inset-0 z-50 w-full' : 'relative w-full'
          )}
        >
          {/* Background Pattern (Subtle Texture) */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'radial-gradient(#1A3C30 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Floating Toolbar (Action Island) */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute right-6 top-6 z-20 flex items-center gap-1 rounded-full border border-sand-200 bg-white/80 p-1.5 shadow-sm backdrop-blur-md"
          >
            {/* View/Edit Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 rounded-full text-verity-700 hover:bg-sand-200 hover:text-verity-900',
                mode === 'edit' && 'bg-sand-300 text-verity-950'
              )}
              onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
              title={mode === 'view' ? 'Switch to Edit' : 'Switch to Read'}
            >
              {mode === 'view' ? (
                <Edit2 className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            {/* Copy */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-verity-700 hover:bg-sand-200 hover:text-verity-900"
              onClick={handleCopy}
              title="Copy to Clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-verity-700 hover:bg-sand-200 hover:text-verity-900"
                  title="Exportar documento"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-lg border-sand-200 bg-white shadow-lg"
              >
                <DropdownMenuItem
                  onClick={() => handleExport('txt')}
                  className="flex cursor-pointer items-center gap-2 hover:bg-sand-100"
                >
                  <File className="h-4 w-4" />
                  <span>Texto (.txt)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport('md')}
                  className="flex cursor-pointer items-center gap-2 hover:bg-sand-100"
                >
                  <FileText className="h-4 w-4" />
                  <span>Markdown (.md)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport('html')}
                  className="flex cursor-pointer items-center gap-2 hover:bg-sand-100"
                >
                  <FileCode className="h-4 w-4" />
                  <span>HTML (.html)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="mx-1 h-4 w-px bg-sand-300" />

            {/* Expand */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-verity-700 hover:bg-sand-200 hover:text-verity-900"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand Focus'}
            >
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>

            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-verity-700 hover:bg-error-50 hover:text-error-600"
              onClick={closeCanvas}
              title="Close Canvas"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* The Paper (Canvas Surface) */}
          <motion.div
            layout
            className="relative flex h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl shadow-verity-900/10 ring-1 ring-black/5"
          >
            {/* Document Header */}
            <div className="flex-none px-8 pb-6 pt-10">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-verity-400">
                <span>Document</span>
                <span className="text-sand-300">•</span>
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
                {mode !== 'edit' && (
                  <>
                    <span className="text-sand-300">•</span>
                    <span className="flex items-center gap-1 text-verity-600">
                      <Lock className="mb-0.5 h-3 w-3" />
                      Read-only
                    </span>
                  </>
                )}
              </div>
              <h1 className="font-display text-3xl font-bold leading-tight text-verity-900 md:text-4xl">
                {title || 'Untitled Artifact'}
              </h1>
            </div>

            {/* Content Editor/Viewer */}
            <div className="flex-1 overflow-hidden">
              {mode === 'edit' ? (
                <RichEditor
                  content={content || ''}
                  onChange={updateContent}
                  placeholder="Comece a escrever seu documento..."
                  className="h-full"
                />
              ) : (
                <div className="h-full overflow-y-auto px-8 pb-10">
                  <div className="prose-verity prose max-w-none font-display">
                    <MarkdownRenderer classname="prose-lg text-verity-800 leading-relaxed font-display">
                      {content || ''}
                    </MarkdownRenderer>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Metadata */}
            <div className="flex flex-none items-center justify-between border-t border-sand-100 bg-sand-50/50 px-6 py-3 font-mono text-xs font-medium text-verity-500">
              <div className="flex items-center gap-4">
                <span>{content?.length || 0} chars</span>
                <span>{content?.split(/\s+/).length || 0} words</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-verity-400" />
                <span>Saved</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
