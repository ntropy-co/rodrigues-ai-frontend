'use client'

import { useState, useEffect, useRef } from 'react'
import { X, MessageSquare, Trash2, Plus } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { usePlaygroundStore } from '@/store'
import useSessionLoader from '@/hooks/useSessionLoader'
import useChatActions from '@/hooks/useChatActions'
import { deletePlaygroundSessionAPI } from '@/api/playground'
import { toast } from 'sonner'
import { SessionSkeletonList } from './SessionSkeleton'

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
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const sessionsData = usePlaygroundStore((state) => state.sessionsData)
  const isSessionsLoading = usePlaygroundStore((state) => state.isSessionsLoading)
  const selectedEndpoint = usePlaygroundStore((state) => state.selectedEndpoint)
  const setMessages = usePlaygroundStore((state) => state.setMessages)

  const { getSession, getSessions } = useSessionLoader()
  const { createNewSession } = useChatActions()

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement
      // Focus close button when sidebar opens
      setTimeout(() => closeButtonRef.current?.focus(), 100)
    } else {
      // Restore focus when sidebar closes
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  // Keyboard navigation - ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

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
      const convertedSessions = sessionsData.map(session => ({
        id: session.session_id,
        title: session.title || 'Nova Conversa',
        lastMessage: session.title || '',
        timestamp: new Date(session.created_at * 1000).toLocaleDateString('pt-BR')
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

  const handleDeleteSession = async (sessionIdToDelete: string) => {
    if (!agentId) {
      toast.error('Nenhum agente selecionado')
      return
    }

    try {
      setDeletingSessionId(sessionIdToDelete)

      const response = await deletePlaygroundSessionAPI(
        selectedEndpoint,
        agentId,
        sessionIdToDelete
      )

      if (!response.ok) {
        throw new Error('Falha ao deletar sessão')
      }

      toast.success('Conversa deletada com sucesso')

      // If the deleted session is the current one, clear messages and create a new session
      if (sessionIdToDelete === sessionId) {
        setMessages([])
        createNewSession()
      }

      // Refresh the sessions list
      await getSessions(agentId)
    } catch (error) {
      toast.error('Erro ao deletar conversa')
      console.error('Delete session error:', error)
    } finally {
      setDeletingSessionId(null)
    }
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
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de conversas"
        className="fixed left-0 top-0 z-50 h-full w-[85%] sm:w-80 bg-background border-r border-border shadow-xl transform transition-transform duration-300"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-gemini-blue"
              aria-label="Fechar menu de conversas"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Nova Conversa */}
          <div className="p-4 border-b border-border">
            <button 
              onClick={handleNewConversation}
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-dashed border-border hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Nova Conversa</span>
            </button>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isSessionsLoading ? (
              <SessionSkeletonList />
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Nenhuma conversa</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Suas conversas aparecerão aqui</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`group flex items-start gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                    sessionId === session.id ? 'bg-muted' : ''
                  }`}
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
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSession(session.id)
                  }}
                  disabled={deletingSessionId === session.id}
                  title="Deletar conversa"
                  aria-label="Deletar conversa"
                >
                  {deletingSessionId === session.id ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground text-center">
              Rodrigues AI - Especialista em Crédito Agro e CPR
            </div>
          </div>
        </div>
      </div>
    </>
  )
}