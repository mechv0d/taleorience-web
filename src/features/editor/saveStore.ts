import { create } from "zustand";

interface SaveState {
  pending: number;
  lastSavedAt: number | null;
  startSave: () => void;
  endSave: () => void;
}

/** Tracks in-flight block saves so the editor header can show a save state. */
export const useSaveStore = create<SaveState>((set) => ({
  pending: 0,
  lastSavedAt: null,
  startSave: () => set((s) => ({ pending: s.pending + 1 })),
  endSave: () =>
    set((s) => ({
      pending: Math.max(0, s.pending - 1),
      lastSavedAt: s.pending <= 1 ? Date.now() : s.lastSavedAt,
    })),
}));