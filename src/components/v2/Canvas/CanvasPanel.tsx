import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Maximize2, Minimize2, Edit2, Eye } from 'lucide-react'
import { useState } from 'react'
import { useCanvasStore } from '@/stores/useCanvasStore'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function CanvasPanel() {
  const { isOpen, content, title, mode, closeCanvas, setMode, updateContent } =
    useCanvasStore()

  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    if (content) {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            'flex h-full flex-col border-l border-verity-200 bg-white shadow-xl',
            isExpanded ? 'fixed inset-0 z-50 w-full' : 'relative w-full'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-verity-100 bg-verity-50/50 px-4 py-3">
            <h2 className="max-w-[200px] truncate font-display text-lg font-medium text-verity-900">
              {title || 'Artifact'}
            </h2>

            <div className="flex items-center gap-1">
              {/* Mode Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-verity-700 hover:bg-verity-100"
                onClick={() => setMode(mode === 'view' ? 'edit' : 'view')}
                title={mode === 'view' ? 'Edit Mode' : 'View Mode'}
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
                className="h-8 w-8 text-verity-700 hover:bg-verity-100"
                onClick={handleCopy}
                title="Copy content"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>

              {/* Expand/Collapse */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-verity-700 hover:bg-verity-100"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
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
                className="h-8 w-8 text-verity-700 hover:bg-verity-100 hover:text-red-600"
                onClick={closeCanvas}
                title="Close Canvas"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="scrollbar-thin scrollbar-thumb-verity-200 scrollbar-track-transparent flex-1 overflow-y-auto p-6">
            {mode === 'edit' ? (
              <textarea
                className="h-full w-full resize-none border-none bg-transparent p-0 font-mono text-sm leading-relaxed text-verity-900 outline-none focus:ring-0"
                value={content || ''}
                onChange={(e) => updateContent(e.target.value)}
                placeholder="Start typing..."
              />
            ) : (
              <div className="max-w-none">
                <MarkdownRenderer classname="prose-verde">
                  {content || ''}
                </MarkdownRenderer>
              </div>
            )}
          </div>

          {/* Footer (Optional status bar) */}
          <div className="flex justify-between border-t border-verity-100 bg-verity-50/30 px-4 py-2 text-xs text-verity-600">
            <span>{mode === 'edit' ? 'Editing...' : 'Read-only'}</span>
            <span>{content?.length || 0} chars</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
