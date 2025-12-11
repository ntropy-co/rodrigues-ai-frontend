/**
 * Chat Files Type Definitions
 *
 * Types for managing files associated with conversations in Verity Agro.
 * Includes uploaded documents (PDFs, spreadsheets) and AI-generated reports.
 */

// ============================================================================
// Enums & Constants
// ============================================================================

/**
 * Tipo do arquivo em relação à conversa
 */
export type ChatFileType = 'upload' | 'generated'

/**
 * Categorias de arquivo para ícones e agrupamento visual
 */
export type FileCategory =
  | 'pdf'
  | 'spreadsheet'
  | 'document'
  | 'image'
  | 'other'

/**
 * Status do processamento do arquivo
 */
export type FileProcessingStatus =
  | 'pending'
  | 'processing'
  | 'complete'
  | 'error'

/**
 * Tipos de análise de CPR específicos do domínio
 */
export type CprAnalysisType =
  | 'cpr_fisica'
  | 'cpr_financeira'
  | 'garantias'
  | 'compliance'
  | 'due_diligence'
  | 'precificacao'

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Metadata específica para análises de CPR e crédito rural
 */
export interface ChatFileMetadata {
  /** Tipo de análise associada ao arquivo */
  analysisType?: CprAnalysisType
  /** Status do processamento da análise */
  status?: FileProcessingStatus
  /** Resumo gerado pela IA */
  summary?: string
  /** Número de páginas (para PDFs) */
  pageCount?: number
  /** Tags para busca e organização */
  tags?: string[]
  /** ID da mensagem que gerou/usou este arquivo */
  messageId?: string
}

/**
 * Arquivo associado a uma conversa
 */
export interface ChatFile {
  /** Identificador único do arquivo */
  id: string
  /** ID da conversa à qual o arquivo pertence */
  conversationId: string
  /** Tipo: upload do usuário ou gerado pela IA */
  type: ChatFileType
  /** Nome original do arquivo */
  fileName: string
  /** Extensão do arquivo (sem ponto) */
  fileExtension: string
  /** Categoria para agrupamento e ícones */
  fileCategory: FileCategory
  /** Tamanho em bytes */
  fileSize: number
  /** MIME type */
  mimeType: string
  /** Data/hora do upload */
  uploadedAt: Date
  /** Data/hora da geração (apenas para type: 'generated') */
  generatedAt?: Date
  /** URL para download/visualização */
  url: string
  /** Metadata específica do domínio */
  metadata?: ChatFileMetadata
}

// ============================================================================
// Upload State Interfaces
// ============================================================================

/**
 * Estado de upload em progresso
 * Usado para exibir progresso na UI
 */
export interface FileUploadProgress {
  /** ID temporário do upload (antes de ter ID do servidor) */
  uploadId: string
  /** Nome do arquivo sendo enviado */
  fileName: string
  /** Progresso de 0 a 100 */
  progress: number
  /** Status atual do upload */
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
  /** Mensagem de erro (se status === 'error') */
  error?: string
  /** ID do arquivo criado (após complete) */
  fileId?: string
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Resposta da API ao listar arquivos
 */
export interface ChatFilesListResponse {
  files: ChatFile[]
  total: number
  hasMore: boolean
}

/**
 * Resposta da API ao fazer upload
 */
export interface ChatFileUploadResponse {
  file: ChatFile
  message: string
}

// ============================================================================
// Filter & Query Types
// ============================================================================

/**
 * Filtros para busca de arquivos
 */
export interface ChatFilesFilter {
  conversationId?: string
  type?: ChatFileType
  category?: FileCategory
  searchTerm?: string
  dateFrom?: Date
  dateTo?: Date
}
