/**
 * File Utility Functions
 *
 * Helpers para formatação, ícones e manipulação de arquivos.
 */

import {
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  FileArchive,
  FileCode,
  FileVideo,
  FileAudio,
  type LucideIcon
} from 'lucide-react'
import type { FileCategory } from '@/types/chat-files'

// ============================================================================
// File Size Formatting
// ============================================================================

/**
 * Formata tamanho de arquivo em bytes para string legível.
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 * formatFileSize(1500) // "1.46 KB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  // Para unidades >= MB, mostrar uma casa decimal
  const decimals = i >= 2 ? 1 : 0

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${units[i]}`
}

// ============================================================================
// File Extension & Category
// ============================================================================

/**
 * Extrai extensão do nome do arquivo (sem o ponto).
 *
 * @example
 * getFileExtension('documento.pdf') // 'pdf'
 * getFileExtension('planilha.xlsx') // 'xlsx'
 * getFileExtension('arquivo') // ''
 */
export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.')
  if (parts.length < 2) return ''
  return parts[parts.length - 1].toLowerCase()
}

/**
 * Mapeia extensões para categorias.
 */
const EXTENSION_CATEGORY_MAP: Record<string, FileCategory> = {
  // PDFs
  pdf: 'pdf',

  // Spreadsheets
  xlsx: 'spreadsheet',
  xls: 'spreadsheet',
  csv: 'spreadsheet',
  ods: 'spreadsheet',

  // Documents
  doc: 'document',
  docx: 'document',
  txt: 'document',
  rtf: 'document',
  odt: 'document',

  // Images
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image'
}

/**
 * Retorna a categoria do arquivo baseada na extensão.
 *
 * @example
 * getFileCategory('pdf') // 'pdf'
 * getFileCategory('xlsx') // 'spreadsheet'
 * getFileCategory('unknown') // 'other'
 */
export function getFileCategory(
  extension: string | undefined | null
): FileCategory {
  if (!extension) return 'other'
  return EXTENSION_CATEGORY_MAP[extension.toLowerCase()] || 'other'
}

// ============================================================================
// File Icons
// ============================================================================

/**
 * Mapeia categorias para ícones Lucide.
 */
const CATEGORY_ICON_MAP: Record<FileCategory, LucideIcon> = {
  pdf: FileText,
  spreadsheet: FileSpreadsheet,
  document: FileText,
  image: FileImage,
  other: File
}

/**
 * Mapeia extensões específicas para ícones especiais.
 */
const EXTENSION_ICON_MAP: Record<string, LucideIcon> = {
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
  tar: FileArchive,
  gz: FileArchive,
  js: FileCode,
  ts: FileCode,
  tsx: FileCode,
  jsx: FileCode,
  json: FileCode,
  py: FileCode,
  mp4: FileVideo,
  mov: FileVideo,
  avi: FileVideo,
  webm: FileVideo,
  mp3: FileAudio,
  wav: FileAudio,
  ogg: FileAudio,
  flac: FileAudio
}

/**
 * Retorna o ícone Lucide apropriado para o tipo de arquivo.
 *
 * @example
 * const Icon = getFileIcon('pdf')
 * <Icon className="h-4 w-4" />
 */
export function getFileIcon(
  extensionOrCategory: string | undefined | null
): LucideIcon {
  // Handle undefined/null input
  if (!extensionOrCategory) {
    return File
  }

  // Primeiro, tentar extensão específica
  const extLower = extensionOrCategory.toLowerCase()
  if (EXTENSION_ICON_MAP[extLower]) {
    return EXTENSION_ICON_MAP[extLower]
  }

  // Depois, tentar categoria
  const category = getFileCategory(extLower)
  return CATEGORY_ICON_MAP[category] || File
}

// ============================================================================
// MIME Type Helpers
// ============================================================================

/**
 * Verifica se o MIME type é de uma imagem.
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Verifica se o MIME type é de um PDF.
 */
export function isPdfMimeType(mimeType: string): boolean {
  return mimeType === 'application/pdf'
}

/**
 * Obtém a categoria a partir do MIME type.
 */
export function getCategoryFromMimeType(mimeType: string): FileCategory {
  if (isPdfMimeType(mimeType)) return 'pdf'
  if (isImageMimeType(mimeType)) return 'image'
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType === 'text/csv'
  ) {
    return 'spreadsheet'
  }
  if (
    mimeType.includes('document') ||
    mimeType.includes('word') ||
    mimeType.startsWith('text/')
  ) {
    return 'document'
  }
  return 'other'
}
