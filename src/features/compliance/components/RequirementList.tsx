'use client'

/**
 * RequirementList Component
 *
 * Displays the 15 requirements from Lei 8.929/94 (CPR Law) with status indicators.
 * Requirements are grouped by category for better organization.
 */

import { motion } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Scale,
  Users,
  Package,
  Calendar,
  FileText,
  Shield
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

export type RequirementStatus = 'ok' | 'incomplete' | 'missing'

export interface Requirement {
  id: string
  name: string
  status: RequirementStatus
  description?: string
  category?: RequirementCategory
}

export type RequirementCategory =
  | 'partes'
  | 'produto'
  | 'valores'
  | 'datas'
  | 'garantias'
  | 'formalizacao'

export interface RequirementListProps {
  /** Array of requirements to display */
  requirements: Requirement[]
  /** Group requirements by category */
  grouped?: boolean
  /** Expand all categories by default */
  expandedByDefault?: boolean
  /** Callback when a requirement is clicked */
  onRequirementClick?: (requirement: Requirement) => void
}

// =============================================================================
// Constants
// =============================================================================

const STATUS_CONFIG: Record<
  RequirementStatus,
  {
    icon: typeof CheckCircle2
    color: string
    bgColor: string
    label: string
  }
> = {
  ok: {
    icon: CheckCircle2,
    color: 'text-verity-600',
    bgColor: 'bg-verity-50',
    label: 'Atendido'
  },
  incomplete: {
    icon: AlertCircle,
    color: 'text-ouro-600',
    bgColor: 'bg-ouro-50',
    label: 'Incompleto'
  },
  missing: {
    icon: XCircle,
    color: 'text-error-600',
    bgColor: 'bg-error-50',
    label: 'Ausente'
  }
}

const CATEGORY_CONFIG: Record<
  RequirementCategory,
  { label: string; icon: typeof Users }
> = {
  partes: { label: 'Partes', icon: Users },
  produto: { label: 'Produto', icon: Package },
  valores: { label: 'Valores', icon: Scale },
  datas: { label: 'Datas', icon: Calendar },
  garantias: { label: 'Garantias', icon: Shield },
  formalizacao: { label: 'Formalizacao', icon: FileText }
}

/**
 * Default requirements based on Lei 8.929/94
 * These represent the minimum legal requirements for a valid CPR
 */
export const DEFAULT_REQUIREMENTS: Requirement[] = [
  // Partes (Parties)
  {
    id: 'req_01',
    name: 'Identificacao do Emitente',
    status: 'missing',
    description:
      'Nome, CPF/CNPJ e endereco completo do emitente (produtor rural)',
    category: 'partes'
  },
  {
    id: 'req_02',
    name: 'Identificacao do Credor',
    status: 'missing',
    description: 'Nome, CPF/CNPJ e endereco completo do credor/beneficiario',
    category: 'partes'
  },
  // Produto (Product)
  {
    id: 'req_03',
    name: 'Descricao do Produto',
    status: 'missing',
    description: 'Descricao detalhada do produto rural prometido',
    category: 'produto'
  },
  {
    id: 'req_04',
    name: 'Quantidade e Unidade',
    status: 'missing',
    description: 'Quantidade e unidade de medida (sacas, toneladas, etc.)',
    category: 'produto'
  },
  {
    id: 'req_05',
    name: 'Qualidade e Classificacao',
    status: 'missing',
    description: 'Especificacoes de qualidade e classificacao do produto',
    category: 'produto'
  },
  {
    id: 'req_06',
    name: 'Safra/Periodo',
    status: 'missing',
    description: 'Identificacao da safra ou periodo de producao',
    category: 'produto'
  },
  // Valores (Values)
  {
    id: 'req_07',
    name: 'Preco Unitario',
    status: 'missing',
    description: 'Preco por unidade do produto (quando aplicavel)',
    category: 'valores'
  },
  {
    id: 'req_08',
    name: 'Valor Total',
    status: 'missing',
    description: 'Valor total da operacao em moeda nacional',
    category: 'valores'
  },
  // Datas (Dates)
  {
    id: 'req_09',
    name: 'Data de Emissao',
    status: 'missing',
    description: 'Data em que a CPR foi emitida',
    category: 'datas'
  },
  {
    id: 'req_10',
    name: 'Data de Vencimento',
    status: 'missing',
    description: 'Data de vencimento/entrega do produto ou pagamento',
    category: 'datas'
  },
  {
    id: 'req_11',
    name: 'Local de Entrega',
    status: 'missing',
    description: 'Local onde o produto sera entregue',
    category: 'datas'
  },
  // Garantias (Guarantees)
  {
    id: 'req_12',
    name: 'Descricao das Garantias',
    status: 'missing',
    description:
      'Descricao das garantias oferecidas (penhor, hipoteca, alienacao fiduciaria)',
    category: 'garantias'
  },
  {
    id: 'req_13',
    name: 'Valor das Garantias',
    status: 'missing',
    description: 'Valor estimado das garantias oferecidas',
    category: 'garantias'
  },
  // Formalizacao (Formalization)
  {
    id: 'req_14',
    name: 'Assinatura do Emitente',
    status: 'missing',
    description: 'Assinatura do emitente ou representante legal',
    category: 'formalizacao'
  },
  {
    id: 'req_15',
    name: 'Registro em Cartorio',
    status: 'missing',
    description:
      'Registro da CPR em cartorio de registro de imoveis (para garantia real)',
    category: 'formalizacao'
  }
]

// =============================================================================
// Sub-components
// =============================================================================

interface RequirementItemProps {
  requirement: Requirement
  index: number
  onClick?: () => void
}

function RequirementItem({
  requirement,
  index,
  onClick
}: RequirementItemProps) {
  const config = STATUS_CONFIG[requirement.status]
  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 rounded-lg p-3 transition-all',
        config.bgColor,
        onClick && 'cursor-pointer hover:ring-2 hover:ring-verity-300'
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', config.color)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-verity-900">
            {requirement.name}
          </p>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              config.bgColor,
              config.color
            )}
          >
            {config.label}
          </span>
        </div>
        {requirement.description && (
          <p className="mt-1 text-xs text-verity-600">
            {requirement.description}
          </p>
        )}
      </div>
    </motion.div>
  )
}

interface CategoryGroupProps {
  category: RequirementCategory
  requirements: Requirement[]
  defaultExpanded: boolean
  onRequirementClick?: (requirement: Requirement) => void
}

function CategoryGroup({
  category,
  requirements,
  defaultExpanded,
  onRequirementClick
}: CategoryGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const config = CATEGORY_CONFIG[category]
  const CategoryIcon = config.icon

  // Calculate category stats
  const okCount = requirements.filter((r) => r.status === 'ok').length
  const total = requirements.length

  return (
    <div className="overflow-hidden rounded-lg border border-verity-200 bg-white">
      {/* Category Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between bg-verity-50 px-4 py-3 text-left transition-colors hover:bg-verity-100"
      >
        <div className="flex items-center gap-3">
          <CategoryIcon className="h-5 w-5 text-verity-600" />
          <span className="font-medium text-verity-900">{config.label}</span>
          <span className="text-sm text-verity-500">
            ({okCount}/{total})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Mini progress bar */}
          <div className="h-2 w-16 overflow-hidden rounded-full bg-verity-200">
            <div
              className={cn(
                'h-full transition-all',
                okCount === total
                  ? 'bg-verity-500'
                  : okCount >= total / 2
                    ? 'bg-ouro-500'
                    : 'bg-error-500'
              )}
              style={{ width: `${(okCount / total) * 100}%` }}
            />
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-verity-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-verity-400" />
          )}
        </div>
      </button>

      {/* Requirements List */}
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="space-y-2 p-3">
          {requirements.map((req, index) => (
            <RequirementItem
              key={req.id}
              requirement={req}
              index={index}
              onClick={
                onRequirementClick ? () => onRequirementClick(req) : undefined
              }
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function RequirementList({
  requirements,
  grouped = true,
  expandedByDefault = true,
  onRequirementClick
}: RequirementListProps) {
  // Calculate summary stats
  const stats = {
    ok: requirements.filter((r) => r.status === 'ok').length,
    incomplete: requirements.filter((r) => r.status === 'incomplete').length,
    missing: requirements.filter((r) => r.status === 'missing').length,
    total: requirements.length
  }

  if (grouped) {
    // Group requirements by category
    const groupedRequirements = requirements.reduce(
      (acc, req) => {
        const category = req.category || 'formalizacao'
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(req)
        return acc
      },
      {} as Record<RequirementCategory, Requirement[]>
    )

    const categories = Object.keys(groupedRequirements) as RequirementCategory[]

    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full bg-verity-50 px-3 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-verity-600" />
            <span className="text-sm font-medium text-verity-700">
              {stats.ok} atendidos
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-ouro-50 px-3 py-1.5">
            <AlertCircle className="h-4 w-4 text-ouro-600" />
            <span className="text-sm font-medium text-ouro-700">
              {stats.incomplete} incompletos
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-error-50 px-3 py-1.5">
            <XCircle className="h-4 w-4 text-error-600" />
            <span className="text-sm font-medium text-error-700">
              {stats.missing} ausentes
            </span>
          </div>
        </div>

        {/* Grouped Categories */}
        <div className="space-y-3">
          {categories.map((category) => (
            <CategoryGroup
              key={category}
              category={category}
              requirements={groupedRequirements[category]}
              defaultExpanded={expandedByDefault}
              onRequirementClick={onRequirementClick}
            />
          ))}
        </div>
      </div>
    )
  }

  // Flat list (ungrouped)
  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full bg-verity-50 px-3 py-1.5">
          <CheckCircle2 className="h-4 w-4 text-verity-600" />
          <span className="text-sm font-medium text-verity-700">
            {stats.ok} atendidos
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-ouro-50 px-3 py-1.5">
          <AlertCircle className="h-4 w-4 text-ouro-600" />
          <span className="text-sm font-medium text-ouro-700">
            {stats.incomplete} incompletos
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-error-50 px-3 py-1.5">
          <XCircle className="h-4 w-4 text-error-600" />
          <span className="text-sm font-medium text-error-700">
            {stats.missing} ausentes
          </span>
        </div>
      </div>

      {/* Flat List */}
      <div className="space-y-2">
        {requirements.map((req, index) => (
          <RequirementItem
            key={req.id}
            requirement={req}
            index={index}
            onClick={
              onRequirementClick ? () => onRequirementClick(req) : undefined
            }
          />
        ))}
      </div>
    </div>
  )
}

export default RequirementList
