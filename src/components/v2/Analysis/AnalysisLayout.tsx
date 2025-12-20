'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, List, Maximize2, Minimize2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AnalysisLayoutProps {
  documentName: string
  documentPanel: React.ReactNode
  analysisPanel: React.ReactNode
}

export function AnalysisLayout({
  documentName,
  documentPanel,
  analysisPanel
}: AnalysisLayoutProps) {
  const router = useRouter()
  const [activePanel, setActivePanel] = useState<'document' | 'analysis'>(
    'analysis'
  )
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="flex h-screen w-screen flex-col bg-verde-50">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-verde-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-verde-700 hover:bg-verde-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-verde-600" />
            <h1 className="max-w-md truncate font-semibold text-verde-900">
              {documentName}
            </h1>
          </div>
        </div>

        {/* Toggle de Painel (Mobile) */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant={activePanel === 'document' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel('document')}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant={activePanel === 'analysis' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActivePanel('analysis')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Fullscreen Toggle (Desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-verde-700 hover:bg-verde-100"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex flex-1 overflow-hidden">
        {/* Painel do Documento */}
        <motion.div
          className={cn(
            'overflow-hidden border-r border-verde-200 bg-gray-100',
            'hidden md:block',
            isFullscreen ? 'w-0' : 'w-1/2'
          )}
          animate={{ width: isFullscreen ? 0 : '50%' }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full overflow-auto p-4">{documentPanel}</div>
        </motion.div>

        {/* Painel Mobile do Documento */}
        {activePanel === 'document' && (
          <div className="flex-1 overflow-auto bg-gray-100 p-4 md:hidden">
            {documentPanel}
          </div>
        )}

        {/* Painel de Análise */}
        <motion.div
          className={cn(
            'overflow-hidden bg-white',
            'hidden md:block',
            isFullscreen ? 'w-full' : 'w-1/2'
          )}
          animate={{ width: isFullscreen ? '100%' : '50%' }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full overflow-auto p-6">{analysisPanel}</div>
        </motion.div>

        {/* Painel Mobile de Análise */}
        {activePanel === 'analysis' && (
          <div className="flex-1 overflow-auto bg-white p-4 md:hidden">
            {analysisPanel}
          </div>
        )}
      </div>
    </div>
  )
}
