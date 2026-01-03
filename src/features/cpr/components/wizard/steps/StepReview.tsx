import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { CPRWizardData } from '../schema'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  DownloadIcon,
  FileTextIcon,
  Loader2,
  AlertTriangle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import {
  useRiskCalculator,
  type RiskCalculateRequest,
  type RiskCalculateResponse,
  type APIRiskFactor
} from '@/features/risk'
import {
  RiskCalculator,
  type RiskCalculatorData,
  type RiskFactor,
  type RiskLevel
} from '@/features/risk/components/RiskCalculator'
import { useCPRCreation, type DocumentData } from '@/features/cpr/hooks/useCPRCreation'

interface StepReviewProps {
  data: Partial<CPRWizardData>
  onBack: () => void
  goToStep: (step: number) => void
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Converts backend risk_level to frontend RiskLevel
 */
function mapRiskLevel(backendLevel: 'baixo' | 'medio' | 'alto'): RiskLevel {
  const mapping: Record<string, RiskLevel> = {
    baixo: 'low',
    medio: 'medium',
    alto: 'high'
  }
  return mapping[backendLevel] || 'medium'
}

/**
 * Converts backend risk factors to frontend format
 */
function mapRiskFactors(apiFactors: APIRiskFactor[]): RiskFactor[] {
  return apiFactors.map((factor) => ({
    id: factor.id,
    label: factor.name,
    impact: factor.impact,
    weight: Math.round(factor.weight * 100),
    description: factor.description
  }))
}

/**
 * Transforms API response to display format
 */
function transformToDisplayData(
  response: RiskCalculateResponse
): RiskCalculatorData {
  return {
    score: response.overall_score,
    level: mapRiskLevel(response.risk_level),
    factors: mapRiskFactors(response.factors),
    recommendation: response.recommendations.join(' '),
    calculatedAt: new Date()
  }
}

/**
 * Format date from YYYY-MM-DD to DD/MM/YYYY
 */
function formatDateToBR(date: string): string {
  if (!date) return ''
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Map wizard data to DocumentData format expected by the CPR creation API
 */
function mapWizardDataToDocumentData(
  data: Partial<CPRWizardData>
): DocumentData {
  return {
    valores: {
      valor_total: data.amount,
      preco_unitario: data.unitPrice,
      forma_pagamento:
        data.correctionIndex !== 'Nenhum'
          ? `Correção: ${data.correctionIndex}`
          : undefined
    },
    produto: {
      descricao: data.commodity,
      quantidade: data.quantity,
      local_entrega: data.deliveryPlace
    },
    datas: {
      emissao: data.issueDate,
      vencimento: data.dueDate
    },
    garantias: {
      tipo: data.guaranteeType?.join(', '),
      descricao: data.guaranteeDescription
    },
    // Include guarantor info if available
    ...(data.hasGuarantor &&
      data.guarantorName && {
        avalista: {
          nome: data.guarantorName,
          cpf_cnpj: data.guarantorCpfCnpj,
          endereco: data.guarantorAddress
        }
      })
  }
}

// Generation progress steps for user feedback
const GENERATION_STEPS = [
  'Iniciando geração...',
  'Validando dados...',
  'Processando informações...',
  'Gerando documento...',
  'Finalizando...'
]

// =============================================================================
// Component
// =============================================================================

export function StepReview({ data, onBack, goToStep }: StepReviewProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [riskCalculated, setRiskCalculated] = useState(false)
  const [progressStep, setProgressStep] = useState(0)
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)

  // CPR creation hook
  const {
    state: cprState,
    isLoading: isGenerating,
    error: cprError,
    startCreation,
    continueCreation,
    reset: resetCPRCreation
  } = useCPRCreation()

  // Risk calculator hook
  const {
    result: riskResult,
    isLoading: isCalculatingRisk,
    error: riskError,
    calculate: calculateRisk,
    reset: resetRisk
  } = useRiskCalculator()

  // Transform wizard data to risk calculation request
  const riskRequest = useMemo((): RiskCalculateRequest | null => {
    // Check if we have minimum required data
    if (!data.amount || !data.quantity || !data.issueDate || !data.dueDate) {
      return null
    }

    // Determine if there are guarantees (has guarantee types selected)
    const hasGuarantees = (data.guaranteeType?.length ?? 0) > 0

    return {
      commodity: data.commodity || 'soja', // Default to soja if not specified
      quantity: data.quantity,
      unit: 'sacas', // Default unit - could be enhanced if wizard stores unit
      total_value: data.amount,
      issue_date: formatDateToBR(data.issueDate),
      maturity_date: formatDateToBR(data.dueDate),
      has_guarantees: hasGuarantees,
      guarantee_value: hasGuarantees ? data.amount * 0.5 : undefined, // Estimate 50% of value as guarantee
      unit_price: data.unitPrice
    }
  }, [data])

  // Auto-calculate risk when step mounts
  useEffect(() => {
    if (riskRequest && !riskCalculated && !riskResult && !isCalculatingRisk) {
      setRiskCalculated(true)
      calculateRisk(riskRequest)
    }
  }, [
    riskRequest,
    riskCalculated,
    riskResult,
    isCalculatingRisk,
    calculateRisk
  ])

  // Update progress indicator during generation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isGenerating) {
      interval = setInterval(() => {
        setProgressStep((prev) => {
          if (prev < GENERATION_STEPS.length - 1) {
            return prev + 1
          }
          return prev
        })
      }, 1500)
    } else {
      setProgressStep(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isGenerating])

  // Handle document URL from API response
  useEffect(() => {
    if (cprState?.documentUrl) {
      setDocumentUrl(cprState.documentUrl)
      setGenerated(true)
      toast.success('Minuta da CPR gerada com sucesso!')
    }
  }, [cprState?.documentUrl])

  // Transform API result to display format
  const riskDisplayData = useMemo(() => {
    if (!riskResult) return null
    return transformToDisplayData(riskResult)
  }, [riskResult])

  // Check if risk is too high (optional blocking)
  const isHighRisk = riskResult?.risk_level === 'alto'

  // Handle recalculate risk
  const handleRecalculateRisk = useCallback(() => {
    if (riskRequest) {
      resetRisk()
      setRiskCalculated(false)
    }
  }, [riskRequest, resetRisk])

  // Handle document generation with real API
  const handleGenerate = useCallback(async () => {
    if (!confirmed) return

    // Reset any previous error state
    resetCPRCreation()
    setProgressStep(0)

    // Convert wizard data to API format
    const documentData = mapWizardDataToDocumentData(data)

    // Start the CPR creation workflow
    const startResponse = await startCreation(documentData)

    if (!startResponse) {
      // Error is handled by the hook and displayed in the UI
      return
    }

    // If the workflow is waiting for confirmation, continue with confirmation
    if (startResponse.is_waiting_input) {
      const confirmResponse = await continueCreation(
        'Confirmo todos os dados e desejo gerar o documento da CPR.',
        { confirmed: true, wizard_data: data }
      )

      if (!confirmResponse) {
        return
      }

      // Check if document was generated
      if (confirmResponse.document_url) {
        setDocumentUrl(confirmResponse.document_url)
        setGenerated(true)
        toast.success('Minuta da CPR gerada com sucesso!')
      } else if (!confirmResponse.is_waiting_input) {
        // Generation complete but no URL - might need another step
        setGenerated(true)
        toast.success('CPR processada com sucesso!')
      }
    } else if (startResponse.document_url) {
      // Document was generated in the start call
      setDocumentUrl(startResponse.document_url)
      setGenerated(true)
      toast.success('Minuta da CPR gerada com sucesso!')
    }
  }, [confirmed, data, startCreation, continueCreation, resetCPRCreation])

  // Handle retry after error
  const handleRetry = useCallback(() => {
    resetCPRCreation()
    setGenerated(false)
    setDocumentUrl(null)
    setConfirmed(false)
  }, [resetCPRCreation])

  // Handle download with actual URL
  const handleDownload = useCallback(
    (format: 'pdf' | 'docx') => {
      if (documentUrl) {
        // If the URL already has a format, use it directly
        // Otherwise, append format parameter
        const downloadUrl = documentUrl.includes('?')
          ? `${documentUrl}&format=${format}`
          : `${documentUrl}?format=${format}`

        window.open(downloadUrl, '_blank')
      } else {
        toast.error('URL do documento não disponível')
      }
    },
    [documentUrl]
  )

  // Success state - document generated
  if (generated) {
    return (
      <div className="space-y-6 py-10 text-center duration-500 animate-in fade-in zoom-in-95">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <FileTextIcon className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold">Documento Pronto!</h2>
        <p className="text-muted-foreground">
          A CPR foi gerada e está pronta para download.
        </p>

        <div className="flex flex-col justify-center gap-3 pt-4 sm:flex-row">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleDownload('pdf')}
            disabled={!documentUrl}
          >
            <DownloadIcon className="h-4 w-4" />
            Baixar PDF
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => handleDownload('docx')}
            disabled={!documentUrl}
          >
            <DownloadIcon className="h-4 w-4" />
            Baixar Word (.docx)
          </Button>
        </div>
        <Button variant="ghost" onClick={handleRetry} className="mt-4 text-xs">
          Voltar para edição
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 duration-300 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-4">
        {/* Resumo Valores */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base">Valores e Prazos</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(4)}
              className="h-8 text-xs"
            >
              Editar
            </Button>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-muted-foreground">Valor Total</span>
              <span className="font-semibold">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(data.amount || 0)}
              </span>
            </div>
            <div>
              <span className="block text-muted-foreground">Vencimento</span>
              <span className="font-semibold">{data.dueDate}</span>
            </div>
            <div>
              <span className="block text-muted-foreground">
                Local de Entrega
              </span>
              <span className="font-semibold">{data.deliveryPlace}</span>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Garantias */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base">Garantias</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goToStep(5)}
              className="h-8 text-xs"
            >
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="block text-muted-foreground">Tipos</span>
              <span className="font-semibold">
                {data.guaranteeType?.join(', ')}
              </span>
            </div>
            {data.hasGuarantor && (
              <div className="border-t pt-2">
                <span className="block text-muted-foreground">Avalista</span>
                <span className="font-semibold">{data.guarantorName}</span>
                <span className="block text-xs text-muted-foreground">
                  {data.guarantorCpfCnpj}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis Section */}
      <div className="space-y-4">
        {isCalculatingRisk && (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">
                  Calculando risco da operação...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {riskError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  Erro ao calcular risco
                </p>
                <p className="text-xs text-red-600">{riskError}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculateRisk}
                className="shrink-0"
              >
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {riskDisplayData && (
          <RiskCalculator
            data={riskDisplayData}
            onRecalculate={handleRecalculateRisk}
            isLoading={isCalculatingRisk}
            title="Análise de Risco da CPR"
          />
        )}

        {/* High Risk Warning */}
        {isHighRisk && (
          <div className="flex items-start gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
            <div>
              <p className="text-sm font-semibold text-orange-800">
                Atenção: Operação de Alto Risco
              </p>
              <p className="mt-1 text-xs text-orange-700">
                Esta operação foi classificada como alto risco. Recomendamos
                revisar as garantias e condições antes de prosseguir com a
                geração do documento.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CPR Generation Error */}
      {cprError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Erro ao gerar documento
              </p>
              <p className="text-xs text-red-600">{cprError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="shrink-0 gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-primary">
                  {GENERATION_STEPS[progressStep]}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Passo {progressStep + 1} de {GENERATION_STEPS.length}
                </p>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full max-w-xs rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${((progressStep + 1) / GENERATION_STEPS.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center space-x-2 rounded-md border border-amber-100 bg-amber-50/20 p-4">
        <Checkbox
          id="confirm"
          checked={confirmed}
          onCheckedChange={(c) => setConfirmed(c === true)}
          disabled={isGenerating}
        />
        <label
          htmlFor="confirm"
          className="cursor-pointer text-sm font-medium leading-none"
        >
          Confirmo que revisei todos os dados e desejo gerar o documento.
        </label>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isGenerating}>
          Voltar
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={!confirmed || isGenerating}
          className="min-w-[150px]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Gerando...
            </>
          ) : (
            'Gerar Documento'
          )}
        </Button>
      </div>
    </div>
  )
}
