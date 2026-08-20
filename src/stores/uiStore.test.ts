import { describe, expect, it } from "vitest";

import { useUiStore } from "./uiStore";

describe("uiStore", () => {
  it("switches sidebar mode", () => {
    const store = useUiStore.getState();
    expect(store.sidebarMode).toBe("project");
    store.setSidebarMode("assets");
    expect(useUiStore.getState().sidebarMode).toBe("assets");
  });

  it("toggles the right sidebar", () => {
    expect(useUiStore.getState().rightSidebarOpen).toBe(true);
    useUiStore.getState().toggleRightSidebar();
    expect(useUiStore.getState().rightSidebarOpen).toBe(false);
  });

  it("manages the search palette flag", () => {
    useUiStore.getState().setSearchPaletteOpen(true);
    expect(useUiStore.getState().searchPaletteOpen).toBe(true);
  });

  it("expands/collapses tree nodes and supports collapseAll", () => {
    useUiStore.getState().setExpanded("a", true);
    useUiStore.getState().setExpanded("b", true);
    useUiStore.getState().toggleExpanded("a");
    expect(useUiStore.getState().expanded).toMatchObject({ a: false, b: true });
    useUiStore.getState().collapseAll();
    expect(useUiStore.getState().expanded).toEqual({});
  });
});