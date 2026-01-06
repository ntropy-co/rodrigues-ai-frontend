'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  MoreVertical,
  LayoutGrid,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { chatApi, type Project, type SessionEntry } from '@/features/chat'
import { formatRelativeTime } from '@/lib/utils/time'

export default function ProjectHubPage() {
  const { id } = useParams()
  const router = useRouter()
  const projectId = Array.isArray(id) ? id[0] : id

  const [project, setProject] = useState<Project | null>(null)
  const [sessions, setSessions] = useState<SessionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!projectId) return

      try {
        setLoading(true)
        const [projectData, sessionsData] = await Promise.all([
          chatApi.getProject(projectId),
          chatApi.getSessions(projectId)
        ])
        setProject(projectData)
        setSessions(sessionsData)
      } catch (err) {
        console.error('Error loading project:', err)
        setError('Não foi possível carregar o projeto')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [projectId])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-verity-600 border-t-transparent" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sand-200 text-verity-400">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold text-verity-900">
          Projeto não encontrado
        </h2>
        <p className="text-sm text-verity-600">
          O projeto que você procura não existe ou foi removido.
        </p>
        <Button onClick={() => router.push('/dashboard')} variant="outline">
          Voltar para Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-sand-100 p-6 md:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="-ml-2 mb-4 text-verity-600 hover:text-verity-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-verity-900">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-2 text-lg text-verity-600">
                {project.description}
              </p>
            )}
            <div className="mt-4 flex items-center gap-4 text-sm text-verity-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Criado em{' '}
                {new Date(project.created_at).toLocaleDateString('pt-BR')}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                {sessions.length} conversas
              </span>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="text-verity-600">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Grid de Conversas */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="mb-4 font-display text-xl font-semibold text-verity-900">
          Conversas do Projeto
        </h2>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-sand-400 bg-sand-50 p-12 text-center">
            <MessageSquare className="mx-auto mb-4 h-8 w-8 text-verity-300" />
            <h3 className="mb-1 font-medium text-verity-900">
              Nenhuma conversa ainda
            </h3>
            <p className="mb-4 text-sm text-verity-500">
              Inicie uma nova análise associada a este projeto.
            </p>
            <Button
              onClick={() => router.push(`/chat?project_id=${project.id}`)}
            >
              Nova Conversa
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <button
                key={session.session_id}
                onClick={() => router.push(`/chat/${session.session_id}`)}
                className="group flex flex-col gap-3 rounded-xl border border-sand-300 bg-white p-5 text-left shadow-sm transition-all hover:border-verity-300 hover:shadow-md"
              >
                <div className="flex w-full items-start justify-between">
                  <span className="line-clamp-2 font-medium text-verity-900 group-hover:text-verity-800">
                    {session.title}
                  </span>
                  <ArrowRightIcon className="mt-1 h-4 w-4 text-sand-400 transition-transform group-hover:translate-x-1 group-hover:text-verity-500" />
                </div>
                <div className="mt-auto flex items-center gap-2 text-xs text-verity-500">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(session.created_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
