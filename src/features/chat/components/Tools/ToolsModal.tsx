'use client'

import { X, FileSearch, FileEdit } from 'lucide-react'

interface ToolsModalProps {
  isOpen: boolean
  onClose: () => void
  onToolSelect: (toolId: string, toolName: string) => void
}

const AVAILABLE_TOOLS = [
  {
    id: 'analyze-cpr',
    name: 'Analisar CPR',
    description: 'Analisa documentos CPR',
    icon: FileSearch
  },
  {
    id: 'draft-cpr',
    name: 'Redigir CPR',
    description: 'Auxilia na redação de CPR',
    icon: FileEdit
  }
]

export function ToolsModal({ isOpen, onClose, onToolSelect }: ToolsModalProps) {
  if (!isOpen) return null

  const handleToolClick = (toolId: string, toolName: string) => {
    onToolSelect(toolId, toolName)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-gemini-verity-900 text-xl font-semibold">
            Ferramentas
          </h2>
          <button
            onClick={onClose}
            className="hover-hover:bg-gemini-sand-200 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="text-gemini-verity-500 h-5 w-5" />
          </button>
        </div>

        {/* Tools List */}
        <div className="space-y-2">
          {AVAILABLE_TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.id, tool.name)}
                className="border-gemini-sand-300 bg-gemini-sand-50 hover-hover:border-gemini-blue hover-hover:bg-gemini-blue/5 flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all active:scale-[0.98]"
              >
                <div className="bg-gemini-blue/10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                  <Icon className="text-gemini-blue h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-gemini-verity-900 font-medium">
                    {tool.name}
                  </h3>
                  <p className="text-gemini-verity-500 text-sm">
                    {tool.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="border-gemini-sand-400 text-gemini-verity-600 hover-hover:bg-gemini-sand-50 rounded-lg border px-4 py-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
