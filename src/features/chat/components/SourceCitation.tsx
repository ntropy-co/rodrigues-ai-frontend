import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, ChevronDown, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ReferenceData } from '../types'

interface SourceCitationProps {
  references?: ReferenceData[]
}

export function SourceCitation({ references }: SourceCitationProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!references || references.length === 0) return null

  // Flatten all references from all ReferenceData objects
  const allSources = references.flatMap((refData) => refData.references)

  if (allSources.length === 0) return null

  return (
    <div className="mt-4 border-t border-verity-100 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs font-medium text-verity-700 transition-colors hover:text-verity-800"
      >
        <BookOpen className="h-3.5 w-3.5" />
        <span>Fontes ({allSources.length})</span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-2 pt-3">
              {allSources.map((source, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-lg border border-verity-200 bg-verity-50/50 p-3 transition-colors hover:bg-verity-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-semibold text-verity-900 decoration-verity-400 underline-offset-2 group-hover:underline">
                        {source.name || 'Documento sem nome'}
                      </h4>
                      {source.content && (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-verity-700/80">
                          {source.content}
                        </p>
                      )}
                    </div>
                    {/* Placeholder for link if source has URL/metadata */}
                    <ExternalLink className="h-3 w-3 flex-shrink-0 text-verity-400 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
