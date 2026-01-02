'use client'

/**
 * ComplianceVerifier Component
 *
 * Main compliance verification component that integrates ComplianceScore,
 * RequirementList, and recommendations display for CPR Lei 8.929/94 compliance.
 */

import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Scale,
  RefreshCw,
  Info,
  Lightbulb,
  FileCheck,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ComplianceScore, type ComplianceGrade } from './ComplianceScore'
import {
  RequirementList,
  type Requirement,
  type RequirementStatus,
  DEFAULT_REQUIREMENTS
} from './RequirementList'

// =============================================================================
// Types
// =============================================================================

export interface ExtractedData {
  emitente?: {
    nome?: string
    cpf_cnpj?: string
    endereco?: string
  }
  credor?: {
    nome?: string
    cpf_cnpj?: string
    endereco?: string
  }
  produto?: {
    descricao?: string
    quantidade?: number
    unidade?: string
    safra?: string
    qualidade?: string
  }
  valores?: {
    preco_unitario?: number
    valor_total?: number
  }
  datas?: {
    emissao?: string
    vencimento?: string
    entrega?: string
    local_entrega?: string
  }
  garantias?: {
    tipo?: string
    descricao?: string
    valor?: number
  }
  formalizacao?: {
    assinatura?: boolean
    registro_cartorio?: boolean
  }
  [key: string]: unknown
}

export interface ComplianceResult {
  score: number
  grade: ComplianceGrade
  requirements: Requirement[]
  recommendations: string[]
}

export interface ComplianceVerifierProps {
  /** Extracted data from CPR document to verify */
  extractedData?: ExtractedData
  /** Pre-computed compliance result (if available from API) */
  complianceResult?: ComplianceResult
  /** Callback when re-verification is requested */
  onVerify?: (data: ExtractedData) => Promise<ComplianceResult | null>
  /** Loading state */
  isLoading?: boolean
  /** Custom title */
  title?: string
  /** Show compact version */
  compact?: boolean
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Calculate compliance result from extracted data
 * This is a client-side fallback when no API result is available
 */
function calculateCompliance(data: ExtractedData): ComplianceResult {
  const requirements: Requirement[] = DEFAULT_REQUIREMENTS.map((req) => {
    let status: RequirementStatus = 'missing'

    switch (req.id) {
      // Partes
      case 'req_01':
        if (
          data.emitente?.nome &&
          data.emitente?.cpf_cnpj &&
          data.emitente?.endereco
        ) {
          status = 'ok'
        } else if (data.emitente?.nome || data.emitente?.cpf_cnpj) {
          status = 'incomplete'
        }
        break
      case 'req_02':
        if (
          data.credor?.nome &&
          data.credor?.cpf_cnpj &&
          data.credor?.endereco
        ) {
          status = 'ok'
        } else if (data.credor?.nome || data.credor?.cpf_cnpj) {
          status = 'incomplete'
        }
        break

      // Produto
      case 'req_03':
        if (data.produto?.descricao) status = 'ok'
        break
      case 'req_04':
        if (data.produto?.quantidade && data.produto?.unidade) {
          status = 'ok'
        } else if (data.produto?.quantidade || data.produto?.unidade) {
          status = 'incomplete'
        }
        break
      case 'req_05':
        if (data.produto?.qualidade) status = 'ok'
        break
      case 'req_06':
        if (data.produto?.safra) status = 'ok'
        break

      // Valores
      case 'req_07':
        if (data.valores?.preco_unitario) status = 'ok'
        break
      case 'req_08':
        if (data.valores?.valor_total) status = 'ok'
        break

      // Datas
      case 'req_09':
        if (data.datas?.emissao) status = 'ok'
        break
      case 'req_10':
        if (data.datas?.vencimento) status = 'ok'
        break
      case 'req_11':
        if (data.datas?.local_entrega) status = 'ok'
        break

      // Garantias
      case 'req_12':
        if (data.garantias?.descricao || data.garantias?.tipo) status = 'ok'
        break
      case 'req_13':
        if (data.garantias?.valor) status = 'ok'
        break

      // Formalizacao
      case 'req_14':
        if (data.formalizacao?.assinatura) status = 'ok'
        break
      case 'req_15':
        if (data.formalizacao?.registro_cartorio) status = 'ok'
        break
    }

    return { ...req, status }
  })

  // Calculate score
  const okCount = requirements.filter((r) => r.status === 'ok').length
  const incompleteCount = requirements.filter(
    (r) => r.status === 'incomplete'
  ).length
  const total = requirements.length

  // Score: ok = 100%, incomplete = 50%, missing = 0%
  const score = Math.round(((okCount + incompleteCount * 0.5) / total) * 100)

  // Determine grade
  let grade: ComplianceGrade
  if (score >= 90) grade = 'A'
  else if (score >= 75) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 40) grade = 'D'
  else grade = 'F'

  // Generate recommendations based on missing/incomplete requirements
  const recommendations: string[] = []

  const missingPartes = requirements.filter(
    (r) => r.category === 'partes' && r.status !== 'ok'
  )
  if (missingPartes.length > 0) {
    recommendations.push(
      'Complete os dados de identificacao das partes (emitente e credor) com nome, CPF/CNPJ e endereco.'
    )
  }

  const missingProduto = requirements.filter(
    (r) => r.category === 'produto' && r.status !== 'ok'
  )
  if (missingProduto.length > 0) {
    recommendations.push(
      'Especifique detalhadamente o produto: descricao, quantidade, unidade, qualidade e safra.'
    )
  }

  const missingValores = requirements.filter(
    (r) => r.category === 'valores' && r.status !== 'ok'
  )
  if (missingValores.length > 0) {
    recommendations.push(
      'Inclua os valores da operacao: preco unitario e valor total.'
    )
  }

  const missingDatas = requirements.filter(
    (r) => r.category === 'datas' && r.status !== 'ok'
  )
  if (missingDatas.length > 0) {
    recommendations.push(
      'Defina as datas de emissao, vencimento e local de entrega do produto.'
    )
  }

  const missingGarantias = requirements.filter(
    (r) => r.category === 'garantias' && r.status !== 'ok'
  )
  if (missingGarantias.length > 0) {
    recommendations.push(
      'Descreva as garantias oferecidas e seus valores para maior seguranca juridica.'
    )
  }

  const missingFormalizacao = requirements.filter(
    (r) => r.category === 'formalizacao' && r.status !== 'ok'
  )
  if (missingFormalizacao.length > 0) {
    recommendations.push(
      'Formalize a CPR com assinatura do emitente e considere o registro em cartorio.'
    )
  }

  return { score, grade, requirements, recommendations }
}

// =============================================================================
// Main Component
// =============================================================================

export function ComplianceVerifier({
  extractedData,
  complianceResult: externalResult,
  onVerify,
  isLoading = false,
  title = 'Verificacao de Compliance',
  compact = false
}: ComplianceVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [selectedRequirement, setSelectedRequirement] =
    useState<Requirement | null>(null)

  // Calculate or use provided compliance result
  const complianceResult = useMemo(() => {
    if (externalResult) return externalResult
    if (extractedData) return calculateCompliance(extractedData)
    return null
  }, [externalResult, extractedData])

  const handleVerify = useCallback(async () => {
    if (!extractedData || !onVerify) return

    setIsVerifying(true)
    try {
      await onVerify(extractedData)
    } finally {
      setIsVerifying(false)
    }
  }, [extractedData, onVerify])

  // Empty state
  if (!complianceResult && !isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-verity-200 bg-gradient-to-br from-verity-50 to-white">
        <div className="flex items-center justify-between border-b border-verity-200 bg-white/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-verity-600" />
            <h3 className="font-semibold text-verity-900">{title}</h3>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FileCheck className="h-12 w-12 text-verity-300" />
          <p className="mt-4 text-verity-600">
            Nenhum documento para verificar.
          </p>
          <p className="mt-1 text-sm text-verity-500">
            Envie uma CPR para analise de compliance.
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading || isVerifying) {
    return (
      <div className="overflow-hidden rounded-xl border border-verity-200 bg-gradient-to-br from-verity-50 to-white">
        <div className="flex items-center justify-between border-b border-verity-200 bg-white/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-verity-600" />
            <h3 className="font-semibold text-verity-900">{title}</h3>
          </div>
          <RefreshCw className="h-5 w-5 animate-spin text-verity-500" />
        </div>
        <div className="flex flex-col items-center justify-center p-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Scale className="h-12 w-12 text-verity-400" />
          </motion.div>
          <p className="mt-4 text-verity-600">Verificando compliance...</p>
          <p className="mt-1 text-sm text-verity-500">
            Analisando requisitos da Lei 8.929/94
          </p>
        </div>
      </div>
    )
  }

  if (!complianceResult) return null

  return (
    <div className="overflow-hidden rounded-xl border border-verity-200 bg-gradient-to-br from-verity-50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-verity-200 bg-white/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-verity-600" />
          <h3 className="font-semibold text-verity-900">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Grade badge */}
          <span
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold text-white',
              complianceResult.grade === 'A' && 'bg-verity-500',
              complianceResult.grade === 'B' && 'bg-verity-500',
              complianceResult.grade === 'C' && 'bg-ouro-500',
              complianceResult.grade === 'D' && 'bg-ouro-500',
              complianceResult.grade === 'F' && 'bg-error-500'
            )}
          >
            Nota {complianceResult.grade}
          </span>
          {onVerify && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleVerify}
              disabled={isLoading || isVerifying}
              className="text-verity-600 hover:bg-verity-100 hover:text-verity-700"
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  (isLoading || isVerifying) && 'animate-spin'
                )}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6 p-4">
        {/* Score Gauge */}
        <div className="flex justify-center">
          <ComplianceScore
            score={complianceResult.score}
            grade={complianceResult.grade}
            size={compact ? 'sm' : 'md'}
          />
        </div>

        {/* Requirements List */}
        {!compact && (
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-verity-800">
              <FileCheck className="h-4 w-4" />
              Requisitos Lei 8.929/94
            </h4>
            <RequirementList
              requirements={complianceResult.requirements}
              grouped={true}
              expandedByDefault={false}
              onRequirementClick={setSelectedRequirement}
            />
          </div>
        )}

        {/* Selected Requirement Detail */}
        {selectedRequirement && !compact && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-verity-200 bg-white p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-medium text-verity-900">
                  {selectedRequirement.name}
                </h5>
                <p className="mt-1 text-sm text-verity-600">
                  {selectedRequirement.description}
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedRequirement(null)}
                className="text-verity-400 hover:text-verity-600"
              >
                X
              </Button>
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        {complianceResult.recommendations.length > 0 && (
          <div className="rounded-lg bg-verity-100/50 p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-ouro-600" />
              <div className="flex-1">
                <h4 className="mb-2 text-sm font-semibold text-verity-800">
                  Recomendacoes
                </h4>
                <ul className="space-y-2">
                  {complianceResult.recommendations.map((rec, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 text-sm text-verity-700"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-verity-400" />
                      {rec}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Warning for low scores */}
        {complianceResult.score < 60 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 rounded-lg border border-error-200 bg-error-50 p-4"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-error-600" />
            <div>
              <p className="text-sm font-medium text-error-800">
                Atencao: Compliance Insuficiente
              </p>
              <p className="mt-1 text-sm text-error-700">
                Esta CPR nao atende aos requisitos minimos da Lei 8.929/94.
                Corrija os itens pendentes antes de prosseguir com a operacao.
              </p>
            </div>
          </motion.div>
        )}

        {/* Info footer */}
        <div className="flex items-center gap-2 text-xs text-verity-500">
          <Info className="h-4 w-4" />
          <span>
            Verificacao baseada nos requisitos da Lei 8.929/94 que regulamenta a
            CPR.
          </span>
        </div>
      </div>
    </div>
  )
}

export default ComplianceVerifier
