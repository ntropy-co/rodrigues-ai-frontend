'use client'

import { useState, useEffect } from 'react'
import { X, MessageSquare, Trash2, Plus } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { usePlaygroundStore } from '@/store'
import useSessionLoader from '@/hooks/useSessionLoader'
import useChatActions from '@/hooks/useChatActions'

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
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [agentId] = useQueryState('agent')
  const [sessionId, setSessionId] = useQueryState('session')

  const sessionsData = usePlaygroundStore((state) => state.sessionsData)

  const { getSession, getSessions } = useSessionLoader()
  const { createNewSession } = useChatActions()

  // Carregar sessões quando o agente mudar
  useEffect(() => {
    if (agentId && agentId !== 'no-agents') {
      getSessions(agentId)
    }
  }, [agentId, getSessions])

  // Atualizar lista de conversas periodicamente quando o sidebar estiver aberto
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isOpen && agentId && agentId !== 'no-agents') {
      // Atualizar imediatamente quando abrir
      getSessions(agentId)

      // Configurar atualização a cada 3 segundos
      interval = setInterval(() => {
        getSessions(agentId)
      }, 3000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isOpen, agentId, getSessions])

  // Converter sessionsData para o formato local
  useEffect(() => {
    if (sessionsData) {
      const convertedSessions = sessionsData.map((session) => ({
        id: session.session_id,
        title: session.title || 'Nova Conversa',
        lastMessage: session.title || '',
        timestamp: new Date(session.created_at * 1000).toLocaleDateString(
          'pt-BR'
        )
      }))
      setSessions(convertedSessions)
    } else {
      setSessions([])
    }
  }, [sessionsData])

  const handleSessionClick = async (sessionIdToLoad: string) => {
    if (agentId && sessionIdToLoad !== sessionId) {
      setSessionId(sessionIdToLoad)
      await getSession(sessionIdToLoad, agentId)
      onClose()
    }
  }

  const handleNewConversation = () => {
    // Limpar mensagens atuais e criar nova sessão
    const { setMessages } = usePlaygroundStore.getState()
    setMessages([])
    createNewSession()
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 z-50 h-full w-80 transform border-r border-border bg-background shadow-xl transition-transform duration-300">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Nova Conversa */}
          <div className="border-b border-border p-4">
            <button
              onClick={handleNewConversation}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border p-3 transition-colors hover:bg-muted"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Nova Conversa
              </span>
            </button>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {sessions.length === 0 ? (
              <div className="flex items-center justify-center p-4">
                <div className="text-sm text-muted-foreground">
                  Nenhuma conversa anterior
                </div>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`group flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted ${
                    sessionId === session.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="mt-1 flex-shrink-0">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium text-foreground">
                      {session.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {session.lastMessage}
                    </p>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {session.timestamp}
                    </span>
                  </div>

                  <button
                    className="flex-shrink-0 rounded p-1 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation()
                      console.log('Delete session:', session.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-center text-xs text-muted-foreground">
              Rodrigues AI - Especialista em Crédito Agro e CPR
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
