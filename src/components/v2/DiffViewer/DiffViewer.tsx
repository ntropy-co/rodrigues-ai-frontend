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
        'inline-block w-12 flex-shrink-0 select-none pr-3 text-right font-mono text-xs text-gray-500',
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
    added: 'bg-green-50 dark:bg-green-950/30',
    removed: 'bg-red-50 dark:bg-red-950/30',
    unchanged: 'bg-transparent'
  }[line.type]

  const textColor = {
    added: 'text-green-800 dark:text-green-300',
    removed: 'text-red-800 dark:text-red-300',
    unchanged: 'text-gray-900 dark:text-gray-100'
  }[line.type]

  const icon = {
    added: <Plus className="h-3 w-3 text-green-600" aria-hidden="true" />,
    removed: <Minus className="h-3 w-3 text-red-600" aria-hidden="true" />,
    unchanged: <Equal className="h-3 w-3 text-gray-400" aria-hidden="true" />
  }[line.type]

  const ariaLabel = {
    added: `Linha ${line.modifiedLineNumber}, adicionada: ${line.content || '(linha vazia)'}`,
    removed: `Linha ${line.originalLineNumber}, removida: ${line.content || '(linha vazia)'}`,
    unchanged: `Linha ${line.originalLineNumber}, sem alteração`
  }[line.type]

  return (
    <div
      className={cn(
        'flex items-start border-b border-gray-100 dark:border-gray-800',
        bgColor
      )}
      role="row"
      aria-label={ariaLabel}
    >
      {showLineNumbers && (
        <>
          <LineNumber
            num={line.originalLineNumber}
            className="border-r border-gray-200 dark:border-gray-700"
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
    <div className="flex divide-x divide-gray-200 dark:divide-gray-700">
      {/* Original Side */}
      <div className="flex-1 overflow-x-auto">
        <div className="sticky top-0 bg-gray-100 px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
                className="h-8 border-b border-gray-100"
              />
            )
          )}
        </div>
      </div>

      {/* Modified Side */}
      <div className="flex-1 overflow-x-auto">
        <div className="sticky top-0 bg-gray-100 px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
                className="h-8 border-b border-gray-100"
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
      <div className="sticky top-0 bg-gray-100 px-3 py-2 text-xs font-semibold uppercase text-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
      <span className="flex items-center gap-1 text-green-700 dark:text-green-400">
        <Plus className="h-3 w-3" /> {added} adicionada{added !== 1 ? 's' : ''}
      </span>
      <span className="flex items-center gap-1 text-red-700 dark:text-red-400">
        <Minus className="h-3 w-3" /> {removed} removida
        {removed !== 1 ? 's' : ''}
      </span>
      <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
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
        'rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <DiffStats diffLines={diffLines} />

        <div className="flex items-center gap-1 rounded-md bg-gray-100 p-1 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMode('unified')}
            className={cn(
              'h-7 px-2',
              mode === 'unified' && 'bg-white shadow-sm dark:bg-gray-700'
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
              mode === 'split' && 'bg-white shadow-sm dark:bg-gray-700'
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
        <div className="p-8 text-center text-sm text-gray-500">
          Nenhuma diferença encontrada entre os documentos.
        </div>
      )}
    </div>
  )
}
