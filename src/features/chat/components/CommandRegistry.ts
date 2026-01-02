import {
  FileText,
  Settings,
  LucideIcon,
  Eraser,
  HelpCircle,
  Upload
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
    id: 'clean',
    label: 'Limpar Chat',
    description: 'Começar uma nova conversa',
    icon: Eraser,
    type: 'slash',
    trigger: '/limpar'
  },
  {
    id: 'upload',
    label: 'Enviar Arquivo',
    description: 'Anexar documentos',
    icon: Upload,
    type: 'slash',
    trigger: '/upload'
  },
  {
    id: 'canvas',
    label: 'Modo Canvas',
    description: 'Abrir editor de texto',
    icon: FileText,
    type: 'slash',
    trigger: '/canvas'
  },
  {
    id: 'help',
    label: 'Ajuda / Comandos',
    description: 'Lista todos os comandos disponíveis',
    icon: HelpCircle,
    type: 'slash',
    trigger: '/comandos' // Changed from /ajuda to satisfy user request directly, or support both via input logic
  },
  {
    id: 'juris',
    label: 'Jurisprudência',
    description: 'Pesquisar em base legal',
    icon: FileText, // Using generic file icon or similar
    type: 'slash',
    trigger: '/juris'
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

export const STATIC_MENTIONS: AgentMention[] = [
  {
    id: 'web-search',
    label: 'Web Search',
    description: 'Pesquisar na internet',
    type: 'mention',
    trigger: '@web'
  }
]
