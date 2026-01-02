'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Loader2, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDocuments } from '@/features/documents'
import { FileList } from '@/features/chat'
import { InternalHeader } from '@/components/layout/InternalHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function DocumentsHistoryPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    documents,
    loading: docsLoading,
    removeDocument,
    downloadDocument
  } = useDocuments()

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Filter and Sort - must be before early return to follow hooks rules
  const filteredDocuments = useMemo(() => {
    let docs = [...documents]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      docs = docs.filter((d) => d.filename.toLowerCase().includes(q))
    }

    docs.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return docs
  }, [documents, searchQuery, sortOrder])

  // Guard - must be after all hooks
  if (!authLoading && !isAuthenticated) {
    router.push('/login')
    return null
  }

  const handleRemove = async () => {
    if (!deleteId) return
    try {
      await removeDocument(deleteId)
      toast.success('Documento removido com sucesso')
      setDeleteId(null)
    } catch {
      toast.error('Erro ao remover documento')
    }
  }

  const handleDownload = async (id: string) => {
    try {
      await downloadDocument(id)
      toast.success('Download iniciado')
    } catch {
      toast.error('Erro ao baixar documento')
    }
  }

  return (
    <div className="min-h-screen bg-sand-100 dark:bg-verity-950">
      <InternalHeader
        title="Meus documentos"
        subtitle="Gerencie todos os arquivos enviados para analise."
        backHref="/chat"
        containerClassName="max-w-5xl"
      />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-verity-400" />
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-sand-300 bg-white pl-9 placeholder:text-verity-300 focus-visible:ring-verity-400 dark:border-verity-800 dark:bg-verity-900"
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select
              value={sortOrder}
              onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}
            >
              <SelectTrigger className="border-sand-300 bg-white dark:border-verity-800 dark:bg-verity-900">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mais recentes</SelectItem>
                <SelectItem value="asc">Mais antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List content (Zero-UI) */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 dark:bg-verity-900/50 dark:ring-white/10">
          {authLoading || docsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-verity-500">
              <Loader2 className="h-6 w-6 animate-spin text-verity-600" />
              <p className="mt-3 text-sm">Carregando documentos...</p>
            </div>
          ) : (
            <div className="p-0">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-verity-500">
                  <div className="mb-4 rounded-full bg-sand-100 p-4 dark:bg-verity-800">
                    <FileText className="h-8 w-8 text-verity-300 dark:text-verity-600" />
                  </div>
                  <h3 className="text-lg font-medium text-verity-900 dark:text-verity-100">
                    Nenhum documento encontrado
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm">
                    Seus documentos enviados aparecerao aqui. Envie arquivos
                    pelo chat para comecar.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 border-verity-200 hover:bg-verity-50 hover:text-verity-900"
                    onClick={() => router.push('/chat')}
                  >
                    Ir para o chat
                  </Button>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-verity-500">
                  <div className="mb-4 rounded-full bg-sand-100 p-4 dark:bg-verity-800">
                    <Search className="h-8 w-8 text-verity-300 dark:text-verity-600" />
                  </div>
                  <h3 className="text-lg font-medium text-verity-900 dark:text-verity-100">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm">
                    Nao encontramos documentos para &quot;{searchQuery}&quot;.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 border-verity-200 hover:bg-verity-50 hover:text-verity-900"
                    onClick={() => setSearchQuery('')}
                  >
                    Limpar busca
                  </Button>
                </div>
              ) : (
                <FileList
                  documents={filteredDocuments}
                  onRemove={(id) => setDeleteId(id)}
                  onDownload={handleDownload}
                />
              )}
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remover documento?</DialogTitle>
              <DialogDescription>
                Esta ação não pode ser desfeita. O arquivo será excluído
                permanentemente.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleRemove}>
                Remover
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
