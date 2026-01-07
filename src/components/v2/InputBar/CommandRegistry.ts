import {
  MessageSquare,
  Sparkles,
  FileText,
  Settings,
  RefreshCw,
  LucideIcon
} from 'lucide-react'

export type CommandType = 'slash' | 'mention'

export interface AgentCommand {
  id: string
  label: string
  description: string
  icon: LucideIcon
  type: 'slash'
  trigger: string
}

export interface AgentMention {
  id: string
  label: string
  description: string
  avatar?: string
  type: 'mention'
  trigger: string
}

export const SLASH_COMMANDS: AgentCommand[] = [
  {
    id: 'gpt-4o',
    label: 'GPT-4o',
    description: 'Mudar para modelo GPT-4o (OpenAI)',
    icon: Sparkles,
    type: 'slash',
    trigger: '/gpt4'
  },
  {
    id: 'claude-3-5-sonnet',
    label: 'Claude 3.5 Sonnet',
    description: 'Mudar para Claude 3.5 Sonnet (Anthropic)',
    icon: MessageSquare,
    type: 'slash',
    trigger: '/claude'
  },
  {
    id: 'canvas',
    label: 'Canvas Mode',
    description: 'Abrir workspace de edição',
    icon: FileText,
    type: 'slash',
    trigger: '/canvas'
  },
  {
    id: 'reset',
    label: 'Reset Thread',
    description: 'Limpar contexto atual',
    icon: RefreshCw,
    type: 'slash',
    trigger: '/reset'
  },
  {
    id: 'settings',
    label: 'Configurações',
    description: 'Abrir painel de ajustes',
    icon: Settings,
    type: 'slash',
    trigger: '/config'
  }
]

export const MOCK_MENTIONS: AgentMention[] = [
  {
    id: 'doc-1',
    label: 'Contrato Safra 2025.pdf',
    description: 'Documento PDF',
    type: 'mention',
    trigger: '@contrato'
  },
  {
    id: 'kb-cpr',
    label: 'Base: Lei da CPR',
    description: 'Knowledge Base',
    type: 'mention',
    trigger: '@lei'
  }
]
