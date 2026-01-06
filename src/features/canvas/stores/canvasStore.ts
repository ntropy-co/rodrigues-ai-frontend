import { create } from 'zustand'

export type CanvasMode = 'view' | 'edit'

interface CanvasState {
  isOpen: boolean
  content: string | null
  title: string | null
  mode: CanvasMode
  width: number // percentage, e.g., 50 for 50%

  // Actions
  openCanvas: (content: string, title?: string, mode?: CanvasMode) => void
  closeCanvas: () => void
  updateContent: (content: string) => void
  setMode: (mode: CanvasMode) => void
  setWidth: (width: number) => void
  toggleCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  isOpen: false,
  content: null,
  title: null,
  mode: 'view',
  width: 55, // Default to 55% split - gives Canvas more prominence

  openCanvas: (content, title = 'Artifact', mode = 'view') =>
    set({ isOpen: true, content, title, mode }),

  closeCanvas: () => set({ isOpen: false }),

  updateContent: (content) => set({ content }),

  setMode: (mode) => set({ mode }),

  setWidth: (width) => set({ width }),

  toggleCanvas: () => set((state) => ({ isOpen: !state.isOpen }))
}))
