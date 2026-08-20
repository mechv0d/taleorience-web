import { create } from "zustand";

export type SidebarMode = "project" | "templates" | "assets";

interface UiState {
  /** Left sidebar active mode. */
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;

  /** Project-mode navigation view (spec §4: hierarchy/list vs map). */
  sidebarView: "list" | "map";
  setSidebarView: (view: "list" | "map") => void;

  /** Right sidebar (inspector / add-block) visibility. */
  rightSidebarOpen: boolean;
  toggleRightSidebar: () => void;

  /** Left sidebar visibility (collapsible on smaller viewports). */
  leftSidebarOpen: boolean;
  toggleLeftSidebar: () => void;

  /** Global search command palette. */
  searchPaletteOpen: boolean;
  setSearchPaletteOpen: (open: boolean) => void;

  /** Expanded tree node ids. */
  expanded: Record<string, boolean>;
  setExpanded: (id: string, value: boolean) => void;
  toggleExpanded: (id: string) => void;
  collapseAll: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarMode: "project",
  setSidebarMode: (sidebarMode) => set({ sidebarMode }),

  sidebarView: "list",
  setSidebarView: (sidebarView) => set({ sidebarView }),

  rightSidebarOpen: true,
  toggleRightSidebar: () => set((s) => ({ rightSidebarOpen: !s.rightSidebarOpen })),

  leftSidebarOpen: true,
  toggleLeftSidebar: () => set((s) => ({ leftSidebarOpen: !s.leftSidebarOpen })),

  searchPaletteOpen: false,
  setSearchPaletteOpen: (searchPaletteOpen) => set({ searchPaletteOpen }),

  expanded: {},
  setExpanded: (id, value) =>
    set((s) => ({ expanded: { ...s.expanded, [id]: value } })),
  toggleExpanded: (id) =>
    set((s) => ({ expanded: { ...s.expanded, [id]: !s.expanded[id] } })),
  collapseAll: () => set({ expanded: {} }),
}));