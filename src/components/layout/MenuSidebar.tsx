'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  X,
  Trash2,
  Plus,
  AlertTriangle,
  Search,
  Loader2,
  TrendingUp,
  Calculator,
  History,
  HelpCircle,
  ShieldCheck
} from 'lucide-react'
import { usePlaygroundStore } from '@/features/chat'
import { useSessions } from '@/features/chat'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { trackConversationSelected } from '@/lib/analytics'

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
      // Track conversation selection
      trackConversationSelected(sessionIdToLoad, 'sidebar')

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
            <h2 className="text-lg font-semibold text-foreground">Histórico</h2>
            <button
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-colors hover-hover:bg-muted"
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Nova Conversa (Enterprise) */}
          <div className="border-b border-verity-200 p-4 dark:border-verity-800">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewConversation}
              className="flex w-full items-center gap-2 rounded-lg bg-verity-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-verity-700"
            >
              <Plus className="h-4 w-4" />
              Nova Conversa
            </motion.button>

            <button
              onClick={() => {
                router.push('/documents')
                onClose()
              }}
              className="mt-3 flex w-full items-center gap-2 rounded-lg border border-verity-200 px-3 py-2 text-sm font-medium text-verity-700 transition-colors hover:bg-verity-50 dark:border-verity-700 dark:text-verity-300 dark:hover:bg-verity-800"
            >
              <Search className="h-4 w-4" />
              Meus Documentos
            </button>
          </div>

          {/* Ferramentas / Navegação */}
          <div className="border-b border-verity-200 p-4 dark:border-verity-800">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-verity-400 dark:text-verity-500">
              Ferramentas
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => {
                  router.push('/quotes')
                  onClose()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-verity-700 transition-colors hover:bg-verity-100 dark:text-verity-300 dark:hover:bg-verity-800"
              >
                <TrendingUp className="h-4 w-4 text-verity-500" />
                Cotações
              </button>

              <button
                onClick={() => {
                  router.push('/compliance')
                  onClose()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-verity-700 transition-colors hover:bg-verity-100 dark:text-verity-300 dark:hover:bg-verity-800"
              >
                <ShieldCheck className="h-4 w-4 text-verity-500" />
                Compliance
              </button>

              <button
                onClick={() => {
                  router.push('/cpr/simulator')
                  onClose()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-verity-700 transition-colors hover:bg-verity-100 dark:text-verity-300 dark:hover:bg-verity-800"
              >
                <Calculator className="h-4 w-4 text-verity-500" />
                Simulador CPR
              </button>

              <button
                onClick={() => {
                  router.push('/cpr/historico')
                  onClose()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-verity-700 transition-colors hover:bg-verity-100 dark:text-verity-300 dark:hover:bg-verity-800"
              >
                <History className="h-4 w-4 text-verity-500" />
                Histórico CPR
              </button>

              <button
                onClick={() => {
                  router.push('/contact')
                  onClose()
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-verity-700 transition-colors hover:bg-verity-100 dark:text-verity-300 dark:hover:bg-verity-800"
              >
                <HelpCircle className="h-4 w-4 text-verity-500" />
                Contato / Suporte
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="border-b border-verity-200 p-4 dark:border-verity-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-verity-400" />
              <input
                type="search"
                placeholder="Buscar analises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                className="w-full rounded-md border border-verity-200 bg-verity-50 py-2.5 pl-9 pr-3 text-sm text-verity-900 placeholder:text-verity-400 focus:border-verity-400 focus:outline-none focus:ring-0 dark:border-verity-700 dark:bg-verity-900 dark:text-verity-100 placeholder:dark:text-verity-600"
                aria-label="Buscar analises"
              />
            </div>
          </div>

          {/* Lista de Conversas (Professional History) */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingSessions || sessionsApiLoading ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin text-verity-400" />
                <div className="mt-2 text-sm text-verity-400">
                  Carregando análises...
                </div>
              </div>
            ) : filteredSessions.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="text-sm text-verity-400">
                  {searchQuery
                    ? 'Nenhuma análise encontrada'
                    : 'Histórico vazio'}
                </div>
              </div>
            ) : (
              <div className="p-2">
                {/* Time section header */}
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-verity-400 dark:text-verity-500">
                  Esta Semana
                </div>

                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleSessionClick(session.id)}
                    className={`group mb-0.5 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 transition-colors hover:bg-verity-100 dark:hover:bg-verity-800 ${
                      sessionId === session.id
                        ? 'bg-verity-100 dark:bg-verity-800'
                        : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <h3
                        className={`truncate text-sm ${
                          sessionId === session.id
                            ? 'font-medium text-verity-900 dark:text-verity-100'
                            : 'text-verity-700 dark:text-verity-300'
                        }`}
                      >
                        {session.title}
                      </h3>
                      <div className="mt-0.5 flex items-center gap-2">
                        <span className="text-[10px] text-verity-400">
                          {session.timestamp}
                        </span>
                        {/* Status badge simulado para dar tom enterprise */}
                        {/* <span className="inline-block h-1.5 w-1.5 rounded-full bg-verity-500"></span> */}
                      </div>
                    </div>

                    <button
                      className="p-1 opacity-100 transition-opacity hover:text-error-600 sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(session)
                      }}
                      aria-label="Excluir conversa"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-verity-400 hover:text-error-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4">
            <div className="text-center text-sm text-muted-foreground">
              Verity Agro — Análise de CPR e Crédito Rural
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
