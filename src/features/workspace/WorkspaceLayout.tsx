import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";

import { AppTopBar } from "./AppTopBar";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "@/features/object/RightSidebar";
import { CommandPalette } from "@/features/search/CommandPalette";
import { useUiStore } from "@/stores/uiStore";

export function WorkspaceLayout() {
  const { gameObjectId } = useParams<{ projectId: string; gameObjectId: string }>();
  const setSearchPaletteOpen = useUiStore((s) => s.setSearchPaletteOpen);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [setSearchPaletteOpen]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppTopBar onOpenSearch={() => setSearchPaletteOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <LeftSidebar />
        <Outlet />
        {gameObjectId && <RightSidebar />}
      </div>
      <CommandPalette />
    </div>
  );
}