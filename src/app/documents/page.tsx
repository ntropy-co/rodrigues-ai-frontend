'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Search, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDocuments } from '@/hooks/useDocuments'
import { FileList } from '@/components/v2/FileUpload/FileList'
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
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-900/50">
      <div className="container mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-2 text-muted-foreground"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Meus Documentos
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie todos os arquivos enviados para análise.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background pl-9"
            />
          </div>
          <div className="w-full sm:w-[180px]">
            <Select
              value={sortOrder}
              onValueChange={(v: 'asc' | 'desc') => setSortOrder(v)}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Mais recentes</SelectItem>
                <SelectItem value="asc">Mais antigos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List content */}
        <Card>
          <CardContent className="p-0">
            {authLoading || docsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>Carregando documentos...</p>
              </div>
            ) : (
              <div className="p-4">
                {documents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                    <div className="mb-4 rounded-full bg-muted/50 p-4">
                      <FileText className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground">
                      Nenhum documento encontrado
                    </h3>
                    <p className="mx-auto mt-2 max-w-xs text-sm">
                      Seus documentos enviados aparecerão aqui. Envie arquivos
                      através do chat para começar.
                    </p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <p>Nenhum resultado para &ldquo;{searchQuery}&rdquo;</p>
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
          </CardContent>
        </Card>

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
