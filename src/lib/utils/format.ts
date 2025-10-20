/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata timestamp Unix para horário local PT-BR
 * @param timestamp - Timestamp Unix em segundos
 * @returns String formatada no formato HH:MM
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Formata timestamp Unix para data completa PT-BR
 * @param timestamp - Timestamp Unix em segundos
 * @returns String formatada no formato DD/MM/AAAA
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString('pt-BR')
}

/**
 * Formata timestamp Unix para formato ISO 8601
 * @param timestamp - Timestamp Unix em segundos
 * @returns String ISO 8601
 */
export function formatTimestampISO(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString()
}

/**
 * Trunca texto adicionando reticências se necessário
 * @param text - Texto a ser truncado
 * @param maxLength - Comprimento máximo antes de truncar
 * @returns Texto truncado com '...' se necessário
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }
  return text.substring(0, maxLength) + '...'
}

/**
 * Extrai a primeira letra de um nome ou email
 * @param name - Nome completo do usuário
 * @param email - Email do usuário (fallback)
 * @returns Primeira letra em maiúscula ou 'U' como fallback
 */
export function getInitialLetter(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    return name.trim()[0].toUpperCase()
  }
  if (email && email.trim()) {
    return email[0].toUpperCase()
  }
  return 'U'
}
