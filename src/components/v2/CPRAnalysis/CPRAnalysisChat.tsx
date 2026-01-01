'use client'

/**
 * CPRAnalysisChat Component
 *
 * Chat interface for CPR document analysis workflow.
 * Integrates with the useCPRAnalysis hook for LangGraph workflow management.
 *
 * Features:
 * - Document upload support
 * - Workflow progress indicator
 * - Extracted data display
 * - Compliance verification results
 * - Risk analysis results
 */

import { useRef, useEffect, useState, useCallback, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowDown,
  ArrowUp,
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Scale,
  AlertTriangle,
  X,
  Paperclip
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import { ComplianceVerifier } from '@/components/v2/Compliance'
import {
  RiskCalculator,
  type RiskCalculatorData,
  type RiskLevel
} from '@/components/v2/RiskCalculator'
import {
  useCPRAnalysis,
  type WorkflowMessage,
  type ExtractedData,
  type ComplianceResult,
  type RiskResult
} from '@/hooks/useCPRAnalysis'

// =============================================================================
// Types
// =============================================================================

export interface CPRAnalysisChatProps {
  /** Custom class name */
  className?: string
  /** Callback when analysis is complete */
  onComplete?: (data: {
    extractedData?: ExtractedData
    complianceResult?: ComplianceResult
    riskResult?: RiskResult
  }) => void
  /** Initial session ID to resume */
  initialSessionId?: string
}

// Workflow step configuration for progress indicator
interface WorkflowStep {
  id: string
  label: string
  icon: typeof FileText
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'aguardando_documento', label: 'Documento', icon: Upload },
  { id: 'extraindo_dados', label: 'Extração', icon: FileText },
  { id: 'validando_dados', label: 'Validação', icon: FileCheck },
  { id: 'verificando_compliance', label: 'Compliance', icon: Scale },
  { id: 'calculando_risco', label: 'Risco', icon: AlertTriangle },
  { id: 'finalizando', label: 'Resultado', icon: CheckCircle2 }
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the current step index from step ID
 */
function getStepIndex(stepId: string): number {
  const index = WORKFLOW_STEPS.findIndex((step) => step.id === stepId)
  return index >= 0 ? index : 0
}

/**
 * Maps backend risk level to frontend RiskLevel type
 */
function mapRiskLevel(level: 'baixo' | 'medio' | 'alto'): RiskLevel {
  const mapping: Record<string, RiskLevel> = {
    baixo: 'low',
    medio: 'medium',
    alto: 'high'
  }
  return mapping[level] || 'medium'
}

/**
 * Transforms RiskResult to RiskCalculatorData format
 */
function transformRiskResult(result: RiskResult): RiskCalculatorData {
  return {
    score: result.overall_score,
    level: mapRiskLevel(result.risk_level),
    factors: result.factors.map((f) => ({
      id: f.id,
      label: f.name,
      impact: f.impact,
      weight: Math.round(f.weight * 100)
    })),
    recommendation: result.recommendations.join(' '),
    calculatedAt: new Date()
  }
}

// =============================================================================
// Sub-components
// =============================================================================

interface ProgressIndicatorProps {
  currentStep: string
}

function ProgressIndicator({ currentStep }: ProgressIndicatorProps) {
  const currentIndex = getStepIndex(currentStep)

  return (
    <div className="mb-4 px-2">
      <div className="flex items-center justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const Icon = step.icon
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Step circle */}
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isCompleted
                    ? '#2D5A45'
                    : isCurrent
                      ? '#3A6B54'
                      : '#E5E7EB'
                }}
                className={cn(
                  'relative z-10 flex h-8 w-8 items-center justify-center rounded-full',
                  isCompleted || isCurrent ? 'text-white' : 'text-verity-400'
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}

                {/* Pulse animation for current step */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-verity-600"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Connector line */}
              {index < WORKFLOW_STEPS.length - 1 && (
                <div className="mx-1 h-0.5 flex-1">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%'
                    }}
                    className="h-full bg-verity-600"
                    style={{ maxWidth: '100%' }}
                  />
                  <div className="-mt-0.5 h-0.5 w-full bg-gray-200" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Step labels */}
      <div className="mt-2 flex justify-between">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCurrent = index === getStepIndex(currentStep)
          return (
            <span
              key={step.id}
              className={cn(
                'text-center text-xs',
                isCurrent ? 'font-medium text-verity-900' : 'text-verity-500',
                index === WORKFLOW_STEPS.length - 1 ? 'text-right' : '',
                index === 0 ? 'text-left' : ''
              )}
              style={{ width: `${100 / WORKFLOW_STEPS.length}%` }}
            >
              {step.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

interface MessageBubbleProps {
  message: WorkflowMessage
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'mb-4 flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'relative max-w-[85%] rounded-2xl px-4 py-3 md:max-w-[75%]',
          isUser
            ? 'rounded-br-sm bg-gradient-to-br from-[#2D5A45] to-[#3A6B54] text-white shadow-lg'
            : 'rounded-bl-sm border border-verity-100 bg-white text-verity-950 shadow-md'
        )}
      >
        {/* Bubble tail */}
        <div
          className={cn(
            'absolute bottom-2 h-3 w-3 rotate-45',
            isUser
              ? '-right-1 bg-[#3A6B54]'
              : '-left-1 border-b border-l border-verity-100 bg-white'
          )}
        />

        {/* Content */}
        <div className="relative z-10">
          {isUser ? (
            <div className="whitespace-pre-wrap break-words text-sm">
              {message.content}
            </div>
          ) : (
            <div className="prose-verity prose prose-sm max-w-none">
              <MarkdownRenderer classname="prose-verde">
                {message.content}
              </MarkdownRenderer>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={cn(
            'mt-2 text-right text-xs',
            isUser ? 'text-white/70' : 'text-verity-400'
          )}
        >
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </motion.div>
  )
}

interface ExtractedDataCardProps {
  data: ExtractedData
}

function ExtractedDataCard({ data }: ExtractedDataCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-xl border border-verity-200 bg-gradient-to-br from-verity-50 to-white"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between border-b border-verity-100 bg-white/50 px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-verity-600" />
          <h4 className="font-semibold text-verity-900">Dados Extraidos</h4>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <ArrowDown className="h-4 w-4 text-verity-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="divide-y divide-verity-100"
          >
            {/* Emitente */}
            {data.emitente && (
              <div className="p-4">
                <h5 className="mb-2 text-xs font-medium uppercase text-verity-500">
                  Emitente
                </h5>
                <div className="grid gap-2 text-sm">
                  {data.emitente.nome && (
                    <div>
                      <span className="text-verity-500">Nome:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.emitente.nome}
                      </span>
                    </div>
                  )}
                  {data.emitente.cpf_cnpj && (
                    <div>
                      <span className="text-verity-500">CPF/CNPJ:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.emitente.cpf_cnpj}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Credor */}
            {data.credor && (
              <div className="p-4">
                <h5 className="mb-2 text-xs font-medium uppercase text-verity-500">
                  Credor
                </h5>
                <div className="grid gap-2 text-sm">
                  {data.credor.nome && (
                    <div>
                      <span className="text-verity-500">Nome:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.credor.nome}
                      </span>
                    </div>
                  )}
                  {data.credor.cpf_cnpj && (
                    <div>
                      <span className="text-verity-500">CPF/CNPJ:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.credor.cpf_cnpj}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Produto */}
            {data.produto && (
              <div className="p-4">
                <h5 className="mb-2 text-xs font-medium uppercase text-verity-500">
                  Produto
                </h5>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  {data.produto.descricao && (
                    <div>
                      <span className="text-verity-500">Produto:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.produto.descricao}
                      </span>
                    </div>
                  )}
                  {data.produto.quantidade && (
                    <div>
                      <span className="text-verity-500">Quantidade:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.produto.quantidade} {data.produto.unidade || ''}
                      </span>
                    </div>
                  )}
                  {data.produto.safra && (
                    <div>
                      <span className="text-verity-500">Safra:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.produto.safra}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Valores */}
            {data.valores && (
              <div className="p-4">
                <h5 className="mb-2 text-xs font-medium uppercase text-verity-500">
                  Valores
                </h5>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  {data.valores.preco_unitario && (
                    <div>
                      <span className="text-verity-500">Preco Unitario:</span>{' '}
                      <span className="font-medium text-verity-900">
                        R$ {data.valores.preco_unitario.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {data.valores.valor_total && (
                    <div>
                      <span className="text-verity-500">Valor Total:</span>{' '}
                      <span className="font-medium text-verity-900">
                        R$ {data.valores.valor_total.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Datas */}
            {data.datas && (
              <div className="p-4">
                <h5 className="mb-2 text-xs font-medium uppercase text-verity-500">
                  Datas
                </h5>
                <div className="grid gap-2 text-sm md:grid-cols-3">
                  {data.datas.emissao && (
                    <div>
                      <span className="text-verity-500">Emissao:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.datas.emissao}
                      </span>
                    </div>
                  )}
                  {data.datas.vencimento && (
                    <div>
                      <span className="text-verity-500">Vencimento:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.datas.vencimento}
                      </span>
                    </div>
                  )}
                  {data.datas.entrega && (
                    <div>
                      <span className="text-verity-500">Entrega:</span>{' '}
                      <span className="font-medium text-verity-900">
                        {data.datas.entrega}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function TypingIndicator() {
  return (
    <div className="mb-4 flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-verity-100 bg-white px-4 py-3 shadow-md">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-verity-400"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15
            }}
          />
        ))}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  onStart: () => void
  isLoading: boolean
}

function EmptyState({ onStart, isLoading }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <motion.div
        animate={{ y: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-verity-100 to-verity-50 shadow-lg"
      >
        <FileCheck className="h-10 w-10 text-verity-600" />
      </motion.div>

      <h3 className="mb-2 text-center text-lg font-semibold text-verity-900">
        Analise de CPR
      </h3>
      <p className="mb-6 max-w-sm text-center text-sm text-verity-600">
        Inicie uma analise completa de Cedula de Produto Rural. Verificaremos
        compliance com a Lei 8.929/94 e calcularemos o risco da operacao.
      </p>

      <Button
        onClick={onStart}
        disabled={isLoading}
        className="bg-verity-600 hover:bg-verity-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Iniciando...
          </>
        ) : (
          <>
            <FileCheck className="mr-2 h-4 w-4" />
            Iniciar Analise
          </>
        )}
      </Button>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function CPRAnalysisChat({
  className,
  onComplete,
  initialSessionId
}: CPRAnalysisChatProps) {
  const {
    state,
    messages,
    isLoading,
    error,
    startAnalysis,
    continueAnalysis,
    reset
  } = useCPRAnalysis()

  const containerRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [inputValue, setInputValue] = useState('')
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Auto-scroll to last message
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        })
      }, 100)
    }
  }, [messages])

  // Scroll button visibility
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const isNotAtBottom = scrollHeight - scrollTop - clientHeight > 200
    setShowScrollButton(isNotAtBottom)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }

  // Start analysis handler
  const handleStartAnalysis = async () => {
    await startAnalysis(initialSessionId)
  }

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  // Remove selected file
  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Send message handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    let messageContent = inputValue.trim()

    // Se houver um arquivo, inclua seu nome na mensagem
    // Em uma implementação real, você enviaria o arquivo e obteria o texto
    if (selectedFile) {
      messageContent = messageContent || `[Documento: ${selectedFile.name}]`
      // TODO: Implementar upload de arquivo e extração de texto
      // Por enquanto, apenas enviamos o nome do arquivo como marcador
    }

    if (!messageContent) return

    setInputValue('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    await continueAnalysis(messageContent)
  }

  // Call onComplete when workflow finishes
  useEffect(() => {
    if (
      state &&
      !state.isWaitingInput &&
      (state.complianceResult || state.riskResult)
    ) {
      onComplete?.({
        extractedData: state.extractedData,
        complianceResult: state.complianceResult,
        riskResult: state.riskResult
      })
    }
  }, [state, onComplete])

  // Determine if we should show result panels
  const showExtractedData =
    state?.extractedData && Object.keys(state.extractedData).length > 0
  const showComplianceResult = state?.complianceResult
  const showRiskResult = state?.riskResult

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border border-verity-200 bg-white',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-verity-100 bg-gradient-to-r from-verity-50 to-white px-4 py-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-verity-600" />
          <h2 className="font-semibold text-verity-900">Analise de CPR</h2>
        </div>
        {state && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-verity-500 hover:text-verity-700"
          >
            Nova Analise
          </Button>
        )}
      </div>

      {/* Progress indicator */}
      {state && (
        <div className="border-b border-verity-100 bg-white/50 px-4 py-3">
          <ProgressIndicator currentStep={state.currentStep} />
        </div>
      )}

      {/* Error display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3"
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="flex-1 text-sm text-red-700">{error}</p>
          <button
            onClick={() => reset()}
            className="text-red-500 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}

      {/* Messages area */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 && !state ? (
          <EmptyState onStart={handleStartAnalysis} isLoading={isLoading} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-2">
            {/* Messages */}
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {/* Typing indicator */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <TypingIndicator />
            )}

            {/* Extracted data card */}
            {showExtractedData && state?.extractedData && (
              <ExtractedDataCard data={state.extractedData} />
            )}

            {/* Compliance result */}
            {showComplianceResult && state?.complianceResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <ComplianceVerifier
                  complianceResult={state.complianceResult}
                  title="Resultado do Compliance"
                />
              </motion.div>
            )}

            {/* Risk result */}
            {showRiskResult && state?.riskResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <RiskCalculator
                  data={transformRiskResult(state.riskResult)}
                  title="Analise de Risco"
                />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-24 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-verity-900 text-white shadow-lg hover:bg-verity-800"
          >
            <ArrowDown className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input area */}
      {state?.isWaitingInput && (
        <div className="border-t border-verity-100 bg-white p-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            {/* Selected file indicator */}
            {selectedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2 flex items-center gap-2 rounded-lg border border-verity-200 bg-verity-50 px-3 py-2"
              >
                <FileText className="h-4 w-4 text-verity-600" />
                <span className="flex-1 truncate text-sm text-verity-700">
                  {selectedFile.name}
                </span>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-verity-400 hover:text-verity-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            <div className="flex items-center gap-2">
              {/* File upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 text-verity-500 hover:bg-verity-50 hover:text-verity-700"
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {/* Text input */}
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Digite sua resposta..."
                disabled={isLoading}
                className="flex-1 border-verity-200 focus:border-verity-500 focus:ring-verity-500"
              />

              {/* Send button */}
              <Button
                type="submit"
                disabled={isLoading || (!inputValue.trim() && !selectedFile)}
                className="shrink-0 bg-verity-600 hover:bg-verity-700"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </Button>
            </div>

            <p className="mt-2 text-center text-xs text-verity-500">
              Verity Agro pode cometer erros. Verifique informacoes importantes.
            </p>
          </form>
        </div>
      )}
    </div>
  )
}

export default CPRAnalysisChat
