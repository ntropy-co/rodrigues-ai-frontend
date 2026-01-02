import { create } from 'zustand'

/**
 * Tabs disponíveis na sidebar de arquivos
 */
export type FilesSidebarTab = 'uploads' | 'generated'

/**
 * Estado da sidebar de arquivos.
 * Store Zustand independente para gerenciar visibilidade e seleção.
 */
interface FilesSidebarState {
  // -------------------------------------------------------------------------
  // Visibility
  // -------------------------------------------------------------------------

  /** Se a sidebar está aberta */
  isOpen: boolean
  /** Abre a sidebar */
  open: () => void
  /** Fecha a sidebar */
  close: () => void
  /** Toggle visibilidade */
  toggle: () => void

  // -------------------------------------------------------------------------
  // Active Tab
  // -------------------------------------------------------------------------

  /** Tab ativa (uploads ou gerados) */
  activeTab: FilesSidebarTab
  /** Muda a tab ativa */
  setActiveTab: (tab: FilesSidebarTab) => void

  // -------------------------------------------------------------------------
  // Selected File
  // -------------------------------------------------------------------------

  /** ID do arquivo selecionado para preview (null = nenhum) */
  selectedFileId: string | null
  /** Seleciona um arquivo para preview */
  selectFile: (fileId: string | null) => void
  /** Limpa a seleção */
  clearSelection: () => void
}

/**
 * Store para gerenciar o estado da sidebar de arquivos.
 *
 * Não usa persistence (estado é resetado ao recarregar página).
 *
 * @example
 * ```tsx
 * const { isOpen, open, close, activeTab } = useFilesSidebarStore()
 *
 * // Em um botão
 * <button onClick={toggle}>Toggle Files</button>
 *
 * // Na sidebar
 * {isOpen && <FilesSidebar />}
 * ```
 */
export const useFilesSidebarStore = create<FilesSidebarState>((set) => ({
  // Visibility
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, selectedFileId: null }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  // Active Tab
  activeTab: 'uploads',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Selected File
  selectedFileId: null,
  selectFile: (fileId) => set({ selectedFileId: fileId }),
  clearSelection: () => set({ selectedFileId: null })
}))
