import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, BrainCircuit } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThinkingBlockProps {
  content: string
  isStreaming?: boolean
}

export function ThinkingBlock({
  content,
  isStreaming = false
}: ThinkingBlockProps) {
  const [isOpen, setIsOpen] = useState(true) // Start open if it's fresh, or user preference

  // Auto-expand if streaming data is active (simulated logic)
  // In a real scenario, we might want it to collapse after streaming finishes.

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-verde-200 bg-verde-50/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-verde-800 transition-colors hover:bg-verde-100/50"
      >
        <div className="flex items-center gap-2">
          <BrainCircuit
            className={cn(
              'h-4 w-4',
              isStreaming && 'animate-pulse text-verde-600'
            )}
          />
          <span>Processo de Raciocínio</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-verde-600" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="border-t border-verde-100/50 px-4 pb-4 pt-0 font-mono text-sm italic text-verde-700/80">
              <div className="whitespace-pre-wrap pt-2">{content}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
