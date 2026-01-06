'use client'

import { useState, useEffect, useCallback, useRef, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Search,
  Plus,
  MessageSquare,
  ChevronLeft,
  Loader2,
  SquarePen,
  LayoutGrid,
  Trash2,
  Maximize2,
  FolderInput
} from 'lucide-react'
import { ProjectDialog } from './ProjectDialog'
import { MoveToProjectDialog } from './MoveToProjectDialog'
import { cn } from '@/lib/utils'
import { useSessions } from '../hooks/useSessions'
import { useProjects, type Project } from '../hooks/useProjects'
import { useDebounce } from '@/hooks/useDebounce'
import { formatRelativeTime } from '@/lib/utils/time'
import type { SessionEntry } from '../types'
import {
  trackConversationSelected,
  trackSearch,
  trackProjectSelected
} from '@/lib/analytics'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
// Spring animation config (Claude-inspired)
const sidebarSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
  mass: 1
}

interface ConversationsSidebarProps {
  isOpen?: boolean
  overlay?: boolean
  onToggle?: () => void
  activeConversationId?: string | null
  onSelectConversation?: (id: string) => void
  onNewConversation?: () => void
}

export function ConversationsSidebar({
  isOpen = true,
  overlay = false,
  onToggle,
  activeConversationId,
  onSelectConversation,
  onNewConversation
}: ConversationsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  )
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedProjectId = localStorage.getItem('verity_active_project')
    if (savedProjectId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedProjectId(savedProjectId)
    }
  }, [])

  // Persist selection changes
  const handleProjectSelect = useCallback((projectId: string | null) => {
    setSelectedProjectId(projectId)
    if (projectId) {
      localStorage.setItem('verity_active_project', projectId)
      trackProjectSelected(projectId)
    } else {
      localStorage.removeItem('verity_active_project')
    }
  }, [])
  const {
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    loading: sessionsLoading
  } = useSessions()
  const {
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    loading: projectsLoading
  } = useProjects()

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((err) => {
        console.error('[ConversationsSidebar] Error fetching projects:', err)
      })
  }, [fetchProjects])

  // Fetch sessions when selectedProjectId changes
  useEffect(() => {
    fetchSessions(selectedProjectId)
      .then(setSessions)
      .catch((err) => {
        console.error('[ConversationsSidebar] Error fetching sessions:', err)
      })
  }, [fetchSessions, selectedProjectId])

  // Memoized handlers to prevent re-renders of child components
  const handleUpdateSession = useCallback(
    async (id: string, data: { title?: string }) => {
      await updateSession(id, data)
      fetchSessions(selectedProjectId)
        .then(setSessions)
        .catch((err) => {
          console.error(
            '[ConversationsSidebar] Error refreshing sessions:',
            err
          )
        })
    },
    [updateSession, fetchSessions, selectedProjectId]
  )

  const handleUpdateProject = useCallback(
    async (id: string, data: { title?: string }) => {
      await updateProject(id, data)
      fetchProjects()
        .then(setProjects)
        .catch((err) => {
          console.error(
            '[ConversationsSidebar] Error refreshing projects:',
            err
          )
        })
    },
    [updateProject, fetchProjects]
  )

  const handleCreateProject = useCallback(
    async (data: { title: string }) => {
      await createProject(data)
      fetchProjects()
        .then(setProjects)
        .catch((err) => {
          console.error(
            '[ConversationsSidebar] Error refreshing projects:',
            err
          )
        })
    },
    [createProject, fetchProjects]
  )

  const handleOpenProjectDialog = useCallback(() => {
    setIsProjectDialogOpen(true)
  }, [])

  // Memoized handlers to prevent re-renders from inline functions
  const handleSelectAndClose = useCallback(
    (id: string) => {
      onSelectConversation?.(id)
      onToggle?.()
    },
    [onSelectConversation, onToggle]
  )

  const handleDeleteSession = useCallback(
    async (id: string) => {
      await deleteSession(id)
      fetchSessions(selectedProjectId).then(setSessions)
    },
    [deleteSession, fetchSessions, selectedProjectId]
  )

  const handleDeleteProject = useCallback(
    async (id: string) => {
      await deleteProject(id)
      fetchProjects().then(setProjects)
    },
    [deleteProject, fetchProjects]
  )

  const handleNewAnalysis = useCallback(async () => {
    if (selectedProjectId) {
      const newSession = await createSession(undefined, selectedProjectId)
      if (newSession && onSelectConversation) {
        onSelectConversation(newSession.session_id)
        // Update list
        fetchSessions(selectedProjectId)
          .then(setSessions)
          .catch((err) => {
            console.error(
              '[ConversationsSidebar] Error refreshing sessions:',
              err
            )
          })
        if (onToggle) onToggle()
      }
    } else {
      onNewConversation?.()
    }
  }, [
    selectedProjectId,
    createSession,
    onSelectConversation,
    fetchSessions,
    onToggle,
    onNewConversation
  ])

  if (overlay) {
    return (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onToggle}
          className="fixed inset-0 z-40 bg-verity-950/20 backdrop-blur-sm"
        />

        {/* Sidebar */}
        <motion.aside
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={sidebarSpring}
          className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r border-sand-300 bg-sand-200"
        >
          <SidebarContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onToggle={onToggle}
            onNewConversation={handleNewAnalysis}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectAndClose}
            showCloseButton={true}
            sessions={sessions}
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelectProject={handleProjectSelect}
            sessionsLoading={sessionsLoading}
            projectsLoading={projectsLoading}
            onUpdateSession={handleUpdateSession}
            onUpdateProject={handleUpdateProject}
            onDeleteSession={handleDeleteSession}
            onDeleteProject={handleDeleteProject}
            onOpenProjectDialog={handleOpenProjectDialog}
          />
        </motion.aside>

        {/* Project Dialog */}
        <ProjectDialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          onSubmit={handleCreateProject}
        />
      </>
    )
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? 280 : 0 }}
      transition={sidebarSpring}
      className="relative flex-shrink-0 overflow-hidden border-r border-sand-300 bg-sand-200"
    >
      <div className="flex h-full w-[280px] flex-col">
        <SidebarContent
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggle={onToggle}
          onNewConversation={handleNewAnalysis}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          showCloseButton={false}
          sessions={sessions}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onSelectProject={handleProjectSelect}
          sessionsLoading={sessionsLoading}
          projectsLoading={projectsLoading}
          onUpdateSession={handleUpdateSession}
          onUpdateProject={handleUpdateProject}
          onDeleteSession={handleDeleteSession}
          onDeleteProject={handleDeleteProject}
          onOpenProjectDialog={handleOpenProjectDialog}
        />

        {/* Project Dialog */}
        <ProjectDialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          onSubmit={handleCreateProject}
        />
      </div>
    </motion.aside>
  )
}

interface SidebarContentProps {
  searchQuery: string
  setSearchQuery: (q: string) => void
  onToggle?: () => void
  onNewConversation?: () => void
  activeConversationId?: string | null
  onSelectConversation?: (id: string) => void
  showCloseButton: boolean
  sessions: SessionEntry[]
  projects: Project[]
  selectedProjectId: string | null
  onSelectProject: (id: string | null) => void
  sessionsLoading: boolean
  projectsLoading: boolean
  onUpdateSession: (
    id: string,
    data: { title?: string; project_id?: string | null }
  ) => Promise<unknown>
  onUpdateProject: (id: string, data: { title?: string }) => Promise<unknown>
  onDeleteSession: (id: string) => Promise<void>
  onDeleteProject: (id: string) => Promise<void>
  onOpenProjectDialog: () => void
}

// Inner content component to avoid duplication - memoized to prevent re-renders
const SidebarContent = memo(function SidebarContent({
  searchQuery,
  setSearchQuery,
  onToggle,
  onNewConversation,
  activeConversationId,
  onSelectConversation,
  showCloseButton,
  sessions,
  projects,
  selectedProjectId,
  onSelectProject,
  sessionsLoading,
  projectsLoading,
  onUpdateSession,
  onUpdateProject,
  onDeleteSession,
  onDeleteProject,
  onOpenProjectDialog
}: SidebarContentProps) {
  // Debounce the search query for filtering (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Debounced search tracking (1s delay, min 2 chars)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Add state for moving conversation
  const [moveSessionId, setMoveSessionId] = useState<string | null>(null)
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false)

  // State for expanding lists
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(false)
  const [isConversationsExpanded, setIsConversationsExpanded] = useState(false)

  const handleMoveSession = async (projectId: string) => {
    if (!moveSessionId) return

    await onUpdateSession(moveSessionId, { project_id: projectId })
    setMoveSessionId(null)
    // setIsMoveDialogOpen(false) handled by dialog
  }

  const openMoveDialog = (sessionId: string) => {
    setMoveSessionId(sessionId)
    setIsMoveDialogOpen(true)
  }

  // Filter sessions based on debounced search query
  const filteredSessions = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return sessions
    }
    return sessions.filter((session) =>
      session.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    )
  }, [sessions, debouncedSearchQuery])

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Only track if query has at least 2 characters
    if (debouncedSearchQuery.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearch(debouncedSearchQuery, filteredSessions.length)
      }, 700) // Additional 700ms debounce for analytics tracking
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [debouncedSearchQuery, filteredSessions.length])

  // Wrapper to track project selection
  const handleProjectSelect = useCallback(
    (projectId: string | null) => {
      if (projectId) {
        trackProjectSelected(projectId)
      }
      onSelectProject(projectId)
    },
    [onSelectProject]
  )

  return (
    <>
      {/* Header Area: Search Only */}
      <div className="flex items-center gap-2 border-b border-sand-300/50 bg-sand-200/50 p-3 backdrop-blur-sm">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-verity-500" />
          <input
            type="search"
            placeholder="Buscar"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-sand-300 bg-white/50 px-3 pl-9 text-sm text-verity-950 transition-all placeholder:text-verity-500 focus:border-verity-600 focus:outline-none focus:ring-0"
          />
        </div>

        {showCloseButton && (
          <button
            onClick={onToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-sand-300 text-verity-600 hover:bg-verity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 pt-4">
        {/* Projetos Section */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between px-2">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-verity-600">
              Projetos
            </h3>
            <button
              onClick={onOpenProjectDialog}
              className="rounded-md p-1 text-verity-500 hover:bg-verity-100 hover:text-verity-900"
              title="Novo Projeto"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-3 w-3 animate-spin text-verity-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="px-3 py-1 text-center">
              <p className="text-xs text-verity-400">Sem projetos</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {projects
                .slice(0, isProjectsExpanded ? undefined : 3)
                .map((project) => (
                  <ConversationCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    timestamp={formatRelativeTime(new Date(project.created_at))}
                    isActive={selectedProjectId === project.id}
                    onClick={() =>
                      handleProjectSelect(
                        selectedProjectId === project.id ? null : project.id
                      )
                    }
                    onUpdateTitle={(newTitle) =>
                      onUpdateProject(project.id, { title: newTitle })
                    }
                    onDelete={() => onDeleteProject(project.id)}
                    onViewDetails={() =>
                      (window.location.href = `/projects/${project.id}`)
                    }
                  />
                ))}

              <AnimatePresence>
                {isProjectsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-0.5 overflow-hidden"
                  >
                    {projects.slice(3).map((project) => (
                      <ConversationCard
                        key={project.id}
                        id={project.id}
                        title={project.title}
                        timestamp={formatRelativeTime(
                          new Date(project.created_at)
                        )}
                        isActive={selectedProjectId === project.id}
                        onClick={() =>
                          handleProjectSelect(
                            selectedProjectId === project.id ? null : project.id
                          )
                        }
                        onUpdateTitle={(newTitle) =>
                          onUpdateProject(project.id, { title: newTitle })
                        }
                        onDelete={() => onDeleteProject(project.id)}
                        onViewDetails={() =>
                          (window.location.href = `/projects/${project.id}`)
                        }
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View More Projects */}
              {projects.length > 3 && (
                <button
                  onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                  className="mt-1 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-verity-500 transition-colors hover:bg-sand-200 hover:text-verity-900"
                >
                  <span className="flex-1">
                    {isProjectsExpanded ? 'Ver menos' : 'Ver todos os projetos'}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] opacity-70 transition-transform',
                      isProjectsExpanded && 'rotate-180'
                    )}
                  >
                    {'->'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Conversas Section */}
        <div className="mb-4">
          <div className="mb-2.5 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-verity-600">
                Conversas
              </h3>
              {selectedProjectId && (
                <span className="rounded-full bg-sand-300 px-1.5 py-0.5 text-[10px] font-medium text-verity-900">
                  Filtrado
                </span>
              )}
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onNewConversation}
                    className="rounded-md p-1 text-verity-500 hover:bg-sand-200 hover:text-verity-900"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Nova Conversa</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {sessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-verity-600" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="px-3 py-4 text-center">
              <MessageSquare className="mx-auto h-8 w-8 text-verity-300" />
              <p className="mt-2 text-sm text-verity-500">
                {debouncedSearchQuery
                  ? 'Nenhuma conversa encontrada'
                  : 'Nenhuma conversa ainda'}
              </p>
              {!debouncedSearchQuery && (
                <p className="text-xs text-verity-400">
                  Inicie uma nova análise
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredSessions
                .slice(0, isConversationsExpanded ? undefined : 5)
                .map((session) => (
                  <ConversationCard
                    key={session.session_id}
                    id={session.session_id}
                    title={session.title}
                    timestamp={formatRelativeTime(session.created_at)}
                    isActive={activeConversationId === session.session_id}
                    onClick={() => {
                      trackConversationSelected(session.session_id, 'sidebar')
                      onSelectConversation?.(session.session_id)
                    }}
                    onUpdateTitle={(newTitle) =>
                      onUpdateSession(session.session_id, { title: newTitle })
                    }
                    onDelete={() => onDeleteSession(session.session_id)}
                    onMove={() => openMoveDialog(session.session_id)}
                  />
                ))}

              <AnimatePresence>
                {isConversationsExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-1 overflow-hidden"
                  >
                    {filteredSessions.slice(5).map((session) => (
                      <ConversationCard
                        key={session.session_id}
                        id={session.session_id}
                        title={session.title}
                        timestamp={formatRelativeTime(session.created_at)}
                        isActive={activeConversationId === session.session_id}
                        onClick={() => {
                          trackConversationSelected(
                            session.session_id,
                            'sidebar'
                          )
                          onSelectConversation?.(session.session_id)
                        }}
                        onUpdateTitle={(newTitle) =>
                          onUpdateSession(session.session_id, {
                            title: newTitle
                          })
                        }
                        onDelete={() => onDeleteSession(session.session_id)}
                        onMove={() => openMoveDialog(session.session_id)}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View More History */}
              {filteredSessions.length > 5 && (
                <button
                  onClick={() =>
                    setIsConversationsExpanded(!isConversationsExpanded)
                  }
                  className="mt-1 flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-verity-500 transition-colors hover:bg-verity-50 hover:text-verity-900"
                >
                  <span className="flex-1">
                    {isConversationsExpanded
                      ? 'Ver menos'
                      : 'Ver histórico completo'}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] opacity-70 transition-transform',
                      isConversationsExpanded && 'rotate-180'
                    )}
                  >
                    {'->'}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <MoveToProjectDialog
        open={isMoveDialogOpen}
        onOpenChange={setIsMoveDialogOpen}
        projects={projects}
        currentProjectId={selectedProjectId}
        onSubmit={handleMoveSession}
      />
    </>
  )
})

interface ConversationCardProps {
  id: string
  title: string
  timestamp: string
  projectEmail?: string
  preview?: string
  isActive?: boolean
  unreadCount?: number
  onClick?: () => void
  onUpdateTitle?: (title: string) => void
  onDelete?: () => void
  onViewDetails?: () => void
  onMove?: () => void
}

const ConversationCard = memo(function ConversationCard({
  title,
  timestamp,
  projectEmail,
  preview,
  isActive = false,
  unreadCount = 0,
  onClick,
  onUpdateTitle,
  onDelete,
  onViewDetails,
  onMove
}: ConversationCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Update editTitle when title prop changes
  useEffect(() => {
    setEditTitle(title)
  }, [title])

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    onDelete?.()
    setIsDeleteDialogOpen(false)
  }, [onDelete])

  const handleSave = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()
      e?.stopPropagation()

      if (editTitle.trim() && editTitle !== title) {
        await onUpdateTitle?.(editTitle)
      }
      setIsEditing(false)
    },
    [editTitle, title, onUpdateTitle]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave()
      } else if (e.key === 'Escape') {
        setEditTitle(title)
        setIsEditing(false)
        e.stopPropagation()
      }
    },
    [handleSave, title]
  )

  const handleInputClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick?.()
        }
      }}
      whileHover={{
        scale: 1.01,
        backgroundColor: isActive
          ? 'rgba(232, 243, 237, 1)'
          : 'rgba(232, 243, 237, 0.5)'
      }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'group relative flex w-full cursor-pointer flex-col rounded-lg border-l-2 px-3 py-1.5 text-left outline-none transition-all duration-200',
        isActive
          ? 'border-verity-600 bg-sand-300 text-verity-950 shadow-sm'
          : 'border-transparent bg-transparent text-verity-900 hover:border-verity-300 hover:bg-sand-200 hover:text-verity-950'
      )}
    >
      {/* Conteúdo */}
      <div className="min-w-0 flex-1">
        {/* Título + Badge */}
        <div className="mb-0.5 flex h-6 items-center gap-2">
          {isEditing ? (
            <input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={() => handleSave()}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              className="h-6 w-full rounded border border-verity-300 bg-white px-1 text-sm text-verity-950 focus:border-verity-500 focus:outline-none"
            />
          ) : (
            <>
              <p
                className={cn(
                  'truncate text-sm transition-all group-hover:pr-12',
                  isActive
                    ? 'font-semibold text-verity-950'
                    : 'font-medium text-verity-900'
                )}
              >
                {title}
              </p>

              {/* Timestamp (Hidden by default, shown on hover, inline) */}
              <span className="absolute right-3 top-2 text-xs font-light text-verity-400 opacity-0 transition-opacity group-hover:opacity-100">
                {timestamp}
              </span>

              {/* Edit Icon on Hover */}
              {onUpdateTitle && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                  }}
                  className="rounded p-1 text-verity-600 opacity-0 transition-opacity hover:bg-sand-200 group-hover:opacity-100"
                  title="Renomear"
                >
                  <SquarePen className="h-3.5 w-3.5" />
                </button>
              )}

              {/* View Details Icon on Hover */}
              {onViewDetails && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails()
                  }}
                  className="rounded p-1 text-verity-600 opacity-0 transition-opacity hover:bg-sand-200 group-hover:opacity-100"
                  title="Abrir Detalhes do Projeto"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Move Icon on Hover (New) */}
              {onMove && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMove()
                  }}
                  className="rounded p-1 text-verity-600 opacity-0 transition-opacity hover:bg-sand-200 group-hover:opacity-100"
                  title="Mover para Projeto"
                >
                  <FolderInput className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Delete Icon on Hover */}
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="rounded p-1 text-error-500 opacity-100 transition-opacity hover:bg-error-100 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Excluir"
                  aria-label="Excluir conversa"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          )}

          {/* Unread badge (only show when not editing) */}
          {!isEditing && unreadCount > 0 && (
            <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-verity-600 text-xs font-semibold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>

        {/* Preview (se houver) */}
        {preview && (
          <p className="mb-1 truncate text-xs font-light text-verity-600">
            {preview}
          </p>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir &quot;{title}&quot;? Esta acao nao
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-error-600 text-white hover:bg-error-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
})

// Collapse Toggle Button (for when sidebar is collapsed)
export function ConversationsSidebarToggle({
  onClick
}: {
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={onClick}
      className="absolute left-4 top-20 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-verity-200 bg-white text-verity-700 shadow-md transition-colors hover:bg-verity-50 hover:text-verity-900"
      aria-label="Abrir conversas"
    >
      <MessageSquare className="h-5 w-5" />
    </motion.button>
  )
}
