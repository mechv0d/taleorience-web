import { create } from "zustand";

/**
 * Session-scoped optimistic overrides for GameObject visuals (icon / banner).
 * The server is the source of truth: overrides are applied on top of the tree
 * data and are dropped once the backend persists them (see updateGameObject).
 * TODO(backend): icon/banner persistence needs `POST /game-objects/:goId/update`
 * (see backend-should-implement.md). Until then these last for the session only.
 */
interface ObjectVisualsState {
  icon: Record<string, string | null>;
  banner: Record<string, string | null>;
  setIcon: (key: string, icon: string | null) => void;
  setBanner: (key: string, assetId: string | null) => void;
  clear: (key: string) => void;
}

export const useObjectVisuals = create<ObjectVisualsState>((set) => ({
  icon: {},
  banner: {},
  setIcon: (key, icon) => set((s) => ({ icon: { ...s.icon, [key]: icon } })),
  setBanner: (key, assetId) => set((s) => ({ banner: { ...s.banner, [key]: assetId } })),
  clear: (key) =>
    set((s) => {
      const icon = { ...s.icon };
      const banner = { ...s.banner };
      delete icon[key];
      delete banner[key];
      return { icon, banner };
    }),
}));