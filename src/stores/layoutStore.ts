import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LayoutState, LayoutActions, ViewportSize } from '@/types/layout'
import { SIDEBAR_WIDTHS } from '@/types/layout'

interface LayoutStore extends LayoutState, LayoutActions {}

export const useLayoutStore = create<LayoutStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      conversationsSidebar: 'open',
      filesSidebar: 'closed',
      viewport: 'desktop',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      conversationsSidebarWidth: SIDEBAR_WIDTHS.conversations,
      filesSidebarWidth: 0,

      // Toggle actions
      toggleConversationsSidebar: () => {
        const current = get().conversationsSidebar
        set({
          conversationsSidebar: current === 'open' ? 'closed' : 'open',
          conversationsSidebarWidth:
            current === 'open' ? 0 : SIDEBAR_WIDTHS.conversations
        })
      },

      toggleFilesSidebar: () => {
        const current = get().filesSidebar
        set({
          filesSidebar: current === 'open' ? 'closed' : 'open',
          filesSidebarWidth: current === 'open' ? 0 : SIDEBAR_WIDTHS.files
        })
      },

      // Explicit actions
      openConversationsSidebar: () => {
        set({
          conversationsSidebar: 'open',
          conversationsSidebarWidth: SIDEBAR_WIDTHS.conversations
        })
      },

      closeConversationsSidebar: () => {
        set({
          conversationsSidebar: 'closed',
          conversationsSidebarWidth: 0
        })
      },

      openFilesSidebar: () => {
        set({
          filesSidebar: 'open',
          filesSidebarWidth: SIDEBAR_WIDTHS.files
        })
      },

      closeFilesSidebar: () => {
        set({
          filesSidebar: 'closed',
          filesSidebarWidth: 0
        })
      },

      // Viewport
      setViewport: (size: ViewportSize) => {
        const isMobile = size === 'mobile'
        const isTablet = size === 'tablet'
        const isDesktop = size === 'desktop'

        // Auto-close sidebars em mobile
        const conversationsSidebar = isMobile
          ? 'closed'
          : get().conversationsSidebar
        const filesSidebar =
          isMobile || isTablet ? 'closed' : get().filesSidebar

        set({
          viewport: size,
          isMobile,
          isTablet,
          isDesktop,
          conversationsSidebar,
          filesSidebar,
          conversationsSidebarWidth:
            conversationsSidebar === 'open' ? SIDEBAR_WIDTHS.conversations : 0,
          filesSidebarWidth: filesSidebar === 'open' ? SIDEBAR_WIDTHS.files : 0
        })
      },

      // Reset
      resetLayout: () => {
        set({
          conversationsSidebar: 'open',
          filesSidebar: 'closed',
          conversationsSidebarWidth: SIDEBAR_WIDTHS.conversations,
          filesSidebarWidth: 0
        })
      }
    }),
    {
      name: 'verity-layout-storage',
      partialize: (state) => ({
        // Persistir apenas preferências de sidebar (não viewport)
        conversationsSidebar: state.conversationsSidebar,
        filesSidebar: state.filesSidebar
      })
    }
  )
)
