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
          <h2 className="text-xl font-semibold text-gemini-gray-900">
            Ferramentas
          </h2>
          <button
            onClick={onClose}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors hover-hover:bg-gemini-gray-100"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5 text-gemini-gray-600" />
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
                className="flex w-full items-start gap-4 rounded-xl border border-gemini-gray-200 bg-gemini-gray-50 p-4 text-left transition-all active:scale-[0.98] hover-hover:border-gemini-blue hover-hover:bg-gemini-blue/5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gemini-blue/10">
                  <Icon className="h-5 w-5 text-gemini-blue" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gemini-gray-900">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gemini-gray-600">
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
            className="rounded-lg border border-gemini-gray-300 px-4 py-2 text-gemini-gray-700 transition-colors hover-hover:bg-gemini-gray-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
