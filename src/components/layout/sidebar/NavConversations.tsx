'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Trash2, MoreHorizontal, Loader2 } from 'lucide-react'
import { useSessions } from '@/features/chat'
import { usePlaygroundStore } from '@/features/chat'
import { trackConversationSelected } from '@/lib/analytics'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSkeleton
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ConversationItem {
  id: string
  title: string
  timestamp: string
}

interface NavConversationsProps {
  activeConversationId?: string | null
  onSelectConversation?: (id: string) => void
}

export function NavConversations({
  activeConversationId,
  onSelectConversation
}: NavConversationsProps) {
  const router = useRouter()
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [conversationToDelete, setConversationToDelete] =
    useState<ConversationItem | null>(null)

  const sessionId = usePlaygroundStore((state) => state.sessionId)
  const setSessionId = usePlaygroundStore((state) => state.setSessionId)
  const setMessages = usePlaygroundStore((state) => state.setMessages)
  const setSessionsData = usePlaygroundStore((state) => state.setSessionsData)

  const {
    fetchSessions,
    deleteSession,
    loading: sessionsApiLoading
  } = useSessions()

  const loadConversations = useCallback(async () => {
    setIsLoading(true)
    try {
      const sessionsFromApi = await fetchSessions()
      setSessionsData(sessionsFromApi)
      const converted = sessionsFromApi.map((session) => ({
        id: session.session_id,
        title: session.title || 'Nova Conversa',
        timestamp: new Date(session.created_at * 1000).toLocaleDateString(
          'pt-BR'
        )
      }))
      setConversations(converted)
    } catch (error) {
      console.error('[NavConversations] Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchSessions, setSessionsData])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  const handleSelect = useCallback(
    (id: string) => {
      if (id !== sessionId) {
        trackConversationSelected(id, 'sidebar')
        setSessionId(id)
        setMessages([])
        if (onSelectConversation) {
          onSelectConversation(id)
        } else {
          router.push(`/chat/${id}`)
        }
      }
    },
    [sessionId, setSessionId, setMessages, onSelectConversation, router]
  )

  const handleDeleteClick = useCallback((conv: ConversationItem) => {
    setConversationToDelete(conv)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!conversationToDelete) return

    const success = await deleteSession(conversationToDelete.id)
    if (success) {
      setConversations((prev) =>
        prev.filter((c) => c.id !== conversationToDelete.id)
      )
      setSessionsData(
        (prevSessions) =>
          prevSessions?.filter(
            (s) => s.session_id !== conversationToDelete.id
          ) ?? null
      )
      if (sessionId === conversationToDelete.id) {
        setMessages([])
        setSessionId(null)
        router.push('/chat')
      }
    }

    setDeleteDialogOpen(false)
    setConversationToDelete(null)
  }, [
    conversationToDelete,
    deleteSession,
    sessionId,
    setMessages,
    setSessionId,
    setSessionsData,
    router
  ])

  const displayedConversations = useMemo(
    () => conversations.slice(0, 10),
    [conversations]
  )

  const showLoading = isLoading || sessionsApiLoading

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Conversas</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {showLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SidebarMenuItem key={i}>
                  <SidebarMenuSkeleton showIcon />
                </SidebarMenuItem>
              ))
            ) : displayedConversations.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                Nenhuma conversa ainda.
                <br />
                Inicie uma nova análise!
              </div>
            ) : (
              displayedConversations.map((conv) => (
                <SidebarMenuItem key={conv.id}>
                  <SidebarMenuButton
                    isActive={activeConversationId === conv.id}
                    onClick={() => handleSelect(conv.id)}
                    className="truncate"
                  >
                    <MessageSquare className="shrink-0" />
                    <span className="truncate">{conv.title}</span>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">Mais opções</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="bottom" align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(conv)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))
            )}
            {conversations.length > 10 && (
              <SidebarMenuItem>
                <SidebarMenuButton className="text-sidebar-foreground/70">
                  <MoreHorizontal />
                  <span>Mais {conversations.length - 10} conversas</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deletar Conversa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar a conversa{' '}
              <span className="font-semibold text-foreground">
                &ldquo;{conversationToDelete?.title}&rdquo;
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setConversationToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
