'use client'

import { useState, useMemo } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, FolderInput, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Project } from '../api'

interface MoveToProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    projects: Project[]
    currentProjectId?: string | null
    onSubmit: (projectId: string) => Promise<void>
}

export function MoveToProjectDialog({
    open,
    onOpenChange,
    projects,
    currentProjectId,
    onSubmit
}: MoveToProjectDialogProps) {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const filteredProjects = useMemo(() => {
        return projects.filter(
            (p) =>
                p.id !== currentProjectId &&
                p.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
    }, [projects, currentProjectId, searchQuery])

    const handleSubmit = async () => {
        if (!selectedProjectId) return

        setIsLoading(true)
        try {
            await onSubmit(selectedProjectId)
            setSelectedProjectId(null)
            onOpenChange(false)
        } catch (error) {
            console.error('Error moving conversation:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Mover Conversa</DialogTitle>
                    <DialogDescription>
                        Selecione o projeto para onde deseja mover esta conversa.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="relative mb-4">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-verity-400" />
                        <Input
                            placeholder="Buscar projeto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                            autoFocus
                        />
                    </div>

                    <div className="flex max-h-[240px] flex-col gap-2 overflow-y-auto">
                        {filteredProjects.length === 0 ? (
                            <p className="py-4 text-center text-sm text-verity-500">
                                {searchQuery ? 'Nenhum projeto encontrado.' : 'Nenhum outro projeto disponível.'}
                            </p>
                        ) : (
                            filteredProjects.map((project) => (
                                <button
                                    key={project.id}
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className={cn(
                                        'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all',
                                        selectedProjectId === project.id
                                            ? 'border-verity-600 bg-verity-50 ring-1 ring-verity-600'
                                            : 'border-sand-300 hover:border-verity-300 hover:bg-sand-50'
                                    )}
                                >
                                    <FolderInput className={cn("h-4 w-4", selectedProjectId === project.id ? "text-verity-600" : "text-verity-400")} />
                                    <span className={cn("text-sm font-medium", selectedProjectId === project.id ? "text-verity-900" : "text-verity-700")}>
                                        {project.title}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-verity-200 text-verity-700 hover:bg-verity-50"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading || !selectedProjectId}
                        className="bg-verity-600 text-white hover:bg-verity-700"
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mover Conversa
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
