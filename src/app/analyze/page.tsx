'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InternalHeader } from '@/components/v2/Header/InternalHeader'
import { Card, CardContent } from '@/components/ui/card'
import { AnalysisResult } from '@/components/v2/Analysis/AnalysisResult'
import { AnalysisResultData } from '@/types/analysis'
import { AgentStateIndicator } from '@/components/v2/ChatArea/AgentStateIndicator'
// import { useAuth } from '@/hooks/useAuthHook'

// Mock Data for demonstration
const MOCK_ANALYSIS_RESULT: AnalysisResultData = {
  documentId: 'doc_123',
  status: 'attention',
  score: 75,
  processedAt: new Date().toISOString(),
  issues: [
    {
      type: 'critical',
      field: 'Vencimento',
      message: 'Data de vencimento anterior à data de emissão.',
      location: 'Cláusula 4.1',
      suggestion: 'Corrigir para uma data futura (ex: 20/12/2026)'
    },
    {
      type: 'alert',
      field: 'Produto',
      message: 'Descrição do produto pouco detalhada.',
      suggestion:
        'Especificar tipo, safra e qualidade (ex: Soja em grãos, Tipo Exportação, Safra 24/25)'
    },
    {
      type: 'alert',
      field: 'Foro',
      message: 'Foro de eleição diferente do local de emissão.',
      location: 'Cláusula 12'
    }
  ],
  suggestions: [
    {
      type: 'improvement',
      field: 'Qualificação',
      message:
        'Adicionar e-mail e telefone das partes para facilitar comunicação.',
      current: 'Nome, CPF e Endereço',
      suggested: 'Nome, CPF, Endereço, E-mail e Telefone'
    },
    {
      type: 'improvement',
      field: 'Garantias',
      message: 'Considerar incluir avalista para fortalecer a garantia.'
    }
  ]
}

export default function AnalysisPage() {
  // const router = useRouter()
  // const { user } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<
    'idle' | 'uploading' | 'analyzing' | 'done'
  >('idle')
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      alert('Por favor, selecione um arquivo PDF.')
      return
    }
    setFile(selectedFile)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const startAnalysis = async () => {
    if (!file) return

    setStatus('uploading')

    // Simulate upload
    let p = 0
    const interval = setInterval(() => {
      p += 10
      setProgress(p)
      if (p >= 100) {
        clearInterval(interval)
        setStatus('analyzing')
        // Simulate analysis delay
        setTimeout(() => {
          setStatus('done')
        }, 5000) // 5 seconds of "analysis"
      }
    }, 200)
  }

  const reset = () => {
    setFile(null)
    setStatus('idle')
    setProgress(0)
  }

  return (
    <div className="min-h-screen bg-verity-50/50">
      <InternalHeader
        title="Analise de CPR"
        subtitle="Envie o documento para identificar riscos e melhorias."
        backHref="/chat"
        containerClassName="max-w-5xl"
      />
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8 md:px-12 md:py-12">
        <AnimatePresence mode="wait">
          {status === 'idle' || status === 'uploading' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="upload-area"
            >
              <Card className="border-2 border-dashed border-verity-200 bg-white/80">
                <CardContent className="flex flex-col items-center justify-center space-y-6 p-12 text-center">
                  <div
                    className={`w-full max-w-xl cursor-pointer rounded-2xl border-2 border-dashed p-12 transition-colors ${dragActive ? 'border-verity-500 bg-verity-50' : 'border-verity-100 hover:border-verity-300 hover:bg-verity-50/50'} `}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragActive(true)
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verity-100 text-verity-600">
                        {file ? (
                          <FileText className="h-8 w-8" />
                        ) : (
                          <Upload className="h-8 w-8" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-verity-900">
                          {file ? file.name : 'Arraste seu PDF aqui'}
                        </h3>
                        <p className="text-verity-600">
                          {file
                            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                            : 'ou clique para selecionar do computador'}
                        </p>
                      </div>

                      {!file && (
                        <p className="text-sm text-verity-400">
                          Apenas arquivos PDF são aceitos no momento.
                        </p>
                      )}
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) =>
                      e.target.files?.[0] && handleFileSelect(e.target.files[0])
                    }
                  />

                  {status === 'uploading' && (
                    <div className="w-full max-w-md space-y-2">
                      <div className="flex justify-between text-xs text-verity-700">
                        <span>Enviando documento...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-verity-100">
                        <div
                          className="h-full bg-verity-500 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {file && status === 'idle' && (
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setFile(null)}
                        className="border-verity-200 text-verity-700"
                      >
                        Trocar arquivo
                      </Button>
                      <Button
                        onClick={startAnalysis}
                        className="bg-verity-600 px-8 text-white hover:bg-verity-700"
                      >
                        Analisar CPR
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : status === 'analyzing' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              key="analyzing-state"
              className="flex flex-col items-center justify-center space-y-8 py-20"
            >
              <div className="relative">
                <div className="absolute inset-0 animate-pulse-soft bg-verity-400 opacity-20 blur-2xl" />
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl">
                  <Loader2 className="h-10 w-10 animate-spin text-verity-600" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold text-verity-900">
                  Analisando seu documento
                </h2>
                <p className="mx-auto max-w-md text-verity-600">
                  Nossa IA está verificando cláusulas, datas, conformidade legal
                  e consistência dos dados.
                </p>
              </div>

              {/* Steps visualization */}
              <div className="w-full max-w-md rounded-xl border border-verity-100 bg-white p-6 shadow-sm">
                <AgentStateIndicator initialState="analyzing" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key="results"
            >
              <div className="mb-4 flex justify-end">
                <Button
                  onClick={reset}
                  variant="ghost"
                  className="text-verity-600 hover:bg-verity-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Nova Análise
                </Button>
              </div>
              <AnalysisResult
                data={MOCK_ANALYSIS_RESULT}
                onExportPDF={() =>
                  alert('Download do PDF iniciado (simulação).')
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
