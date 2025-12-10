'use client'

import { X, FileSearch, FileEdit, Wrench } from 'lucide-react'

export interface SelectedToolData {
  id: string
  name: string
}

interface SelectedToolProps {
  tool: SelectedToolData | null
  onRemove: () => void
}

const TOOL_ICONS: Record<string, typeof Wrench> = {
  'analyze-cpr': FileSearch,
  'draft-cpr': FileEdit
}

export function SelectedTool({ tool, onRemove }: SelectedToolProps) {
  if (!tool) return null

  const Icon = TOOL_ICONS[tool.id] || Wrench

  return (
    <div className="mb-2">
      <div className="inline-flex items-center gap-2 rounded-lg bg-gemini-blue/10 px-3 py-2 text-sm">
        <div className="text-gemini-blue">
          <Icon className="h-4 w-4" />
        </div>
        <span className="font-medium text-gemini-blue">{tool.name}</span>
        <button
          onClick={onRemove}
          className="flex min-h-[24px] min-w-[24px] items-center justify-center rounded p-1 text-gemini-blue transition-colors hover:bg-gemini-blue/20"
          aria-label={`Remover ferramenta ${tool.name}`}
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
