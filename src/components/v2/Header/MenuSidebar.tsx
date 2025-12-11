'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  MessageSquare,
  Trash2,
  Plus,
  AlertTriangle,
  Search,
  Loader2
} from 'lucide-react'
import { usePlaygroundStore } from '@/store'
import { useSessions } from '@/hooks/useSessions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

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
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const sessionId = usePlaygroundStore((state) => state.sessionId)
  const setSessionId = usePlaygroundStore((state) => state.setSessionId)
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingSessions, setIsLoadingSessions] = useState(false)

  const setSessionsData = usePlaygroundStore((state) => state.setSessionsData)

  const {
    fetchSessions,
    createSession,
    deleteSession,
    loading: sessionsApiLoading
  } = useSessions()

  // Fetch sessions from API on mount and when sidebar opens
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true)
    try {
      const sessionsFromApi = await fetchSessions()
      // Update store with sessions
      setSessionsData(sessionsFromApi)
      // Convert to local format
      const convertedSessions = sessionsFromApi.map((session) => ({
        id: session.session_id,
        title: session.title || 'Nova Conversa',
        lastMessage: session.title || '',
        timestamp: new Date(session.created_at * 1000).toLocaleDateString(
          'pt-BR'
        )
      }))
      setSessions(convertedSessions)
    } catch (error) {
      console.error('[MenuSidebar] Error loading sessions:', error)
    } finally {
      setIsLoadingSessions(false)
    }
  }, [fetchSessions, setSessionsData])

  // Load sessions when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadSessions()
    }
  }, [isOpen, loadSessions])

  const handleSessionClick = async (sessionIdToLoad: string) => {
    if (sessionIdToLoad !== sessionId) {
      setSessionId(sessionIdToLoad)
      // Clear messages - they will be loaded from the conversation
      setMessages([])
      // Navigate to session URL
      router.push(`/chat/${sessionIdToLoad}`)
      onClose()
    }
  }

  const handleNewConversation = async () => {
    // Create session via API
    const newSession = await createSession()

    if (newSession) {
      // Clear current messages and set new session ID
      setMessages([])
      setSessionId(newSession.session_id)

      // Add to local sessions list
      setSessions((prev) => [
        {
          id: newSession.session_id,
          title: newSession.title || 'Nova Conversa',
          lastMessage: '',
          timestamp: new Date(newSession.created_at * 1000).toLocaleDateString(
            'pt-BR'
          )
        },
        ...prev
      ])

      // Navigate to new session
      router.push(`/chat/${newSession.session_id}`)
    } else {
      // Fallback: just clear and navigate to /chat
      setMessages([])
      setSessionId(null)
      router.push('/chat')
    }

    onClose()
  }

  const handleDeleteClick = (session: ChatSession) => {
    setSessionToDelete(session)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (sessionToDelete) {
      // Delete session via API
      const success = await deleteSession(sessionToDelete.id)

      if (success) {
        // Remove from local state
        setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id))

        // Update store
        setSessionsData(
          (prevSessions) =>
            prevSessions?.filter((s) => s.session_id !== sessionToDelete.id) ??
            null
        )

        // If deleted session is current, navigate to new chat
        if (sessionId === sessionToDelete.id) {
          setMessages([])
          setSessionId(null)
          router.push('/chat')
        }
      }

      setDeleteDialogOpen(false)
      setSessionToDelete(null)
    }
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setSessionToDelete(null)
  }

  // Filter sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions

    const query = searchQuery.toLowerCase()
    return sessions.filter(
      (session) =>
        session.title.toLowerCase().includes(query) ||
        session.lastMessage.toLowerCase().includes(query)
    )
  }, [sessions, searchQuery])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-safe:backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        id="navigation-sidebar"
        className="fixed left-0 top-0 z-50 h-full w-full max-w-[280px] transform border-r border-border bg-background shadow-xl transition-transform duration-300 sm:w-80 sm:max-w-none"
        role="navigation"
        aria-label="Menu de navegação e conversas"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-lg font-semibold text-foreground">Conversas</h2>
            <button
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors hover-hover:bg-muted"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Nova Conversa */}
          <div className="border-b border-border p-4">
            <button
              onClick={handleNewConversation}
              className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border p-3 transition-colors hover-hover:bg-muted"
            >
              <Plus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Nova Conversa
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                aria-label="Buscar conversas"
              />
            </div>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {isLoadingSessions || sessionsApiLoading ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <div className="mt-2 text-sm text-muted-foreground">
                  Carregando conversas...
                </div>
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'Nenhuma conversa encontrada'
                    : 'Nenhuma conversa anterior'}
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-2 text-xs text-gemini-blue hover-hover:underline"
                  >
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSessionClick(session.id)}
                  className={`group flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover-hover:bg-muted ${
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
                    className="group-hover-hover:opacity-100 flex min-h-[44px] min-w-[44px] flex-shrink-0 items-center justify-center rounded p-2 opacity-0 transition-all hover-hover:bg-destructive/10 hover-hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteClick(session)
                    }}
                    aria-label="Deletar conversa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-center text-xs text-muted-foreground">
              Verity Agro - Especialista em Crédito Agro e CPR
            </div>
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <DialogTitle>Deletar Conversa</DialogTitle>
            </div>
            <DialogDescription className="pt-3">
              Tem certeza que deseja deletar a conversa{' '}
              <span className="font-semibold text-foreground">
                &ldquo;{sessionToDelete?.title}&rdquo;
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="flex-1"
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
