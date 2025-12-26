
import { motion, AnimatePresence } from 'framer-motion'
import { AgentCommand, AgentMention } from './CommandRegistry'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface SuggestionListProps {
  items: (AgentCommand | AgentMention)[]
  selectedIndex: number
  onSelect: (item: AgentCommand | AgentMention) => void
  position: { top: number; left: number } | null
  isVisible: boolean
  trigger: '/' | '@'
}

export function SuggestionList({
  items,
  selectedIndex,
  onSelect,
  position,
  isVisible,
  trigger,
}: SuggestionListProps) {
  const listRef = useRef<HTMLUListElement>(null)

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current && items.length > 0) {
      const activeElement = listRef.current.children[selectedIndex] as HTMLElement
      if (activeElement) {
        activeElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, items])

  if (!isVisible || !position || items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.ul
        ref={listRef}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="absolute z-50 flex max-h-[280px] w-64 flex-col overflow-y-auto rounded-lg border border-verity-200 bg-white shadow-xl"
        style={{
          top: position.top - 10, // Slight offset to be above
          left: position.left,
          maxHeight: '300px',
        }}
        role="listbox"
        id="suggestion-list"
        aria-label={trigger === '/' ? 'Comandos disponíveis' : 'Menções disponíveis'}
      >
        <li className="bg-verity-50 px-3 py-1.5 text-xs font-semibold text-verity-700">
          {trigger === '/' ? 'COMANDOS' : 'MENÇÕES SUGERIDAS'}
        </li>
        {items.map((item, index) => {
          const Icon = item.type === 'slash' ? item.icon : null
          const isSelected = index === selectedIndex

          return (
            <li
              key={item.id}
              id={`suggestion-option-${index}`}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(item)}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                isSelected
                  ? 'bg-verity-100 text-verity-900'
                  : 'text-gray-800 hover:bg-gray-50'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md border',
                  isSelected
                    ? 'border-verity-300 bg-white text-verity-700'
                    : 'border-gray-200 bg-gray-50 text-gray-600'
                )}
              >
                {item.type === 'slash' ? (
                  <Icon className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">@</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-gray-950">{item.label}</span>
                <span className="text-xs text-gray-700">{item.description}</span>
              </div>
            </li>
          )
        })}
      </motion.ul>
    </AnimatePresence>
  )
}
