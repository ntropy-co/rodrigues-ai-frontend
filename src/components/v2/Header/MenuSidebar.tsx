'use client'

import { useState } from 'react'
import { X, MessageSquare, Trash2, Plus } from 'lucide-react'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: string
}

interface MenuSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MenuSidebar({ isOpen, onClose }: MenuSidebarProps) {
  const [sessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Deficiência de Manganês na Soja',
      lastMessage: 'Como identificar sintomas de deficiência de Mn?',
      timestamp: '2 horas atrás'
    },
    {
      id: '2', 
      title: 'Compatibilidade com Glifosato',
      lastMessage: 'Posso misturar quelato de Mn com glifosato?',
      timestamp: '1 dia atrás'
    },
    {
      id: '3',
      title: 'Nutrição Foliar no Florescimento',
      lastMessage: 'Qual nutriente aplicar em R1?',
      timestamp: '3 dias atrás'
    }
  ])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-full w-80 bg-background border-r border-border shadow-xl transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Nova Conversa */}
          <div className="p-4 border-b border-border">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:bg-muted transition-colors">
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Nova Conversa</span>
            </button>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-foreground truncate">
                    {session.title}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {session.lastMessage}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {session.timestamp}
                  </span>
                </div>

                <button
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                  onClick={(e) => {
                    e.stopPropagation()
                    console.log('Delete session:', session.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Dr. Ubyfol - Especialista em Nutrição Foliar
            </div>
          </div>
        </div>
      </div>
    </>
  )
}