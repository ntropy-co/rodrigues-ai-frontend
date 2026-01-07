import { FileText, ExternalLink } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip/tooltip'

interface CitationCardProps {
  id: string
  pageNumber?: number
  previewText?: string
  sourceName?: string
  onClick?: () => void
}

export function CitationCard({
  id,
  pageNumber,
  previewText = 'No preview available.',
  sourceName = 'Document',
  onClick
}: CitationCardProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onClick={onClick}
            className="mx-0.5 inline-flex cursor-pointer items-center justify-center rounded-sm bg-verity-100 px-1.5 py-0.5 align-baseline text-xs font-semibold text-verity-800 transition-colors hover:bg-verity-200 hover:text-verity-900"
          >
            {id}
          </span>
        </TooltipTrigger>
        <TooltipContent className="z-50 w-80 border-verity-200 bg-white p-4 shadow-xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between border-b border-verity-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-medium text-verity-700">
                <FileText className="h-3 w-3" />
                <span className="max-w-[180px] truncate">{sourceName}</span>
              </div>
              {pageNumber && (
                <span className="rounded bg-verity-50 px-1.5 py-0.5 text-[10px] text-verity-600">
                  Página {pageNumber}
                </span>
              )}
            </div>

            <p className="line-clamp-4 text-sm italic leading-relaxed text-verity-900/80">
              &ldquo;{previewText}&rdquo;
            </p>

            <button
              className="mt-2 flex items-center justify-end gap-1 text-xs text-verity-600 hover:text-verity-800 hover:underline"
              onClick={onClick}
            >
              Ver no documento <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
