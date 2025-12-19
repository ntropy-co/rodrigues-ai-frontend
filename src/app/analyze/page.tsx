'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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
    <div className="min-h-screen bg-verde-50/50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full p-2 text-verde-700 transition-colors hover:bg-verde-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-3xl font-bold text-verde-950">
              Análise de CPR
            </h1>
            <p className="text-verde-700">
              Faça upload do documento para identificar erros e sugestões de
              melhoria.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' || status === 'uploading' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              key="upload-area"
            >
              <Card className="border-2 border-dashed border-verde-200 bg-white/80">
                <CardContent className="flex flex-col items-center justify-center space-y-6 p-12 text-center">
                  <div
                    className={`w-full max-w-xl cursor-pointer rounded-2xl border-2 border-dashed p-12 transition-colors ${dragActive ? 'border-verde-500 bg-verde-50' : 'border-verde-100 hover:border-verde-300 hover:bg-verde-50/50'} `}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setDragActive(true)
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-verde-100 text-verde-600">
                        {file ? (
                          <FileText className="h-8 w-8" />
                        ) : (
                          <Upload className="h-8 w-8" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-verde-900">
                          {file ? file.name : 'Arraste seu PDF aqui'}
                        </h3>
                        <p className="text-verde-600">
                          {file
                            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                            : 'ou clique para selecionar do computador'}
                        </p>
                      </div>

                      {!file && (
                        <p className="text-sm text-verde-400">
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
                      <div className="flex justify-between text-xs text-verde-700">
                        <span>Enviando documento...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-verde-100">
                        <div
                          className="h-full bg-verde-500 transition-all duration-300"
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
                        className="border-verde-200 text-verde-700"
                      >
                        Trocar arquivo
                      </Button>
                      <Button
                        onClick={startAnalysis}
                        className="bg-verde-600 px-8 text-white hover:bg-verde-700"
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
                <div className="absolute inset-0 animate-pulse-soft bg-verde-400 opacity-20 blur-2xl" />
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-2xl bg-white shadow-xl">
                  <Loader2 className="h-10 w-10 animate-spin text-verde-600" />
                </div>
              </div>

              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-semibold text-verde-900">
                  Analisando seu documento
                </h2>
                <p className="mx-auto max-w-md text-verde-600">
                  Nossa IA está verificando cláusulas, datas, conformidade legal
                  e consistência dos dados.
                </p>
              </div>

              {/* Steps visualization */}
              <div className="w-full max-w-md rounded-xl border border-verde-100 bg-white p-6 shadow-sm">
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
                  className="text-verde-600 hover:bg-verde-50"
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
