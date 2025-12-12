/**
 * Layout Types for 3-Column Claude-Inspired Architecture
 */

export type SidebarPosition = 'left' | 'right'
export type SidebarState = 'open' | 'closed'
export type ViewportSize = 'mobile' | 'tablet' | 'desktop'

export interface LayoutState {
  // Sidebars
  conversationsSidebar: SidebarState
  filesSidebar: SidebarState

  // Viewport
  viewport: ViewportSize
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean

  // Dimensions
  conversationsSidebarWidth: number // 280px ou 0
  filesSidebarWidth: number // 320px ou 0
}

export interface LayoutActions {
  // Toggle
  toggleConversationsSidebar: () => void
  toggleFilesSidebar: () => void

  // Explicit
  openConversationsSidebar: () => void
  closeConversationsSidebar: () => void
  openFilesSidebar: () => void
  closeFilesSidebar: () => void

  // Viewport
  setViewport: (size: ViewportSize) => void

  // Reset
  resetLayout: () => void
}

// Constants
export const SIDEBAR_WIDTHS = {
  conversations: 280,
  files: 320
} as const

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1280
} as const
