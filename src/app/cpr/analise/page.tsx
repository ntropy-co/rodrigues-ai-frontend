'use client'

/**
 * CPR Analysis Page
 *
 * Complete CPR document analysis workflow with:
 * - Document upload
 * - Chat interface for workflow interaction
 * - Compliance verification display
 * - Risk analysis display
 * - Extracted data summary
 * - Option to proceed to CPR creation
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Upload,
  FileText,
  ArrowLeft,
  ArrowRight,
  Send,
  Loader2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  User,
  Building2,
  Package,
  Calendar,
  DollarSign,
  Shield,
  Bot,
  X
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  ComplianceVerifier,
  type ExtractedData
} from '@/components/v2/Compliance'
import {
  RiskCalculator,
  type RiskCalculatorData
} from '@/components/v2/RiskCalculator/RiskCalculator'
import {
  useCPRAnalysis,
  type WorkflowMessage,
  type ComplianceResult,
  type RiskResult
} from '@/hooks/useCPRAnalysis'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

type AnalysisStep = 'upload' | 'analysis' | 'results'

// =============================================================================
// Sub-components
// =============================================================================

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void
  file: File | null
  isUploading: boolean
}

function FileUploadArea({
  onFileSelect,
  file,
  isUploading
}: FileUploadAreaProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0])
    }
  }

  return (
    <div
      className={cn(
        'relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all',
        dragActive
          ? 'border-verity-500 bg-verity-50'
          : 'border-verity-200 hover:border-verity-400 hover:bg-verity-50/50',
        isUploading && 'pointer-events-none opacity-70'
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full',
            file
              ? 'bg-verity-100 text-verity-600'
              : 'bg-verity-100 text-verity-600'
          )}
        >
          {isUploading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : file ? (
            <FileText className="h-8 w-8" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-verity-900">
            {file ? file.name : 'Arraste seu documento aqui'}
          </h3>
          <p className="text-verity-600">
            {file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : 'ou clique para selecionar do computador'}
          </p>
        </div>

        {!file && (
          <p className="text-sm text-verity-400">
            PDF, DOC, DOCX, TXT ou imagens (max. 10MB)
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  )
}

interface ChatMessageProps {
  message: WorkflowMessage
}

function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-verity-100">
          <Bot className="h-4 w-4 text-verity-600" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser ? 'bg-verity-600 text-white' : 'bg-verity-100 text-verity-900'
        )}
      >
        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
        <p
          className={cn(
            'mt-1 text-xs',
            isUser ? 'text-verity-200' : 'text-verity-500'
          )}
        >
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-verity-600">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </motion.div>
  )
}

interface ChatInterfaceProps {
  messages: WorkflowMessage[]
  isLoading: boolean
  isWaitingInput: boolean
  onSendMessage: (message: string) => void
}

function ChatInterface({
  messages,
  isLoading,
  isWaitingInput,
  onSendMessage
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-verity-200 bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-verity-100">
                <Bot className="h-4 w-4 text-verity-600" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-verity-100 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-verity-600" />
                <span className="text-sm text-verity-600">Processando...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t border-verity-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isWaitingInput ? 'Digite sua resposta...' : 'Aguardando...'
            }
            disabled={!isWaitingInput || isLoading}
            className="flex-1 rounded-xl border border-verity-200 px-4 py-2 text-verity-900 placeholder:text-verity-400 focus:border-verity-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-verity-50"
          />
          <Button
            type="submit"
            disabled={!input.trim() || !isWaitingInput || isLoading}
            className="bg-verity-600 hover:bg-verity-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

interface ExtractedDataSummaryProps {
  data: ExtractedData
}

function ExtractedDataSummary({ data }: ExtractedDataSummaryProps) {
  const sections = [
    {
      title: 'Emitente',
      icon: User,
      items: data.emitente
        ? [
            { label: 'Nome', value: data.emitente.nome },
            { label: 'CPF/CNPJ', value: data.emitente.cpf_cnpj },
            { label: 'Endereco', value: data.emitente.endereco }
          ]
        : []
    },
    {
      title: 'Credor',
      icon: Building2,
      items: data.credor
        ? [
            { label: 'Nome', value: data.credor.nome },
            { label: 'CPF/CNPJ', value: data.credor.cpf_cnpj },
            { label: 'Endereco', value: data.credor.endereco }
          ]
        : []
    },
    {
      title: 'Produto',
      icon: Package,
      items: data.produto
        ? [
            { label: 'Descricao', value: data.produto.descricao },
            {
              label: 'Quantidade',
              value: data.produto.quantidade
                ? `${data.produto.quantidade} ${data.produto.unidade || ''}`
                : undefined
            },
            { label: 'Safra', value: data.produto.safra }
          ]
        : []
    },
    {
      title: 'Valores',
      icon: DollarSign,
      items: data.valores
        ? [
            {
              label: 'Preco Unitario',
              value: data.valores.preco_unitario
                ? `R$ ${data.valores.preco_unitario.toLocaleString('pt-BR')}`
                : undefined
            },
            {
              label: 'Valor Total',
              value: data.valores.valor_total
                ? `R$ ${data.valores.valor_total.toLocaleString('pt-BR')}`
                : undefined
            }
          ]
        : []
    },
    {
      title: 'Datas',
      icon: Calendar,
      items: data.datas
        ? [
            { label: 'Emissao', value: data.datas.emissao },
            { label: 'Vencimento', value: data.datas.vencimento },
            { label: 'Entrega', value: data.datas.entrega }
          ]
        : []
    },
    {
      title: 'Garantias',
      icon: Shield,
      items: data.garantias
        ? [
            { label: 'Tipo', value: data.garantias.tipo },
            { label: 'Descricao', value: data.garantias.descricao },
            {
              label: 'Valor',
              value: data.garantias.valor
                ? `R$ ${data.garantias.valor.toLocaleString('pt-BR')}`
                : undefined
            }
          ]
        : []
    }
  ]

  return (
    <div className="rounded-xl border border-verity-200 bg-white">
      <div className="flex items-center gap-2 border-b border-verity-200 px-4 py-3">
        <FileCheck className="h-5 w-5 text-verity-600" />
        <h3 className="font-semibold text-verity-900">Dados Extraidos</h3>
      </div>
      <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon
          const hasData = section.items.some((item) => item.value)

          if (!hasData) return null

          return (
            <div key={section.title} className="rounded-lg bg-verity-50 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 text-verity-600" />
                <h4 className="text-sm font-semibold text-verity-800">
                  {section.title}
                </h4>
              </div>
              <div className="space-y-1">
                {section.items.map(
                  (item) =>
                    item.value && (
                      <div key={item.label} className="text-sm">
                        <span className="text-verity-500">{item.label}:</span>{' '}
                        <span className="text-verity-900">{item.value}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// =============================================================================
// Helper Functions
// =============================================================================

function mapComplianceResult(result: ComplianceResult) {
  return {
    score: result.score,
    grade: result.grade,
    requirements: result.requirements.map((req) => ({
      ...req,
      category: 'formalizacao' as const
    })),
    recommendations: result.recommendations
  }
}

function mapRiskResult(result: RiskResult): RiskCalculatorData {
  const levelMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    baixo: 'low',
    medio: 'medium',
    alto: 'high'
  }

  return {
    score: result.overall_score,
    level: levelMap[result.risk_level] || 'medium',
    factors: result.factors.map((f) => ({
      id: f.id,
      label: f.name,
      impact: f.impact,
      weight: f.weight * 100
    })),
    recommendation: result.recommendations.join(' '),
    calculatedAt: new Date()
  }
}

// =============================================================================
// Main Component
// =============================================================================

export default function CPRAnalysisPage() {
  const router = useRouter()

  // Analysis hook
  const {
    state: workflowState,
    messages,
    isLoading,
    error,
    startAnalysis,
    continueAnalysis,
    reset
  } = useCPRAnalysis()

  // Local state
  const [step, setStep] = useState<AnalysisStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Tipo de arquivo nao permitido')
      return
    }

    if (selectedFile.size > maxSize) {
      toast.error('Arquivo muito grande (max. 10MB)')
      return
    }

    setFile(selectedFile)
  }, [])

  // Start analysis workflow
  const handleStartAnalysis = useCallback(async () => {
    if (!file) {
      toast.error('Selecione um arquivo primeiro')
      return
    }

    setIsUploading(true)
    setStep('analysis')

    try {
      // Start the analysis workflow
      const result = await startAnalysis()

      if (result) {
        toast.success('Analise iniciada!')

        // Simulate sending the document text (in production, this would be actual OCR/parsing)
        // For now we'll send a message indicating the file was uploaded
        setTimeout(async () => {
          await continueAnalysis(`Documento enviado: ${file.name}`)
        }, 1000)
      }
    } catch {
      toast.error('Erro ao iniciar analise')
      setStep('upload')
    } finally {
      setIsUploading(false)
    }
  }, [file, startAnalysis, continueAnalysis])

  // Handle chat message
  const handleSendMessage = useCallback(
    async (message: string) => {
      await continueAnalysis(message)

      // Check if analysis is complete
      if (workflowState?.complianceResult && workflowState?.riskResult) {
        setStep('results')
      }
    },
    [continueAnalysis, workflowState]
  )

  // Reset everything
  const handleReset = useCallback(() => {
    reset()
    setFile(null)
    setStep('upload')
  }, [reset])

  // Navigate to CPR creation with extracted data
  const handleProceedToCreation = useCallback(() => {
    if (workflowState?.extractedData) {
      // Store extracted data in session storage for the wizard
      sessionStorage.setItem(
        'cpr_extracted_data',
        JSON.stringify(workflowState.extractedData)
      )
      router.push('/cpr/wizard')
    }
  }, [router, workflowState?.extractedData])

  // Check if we have results to show
  const hasResults =
    workflowState?.complianceResult || workflowState?.riskResult

  return (
    <div className="min-h-screen bg-verity-50/50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-full p-2 text-verity-700 transition-colors hover:bg-verity-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-verity-950 md:text-3xl">
                Analise de CPR
              </h1>
              <p className="text-verity-700">
                Analise completa com verificacao de compliance e risco
              </p>
            </div>
          </div>

          {step !== 'upload' && (
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-verity-200 text-verity-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Nova Analise
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-4">
          {[
            { step: 'upload', label: 'Upload', icon: Upload },
            { step: 'analysis', label: 'Analise', icon: Bot },
            { step: 'results', label: 'Resultados', icon: CheckCircle }
          ].map((item, index) => {
            const Icon = item.icon
            const isCurrent = step === item.step
            const isPast =
              (step === 'analysis' && item.step === 'upload') ||
              (step === 'results' && item.step !== 'results')

            return (
              <div key={item.step} className="flex items-center gap-2">
                {index > 0 && (
                  <div
                    className={cn(
                      'h-0.5 w-8 md:w-16',
                      isPast ? 'bg-verity-500' : 'bg-verity-200'
                    )}
                  />
                )}
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    isCurrent && 'bg-verity-600 text-white',
                    isPast && 'bg-verity-200 text-verity-700',
                    !isCurrent && !isPast && 'bg-verity-100 text-verity-500'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="border-verity-200 bg-white/80">
                <CardContent className="flex flex-col items-center space-y-6 p-8">
                  <FileUploadArea
                    file={file}
                    onFileSelect={handleFileSelect}
                    isUploading={isUploading}
                  />

                  {file && (
                    <div className="flex gap-4">
                      <Button
                        variant="outline"
                        onClick={() => setFile(null)}
                        className="border-verity-200 text-verity-700"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Trocar arquivo
                      </Button>
                      <Button
                        onClick={handleStartAnalysis}
                        disabled={isUploading}
                        className="bg-verity-600 px-8 text-white hover:bg-verity-700"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Iniciando...
                          </>
                        ) : (
                          <>
                            Iniciar Analise
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-verity-200 bg-white">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-full bg-verity-100 p-2">
                      <FileCheck className="h-5 w-5 text-verity-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-verity-900">
                        Extracao de Dados
                      </h3>
                      <p className="text-sm text-verity-600">
                        IA extrai automaticamente todas as informacoes do
                        documento
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-verity-200 bg-white">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-full bg-verity-100 p-2">
                      <CheckCircle className="h-5 w-5 text-verity-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-verity-900">
                        Compliance Lei 8.929
                      </h3>
                      <p className="text-sm text-verity-600">
                        Verificacao completa dos requisitos legais da CPR
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-verity-200 bg-white">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="rounded-full bg-verity-100 p-2">
                      <AlertTriangle className="h-5 w-5 text-verity-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-verity-900">
                        Analise de Risco
                      </h3>
                      <p className="text-sm text-verity-600">
                        Avaliacao de fatores de risco e recomendacoes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {step === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-6 lg:grid-cols-2"
            >
              {/* Chat Interface */}
              <div className="h-[500px] lg:h-[600px]">
                <ChatInterface
                  messages={messages}
                  isLoading={isLoading}
                  isWaitingInput={workflowState?.isWaitingInput ?? false}
                  onSendMessage={handleSendMessage}
                />
              </div>

              {/* Side Panel with current results */}
              <div className="space-y-4">
                {/* Current Step */}
                <Card className="border-verity-200 bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-verity-100">
                        <Loader2 className="h-5 w-5 animate-spin text-verity-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-verity-900">
                          {workflowState?.currentStep || 'Processando'}
                        </h3>
                        <p className="text-sm text-verity-600">
                          {workflowState?.isWaitingInput
                            ? 'Aguardando sua resposta'
                            : 'Analisando documento...'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* File Info */}
                {file && (
                  <Card className="border-verity-200 bg-white">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-verity-500" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-verity-900">
                            {file.name}
                          </p>
                          <p className="text-sm text-verity-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Partial Results */}
                {workflowState?.extractedData && (
                  <ExtractedDataSummary data={workflowState.extractedData} />
                )}

                {/* View Results Button */}
                {hasResults && (
                  <Button
                    onClick={() => setStep('results')}
                    className="w-full bg-verity-600 hover:bg-verity-700"
                  >
                    Ver Resultados Completos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          )}

          {step === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Extracted Data */}
              {workflowState?.extractedData && (
                <ExtractedDataSummary data={workflowState.extractedData} />
              )}

              {/* Compliance & Risk Side by Side */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Compliance Verifier */}
                {workflowState?.complianceResult && (
                  <ComplianceVerifier
                    complianceResult={mapComplianceResult(
                      workflowState.complianceResult
                    )}
                    extractedData={workflowState.extractedData}
                    title="Verificacao de Compliance - Lei 8.929/94"
                  />
                )}

                {/* Risk Calculator */}
                {workflowState?.riskResult && (
                  <RiskCalculator
                    data={mapRiskResult(workflowState.riskResult)}
                    title="Analise de Risco"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="border-verity-200 text-verity-700"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Nova Analise
                </Button>

                {workflowState?.extractedData && (
                  <Button
                    onClick={handleProceedToCreation}
                    className="bg-verity-600 hover:bg-verity-700"
                  >
                    Criar CPR com estes dados
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => toast.info('Em breve: exportar relatorio')}
                  className="border-verity-200 text-verity-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar Relatorio
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
