'use client'

import { motion } from 'framer-motion'
import {
  LucideIcon,
  Inbox,
  Upload,
  FileText,
  MessageSquare
} from 'lucide-react'

interface EmptyStateProps {
  variant: 'uploads' | 'generated' | 'messages' | 'search'
  title?: string
  subtitle?: string
  action?: {
    label: string
    onClick: () => void
  }
}

const configs: Record<
  string,
  {
    icon: LucideIcon
    defaultTitle: string
    defaultSubtitle: string
    iconColor: string
    bgGradient: string
  }
> = {
  uploads: {
    icon: Upload,
    defaultTitle: 'Nenhum arquivo enviado',
    defaultSubtitle: 'Envie documentos para análise',
    iconColor: 'text-verity-600',
    bgGradient: 'from-verity-100 to-verity-50'
  },
  generated: {
    icon: FileText,
    defaultTitle: 'Nenhum arquivo gerado',
    defaultSubtitle: 'Relatórios aparecerão aqui',
    iconColor: 'text-verity-600',
    bgGradient: 'from-verity-100 to-verity-50'
  },
  messages: {
    icon: MessageSquare,
    defaultTitle: 'Nenhuma mensagem ainda',
    defaultSubtitle: 'Comece uma conversa sobre CPR',
    iconColor: 'text-verity-700',
    bgGradient: 'from-verity-200 to-verity-100'
  },
  search: {
    icon: Inbox,
    defaultTitle: 'Nenhum resultado encontrado',
    defaultSubtitle: 'Tente outros termos de busca',
    iconColor: 'text-verity-500',
    bgGradient: 'from-verity-50 to-transparent'
  }
}

export function EmptyState({
  variant,
  title,
  subtitle,
  action
}: EmptyStateProps) {
  const config = configs[variant] || configs.messages
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center px-6 py-12">
      {/* Icon container com float animation */}
      <motion.div
        animate={{
          y: [-2, 2, -2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1] // float easing
        }}
        className={`mb-4 h-16 w-16 bg-gradient-to-br ${config.bgGradient} flex items-center justify-center rounded-2xl shadow-sm shadow-verity-900/5`}
      >
        <Icon className={`h-8 w-8 ${config.iconColor}`} />
      </motion.div>

      {/* Text */}
      <p className="mb-1 text-center text-sm font-medium text-verity-700">
        {title || config.defaultTitle}
      </p>
      <p className="max-w-xs text-center text-xs font-light text-verity-500">
        {subtitle || config.defaultSubtitle}
      </p>

      {/* Action button (opcional) */}
      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="mt-6 rounded-lg border-2 border-verity-200 bg-white px-4 py-2 text-sm font-medium text-verity-900 shadow-sm transition-all duration-200 hover:border-verity-400 hover:bg-verity-50 hover:shadow-md"
        >
          {action.label}
        </motion.button>
      )}
    </div>
  )
}
