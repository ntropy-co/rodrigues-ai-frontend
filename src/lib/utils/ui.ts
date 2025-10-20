/**
 * Funções utilitárias para UI e estilos
 */

import { CATEGORY_COLORS } from '../constants'
import * as LucideIcons from 'lucide-react'

/**
 * Retorna a classe CSS de cor baseada na categoria
 * @param category - Categoria da sugestão (basic, advanced, expert)
 * @returns Classe Tailwind de cor do texto
 */
export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || 'text-gemini-gray-600'
}

/**
 * Retorna o componente de ícone Lucide baseado no nome
 * @param iconName - Nome do ícone Lucide
 * @returns Componente React do ícone ou HelpCircle como fallback
 */
export function getIconComponent(
  iconName: string
): React.ComponentType<{ className?: string }> {
  const IconComponent = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[iconName]
  return IconComponent || LucideIcons.HelpCircle
}

/**
 * Verifica se o usuário está próximo ao fim da área de scroll
 * @param scrollTop - Posição atual do scroll
 * @param scrollHeight - Altura total do conteúdo
 * @param clientHeight - Altura visível do container
 * @param threshold - Distância em pixels do fundo (padrão: 200)
 * @returns true se está próximo ao fim
 */
export function isNearBottom(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
  threshold: number = 200
): boolean {
  return scrollHeight - scrollTop - clientHeight < threshold
}

/**
 * Calcula o número de páginas total do carrossel
 * @param totalItems - Número total de items
 * @param itemsPerPage - Items por página
 * @returns Número de páginas
 */
export function calculateTotalPages(
  totalItems: number,
  itemsPerPage: number
): number {
  return Math.ceil(totalItems / itemsPerPage)
}

/**
 * Calcula a página atual baseada no índice
 * @param currentIndex - Índice atual
 * @param itemsPerView - Items por visualização
 * @returns Número da página atual (0-indexed)
 */
export function getCurrentPage(
  currentIndex: number,
  itemsPerView: number
): number {
  return Math.floor(currentIndex / itemsPerView)
}
