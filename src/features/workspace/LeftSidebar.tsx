import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CircleHelp, FolderPlus, LayoutTemplate, Lightbulb, Settings, Boxes } from "lucide-react";

import { useCreateGameObject } from "@/api/hooks";
import { IconButton } from "@/components/ui/Button";
import { NameDialog } from "@/components/ui/NameDialog";
import { Tooltip } from "@/components/ui/Tooltip";
import { useUiStore, type SidebarMode } from "@/stores/uiStore";
import { cn } from "@/lib/cn";
import { ProjectBrowser } from "@/features/tree/ProjectBrowser";
import { TemplatesPanel } from "@/features/templates/TemplatesPanel";
import { AssetsBrowser } from "@/features/assets/AssetsBrowser";

const TABS: Array<{ mode: SidebarMode; label: string; icon: React.ReactNode }> = [
  { mode: "project", label: "Project", icon: <Boxes className="h-4 w-4" /> },
  { mode: "templates", label: "Templates", icon: <LayoutTemplate className="h-4 w-4" /> },
  { mode: "assets", label: "Assets", icon: <Boxes className="h-4 w-4" /> },
];

function CreateObjectButton() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const createMutation = useCreateGameObject();
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton size="sm" aria-label="Create object" onClick={() => setOpen(true)}>
        <FolderPlus className="h-4 w-4" />
      </IconButton>
      <NameDialog
        open={open}
        title="New object"
        placeholder="Object name"
        busy={createMutation.isPending}
        onSubmit={(name) => {
          if (!projectId) return;
          createMutation.mutate(
            { projectId, name },
            {
              onSuccess: (created) => {
                setOpen(false);
                navigate(`/projects/${projectId}/game-objects/${created.id}`);
              },
            },
          );
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

export function LeftSidebar() {
  const mode = useUiStore((s) => s.sidebarMode);
  const setMode = useUiStore((s) => s.setSidebarMode);
  const leftSidebarOpen = useUiStore((s) => s.leftSidebarOpen);
  const { projectId } = useParams<{ projectId: string }>();

  if (!leftSidebarOpen) return null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-border bg-surface" data-testid="left-sidebar">
      {/* Mode tabs */}
      <div className="flex items-center gap-1 border-b border-border-subtle px-2 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.mode}
            onClick={() => setMode(tab.mode)}
            aria-selected={mode === tab.mode}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-medium px-2 py-1.5 text-sm",
              mode === tab.mode
                ? "bg-surface-selected font-semibold text-text"
                : "text-text-secondary hover:bg-surface-hover hover:text-text",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mode content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {mode === "project" && <ProjectBrowser />}
        {mode === "templates" && <TemplatesPanel />}
        {mode === "assets" && <AssetsBrowser />}
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-between border-t border-border-subtle px-2 py-1.5">
        <div className="flex items-center gap-0.5">
          <Tooltip label="Theme">
            <IconButton size="icon" aria-label="Theme" className="h-6 w-6">
              <Lightbulb className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip label="Settings">
            <IconButton size="icon" aria-label="Settings" className="h-6 w-6">
              <Settings className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip label="Help">
            <IconButton size="icon" aria-label="Help" className="h-6 w-6">
              <CircleHelp className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
        {mode === "project" && projectId && <CreateObjectButton />}
      </div>
    </aside>
  );
}