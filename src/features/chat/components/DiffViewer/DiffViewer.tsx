'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Columns, Rows3, Minus, Plus, Equal } from 'lucide-react'

// =============================================================================
// Types
// =============================================================================

export type DiffMode = 'split' | 'unified'

export interface DiffViewerProps {
  /** Original document text */
  original: string
  /** Modified document text */
  modified: string
  /** View mode: 'split' for side-by-side, 'unified' for inline */
  mode?: DiffMode
  /** Show/hide line numbers */
  showLineNumbers?: boolean
  /** Custom class for container */
  className?: string
}

type DiffLineType = 'added' | 'removed' | 'unchanged'

interface DiffLine {
  type: DiffLineType
  content: string
  originalLineNumber?: number
  modifiedLineNumber?: number
}

// =============================================================================
// Diff Algorithm (Simple LCS-based)
// =============================================================================

/**
 * Simple line-by-line diff using Longest Common Subsequence approach.
 * For production with large documents, consider using a library like 'diff'.
 */
function computeDiff(original: string, modified: string): DiffLine[] {
  const originalLines = original.split('\n')
  const modifiedLines = modified.split('\n')

  // Build LCS table
  const m = originalLines.length
  const n = modifiedLines.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (originalLines[i - 1] === modifiedLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find diff
  let i = m
  let j = n
  const tempResult: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
      tempResult.push({
        type: 'unchanged',
        content: originalLines[i - 1],
        originalLineNumber: i,
        modifiedLineNumber: j
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempResult.push({
        type: 'added',
        content: modifiedLines[j - 1],
        modifiedLineNumber: j
      })
      j--
    } else {
      tempResult.push({
        type: 'removed',
        content: originalLines[i - 1],
        originalLineNumber: i
      })
      i--
    }
  }

  return tempResult.reverse()
}

// =============================================================================
// Sub-components
// =============================================================================

function LineNumber({ num, className }: { num?: number; className?: string }) {
  return (
    <span
      className={cn(
        'text-sand-500 inline-block w-12 flex-shrink-0 select-none pr-3 text-right font-mono text-xs',
        className
      )}
      aria-hidden="true"
    >
      {num ?? ''}
    </span>
  )
}

function DiffLineContent({
  line,
  showLineNumbers
}: {
  line: DiffLine
  showLineNumbers: boolean
}) {
  const bgColor = {
    added: 'bg-verity-50 dark:bg-verity-950/30',
    removed: 'bg-error-50 dark:bg-error-950/30',
    unchanged: 'bg-transparent'
  }[line.type]

  const textColor = {
    added: 'text-verity-800 dark:text-verity-300',
    removed: 'text-error-800 dark:text-error-300',
    unchanged: 'text-verity-900 dark:text-sand-200'
  }[line.type]

  const icon = {
    added: <Plus className="h-3 w-3 text-verity-600" aria-hidden="true" />,
    removed: <Minus className="h-3 w-3 text-error-600" aria-hidden="true" />,
    unchanged: <Equal className="h-3 w-3 text-verity-300" aria-hidden="true" />
  }[line.type]

  const ariaLabel = {
    added: `Linha ${line.modifiedLineNumber}, adicionada: ${line.content || '(linha vazia)'}`,
    removed: `Linha ${line.originalLineNumber}, removida: ${line.content || '(linha vazia)'}`,
    unchanged: `Linha ${line.originalLineNumber}, sem alteração`
  }[line.type]

  return (
    <div
      className={cn(
        'flex items-start border-b border-sand-200 dark:border-verity-800',
        bgColor
      )}
      role="row"
      aria-label={ariaLabel}
    >
      {showLineNumbers && (
        <>
          <LineNumber
            num={line.originalLineNumber}
            className="border-r border-sand-300 dark:border-verity-600"
          />
          <LineNumber num={line.modifiedLineNumber} />
        </>
      )}
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
        {icon}
      </span>
      <pre
        className={cn(
          'flex-1 overflow-x-auto whitespace-pre-wrap break-all py-1 font-mono text-sm',
          textColor
        )}
      >
        {line.content || ' '} {/* Preserve empty lines */}
      </pre>
    </div>
  )
}

// =============================================================================
// Split View
// =============================================================================

function SplitView({
  diffLines,
  showLineNumbers
}: {
  diffLines: DiffLine[]
  showLineNumbers: boolean
}) {
  // Pair up lines for side-by-side display
  const originalLines = diffLines.filter((l) => l.type !== 'added')
  const modifiedLines = diffLines.filter((l) => l.type !== 'removed')

  // Align by creating pairs
  const maxLength = Math.max(originalLines.length, modifiedLines.length)

  return (
    <div className="flex divide-x divide-sand-300 dark:divide-verity-600">
      {/* Original Side */}
      <div className="flex-1 overflow-x-auto">
        <div className="sticky top-0 bg-sand-200 px-3 py-2 text-xs font-semibold uppercase text-verity-500 dark:bg-verity-800 dark:text-verity-300">
          Original
        </div>
        <div role="table" aria-label="Documento original">
          {originalLines.map((line, idx) => (
            <DiffLineContent
              key={`orig-${idx}`}
              line={line}
              showLineNumbers={showLineNumbers}
            />
          ))}
          {/* Pad if needed */}
          {Array.from({ length: maxLength - originalLines.length }).map(
            (_, idx) => (
              <div
                key={`orig-pad-${idx}`}
                className="h-8 border-b border-sand-200"
              />
            )
          )}
        </div>
      </div>

      {/* Modified Side */}
      <div className="flex-1 overflow-x-auto">
        <div className="sticky top-0 bg-sand-200 px-3 py-2 text-xs font-semibold uppercase text-verity-500 dark:bg-verity-800 dark:text-verity-300">
          Modificado
        </div>
        <div role="table" aria-label="Documento modificado">
          {modifiedLines.map((line, idx) => (
            <DiffLineContent
              key={`mod-${idx}`}
              line={line}
              showLineNumbers={showLineNumbers}
            />
          ))}
          {/* Pad if needed */}
          {Array.from({ length: maxLength - modifiedLines.length }).map(
            (_, idx) => (
              <div
                key={`mod-pad-${idx}`}
                className="h-8 border-b border-sand-200"
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// Unified View
// =============================================================================

function UnifiedView({
  diffLines,
  showLineNumbers
}: {
  diffLines: DiffLine[]
  showLineNumbers: boolean
}) {
  return (
    <div role="table" aria-label="Comparação de documentos">
      <div className="sticky top-0 bg-sand-200 px-3 py-2 text-xs font-semibold uppercase text-verity-500 dark:bg-verity-800 dark:text-verity-300">
        Comparação Unificada
      </div>
      {diffLines.map((line, idx) => (
        <DiffLineContent
          key={idx}
          line={line}
          showLineNumbers={showLineNumbers}
        />
      ))}
    </div>
  )
}

// =============================================================================
// Stats Summary
// =============================================================================

function DiffStats({ diffLines }: { diffLines: DiffLine[] }) {
  const added = diffLines.filter((l) => l.type === 'added').length
  const removed = diffLines.filter((l) => l.type === 'removed').length
  const unchanged = diffLines.filter((l) => l.type === 'unchanged').length

  return (
    <div className="flex items-center gap-4 text-xs">
      <span className="flex items-center gap-1 text-verity-700 dark:text-verity-400">
        <Plus className="h-3 w-3" /> {added} adicionada{added !== 1 ? 's' : ''}
      </span>
      <span className="flex items-center gap-1 text-error-700 dark:text-error-400">
        <Minus className="h-3 w-3" /> {removed} removida
        {removed !== 1 ? 's' : ''}
      </span>
      <span className="flex items-center gap-1 text-verity-500 dark:text-verity-300">
        <Equal className="h-3 w-3" /> {unchanged} inalterada
        {unchanged !== 1 ? 's' : ''}
      </span>
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function DiffViewer({
  original,
  modified,
  mode: initialMode = 'unified',
  showLineNumbers = true,
  className
}: DiffViewerProps) {
  const [mode, setMode] = useState<DiffMode>(initialMode)

  const diffLines = useMemo(
    () => computeDiff(original, modified),
    [original, modified]
  )

  return (
    <div
      className={cn(
        'rounded-lg border border-sand-300 bg-white dark:border-verity-600 dark:bg-verity-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand-300 px-4 py-3 dark:border-verity-600">
        <DiffStats diffLines={diffLines} />

        <div className="flex items-center gap-1 rounded-md bg-sand-200 p-1 dark:bg-verity-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('unified')}
            className={cn(
              'h-7 px-2',
              mode === 'unified' && 'bg-white shadow-sm dark:bg-verity-600'
            )}
            aria-pressed={mode === 'unified'}
            aria-label="Visualização unificada"
          >
            <Rows3 className="mr-1 h-3.5 w-3.5" />
            Unificado
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('split')}
            className={cn(
              'h-7 px-2',
              mode === 'split' && 'bg-white shadow-sm dark:bg-verity-600'
            )}
            aria-pressed={mode === 'split'}
            aria-label="Visualização lado a lado"
          >
            <Columns className="mr-1 h-3.5 w-3.5" />
            Lado a Lado
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-auto">
        {mode === 'split' ? (
          <SplitView diffLines={diffLines} showLineNumbers={showLineNumbers} />
        ) : (
          <UnifiedView
            diffLines={diffLines}
            showLineNumbers={showLineNumbers}
          />
        )}
      </div>

      {/* Footer hint */}
      {diffLines.length === 0 && (
        <div className="text-sand-500 p-8 text-center text-sm">
          Nenhuma diferença encontrada entre os documentos.
        </div>
      )}
    </div>
  )
}
