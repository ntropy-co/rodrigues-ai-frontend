export type IssueSeverity = 'critical' | 'alert' | 'suggestion'

export interface AnalysisIssue {
  type: IssueSeverity
  field: string
  message: string
  location?: string
  suggestion?: string
}

export interface AnalysisSuggestion {
  type: 'improvement'
  field: string
  message: string
  current?: string
  suggested?: string
}

export interface AnalysisResultData {
  documentId: string
  status: 'ok' | 'attention' | 'critical'
  score: number
  issues: AnalysisIssue[]
  suggestions: AnalysisSuggestion[]
  processedAt: string
}
