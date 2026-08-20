import { useNavigate, useParams } from "react-router-dom";

import { ArrowLeft, ArrowRight, Boxes, Check, ChevronDown, House, PanelLeft, Search } from "lucide-react";

import { useProject, useProjects } from "@/api/hooks";
import { IconButton } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { Tooltip } from "@/components/ui/Tooltip";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/cn";

interface AppTopBarProps {
  onOpenSearch: () => void;
}

export function AppTopBar({ onOpenSearch }: AppTopBarProps) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId);
  const { data: projects } = useProjects();
  const leftSidebarOpen = useUiStore((s) => s.leftSidebarOpen);
  const toggleLeftSidebar = useUiStore((s) => s.toggleLeftSidebar);

  // React Router v7 stores the current index in history.state.idx.
  const historyState = window.history.state as { idx?: number } | null;
  const currentIdx = historyState?.idx ?? 0;
  const canGoBack = currentIdx > 0;
  const canGoForward = currentIdx < window.history.length - 1;

  return (
    <header className="flex h-[60px] shrink-0 items-center gap-1 bg-app-bar px-3 text-text-on-dark">
      {/* Brand + project selector */}
      <div className="flex items-center gap-1">
        <Tooltip label="TaleOrience">
          <IconButton
            variant="dark"
            aria-label="TaleOrience home"
            onClick={() => navigate("/")}
          >
            <Boxes className="h-5 w-5" />
          </IconButton>
        </Tooltip>

        <Popover
          align="start"
          label="Project switcher"
          trigger={({ open, toggle }) => (
            <Tooltip label="Switch project">
              <IconButton
                variant="dark"
                aria-expanded={open}
                aria-label="Switch project"
                onClick={toggle}
              >
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
                />
              </IconButton>
            </Tooltip>
          )}
        >
          {({ close }) => (
            <div className="max-h-80 overflow-y-auto py-1" role="listbox">
              {projects?.map((item) => {
                const active = item.id === projectId;
                return (
                  <button
                    key={item.id}
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      close();
                      if (!active) navigate(`/projects/${item.id}`);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm",
                      active
                        ? "bg-surface-selected font-medium text-text"
                        : "text-text hover:bg-surface-hover",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{item.name}</span>
                    {active && <Check className="h-4 w-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </Popover>

        <span className="ml-1 max-w-[220px] truncate text-[15px] font-medium">
          {project?.name ?? "Project"}
        </span>
      </div>

      {/* Navigation controls */}
      <div className="ml-2 flex items-center gap-0.5">
        <Tooltip label={leftSidebarOpen ? "Hide sidebar" : "Show sidebar"}>
          <IconButton
            variant="dark"
            aria-label={leftSidebarOpen ? "Hide sidebar" : "Show sidebar"}
            onClick={toggleLeftSidebar}
          >
            <PanelLeft className="h-[18px] w-[18px]" />
          </IconButton>
        </Tooltip>
        <Tooltip label="Back">
          <IconButton
            variant="dark"
            aria-label="Back"
            disabled={!canGoBack}
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </IconButton>
        </Tooltip>
        <Tooltip label="Forward">
          <IconButton
            variant="dark"
            aria-label="Forward"
            disabled={!canGoForward}
            onClick={() => navigate(1)}
          >
            <ArrowRight className="h-[18px] w-[18px]" />
          </IconButton>
        </Tooltip>
        <Tooltip label="Home">
          <IconButton
            variant="dark"
            aria-label="Home"
            onClick={() => navigate(`/projects/${projectId ?? ""}`)}
          >
            <House className="h-[18px] w-[18px]" />
          </IconButton>
        </Tooltip>
      </div>

      {/* Search */}
      <div className="flex flex-1 justify-center px-4">
        <button
          onClick={onOpenSearch}
          className={cn(
            "group flex w-full max-w-md items-center gap-2 rounded-medium px-2.5 py-1.5",
            "bg-app-bar-hover text-text-on-dark-muted hover:bg-app-bar-active",
            "transition-colors",
          )}
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 truncate text-left text-sm">
            Search {project?.name ?? "project"}
          </span>
          <kbd className="rounded border border-text-on-dark-muted/30 px-1.5 py-0.5 text-[11px] text-text-on-dark-muted">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* User area */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate("/")}
          className="rounded-medium bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Share
        </button>
        <Tooltip label="Account">
          <IconButton variant="dark" aria-label="Account">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
              {project?.name?.charAt(0) ?? "T"}
            </span>
          </IconButton>
        </Tooltip>
      </div>
    </header>
  );
}