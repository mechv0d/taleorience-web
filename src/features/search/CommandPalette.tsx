import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";

import { FileText, Search, Sparkles, Type, Boxes } from "lucide-react";

import { listGameObjects, getPages } from "@/api/endpoints";
import { useProjectSearch } from "@/api/hooks";
import { Spinner } from "@/components/ui/Spinner";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/cn";
import type { SearchResult } from "@/api/types";

type Grouped = { key: string; label: string; icon: React.ReactNode; results: SearchResult[] };

const GROUP_META: Record<SearchResult["entityType"], { label: string; icon: React.ReactNode }> = {
  gameObject: { label: "Objects", icon: <Boxes className="h-3.5 w-3.5" /> },
  page: { label: "Pages", icon: <FileText className="h-3.5 w-3.5" /> },
  block: { label: "Content", icon: <Type className="h-3.5 w-3.5" /> },
};

const pageOwnerCache = new Map<string, Map<string, string>>();

async function resolveOwner(projectId: string, pageId: string): Promise<string | null> {
  let map = pageOwnerCache.get(projectId);
  if (!map) {
    map = new Map();
    const objects = await listGameObjects(projectId);
    for (const object of objects) {
      const pages = await getPages(projectId, object.id);
      for (const page of pages) map.set(page.id, object.id);
    }
    pageOwnerCache.set(projectId, map);
  }
  return map.get(pageId) ?? null;
}

export function CommandPalette() {
  const open = useUiStore((s) => s.searchPaletteOpen);
  const setOpen = useUiStore((s) => s.setSearchPaletteOpen);
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();
  const { data, isFetching, isError } = useProjectSearch(projectId, trimmed, open);

  const groups = useMemo<Grouped[]>(() => {
    if (!data) return [];
    const order: SearchResult["entityType"][] = ["gameObject", "page", "block"];
    return order
      .map((entityType) => ({
        key: entityType,
        label: GROUP_META[entityType].label,
        icon: GROUP_META[entityType].icon,
        results: data.filter((r) => r.entityType === entityType),
      }))
      .filter((g) => g.results.length > 0);
  }, [data]);

  const flat = useMemo(() => groups.flatMap((g) => g.results), [groups]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  useEffect(() => setActiveIndex(0), [query]);

  const goTo = async (result: SearchResult) => {
    if (!projectId) return;
    setOpen(false);
    if (result.entityType === "gameObject") {
      navigate(`/projects/${projectId}/game-objects/${result.entityId}`);
      return;
    }
    const ownerId = await resolveOwner(projectId, result.entityId);
    if (ownerId) {
      navigate(`/projects/${projectId}/game-objects/${ownerId}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const result = flat[activeIndex];
      if (result) void goTo(result);
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 p-6 pt-[12vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search project"
        className="w-full max-w-xl overflow-hidden rounded-large border border-border bg-page shadow-popover"
      >
        <div className="flex items-center gap-2.5 border-b border-border-subtle px-3.5 py-3">
          <Search className="h-4 w-4 shrink-0 text-icon-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search the project…"
            className="w-full bg-transparent text-[15px] text-text outline-none placeholder:text-text-muted"
            aria-label="Search query"
          />
          {isFetching && <Spinner className="h-4 w-4" />}
          <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[11px] text-text-muted">
            Esc
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto py-1.5">
          {trimmed && !isFetching && !isError && flat.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-text-muted">
              No matches for “{trimmed}”.
            </p>
          )}
          {!trimmed && (
            <p className="flex items-center gap-2 px-4 py-8 text-sm text-text-muted">
              <Sparkles className="h-4 w-4" />
              Type to search objects, pages and content.
            </p>
          )}
          {isError && (
            <p className="px-4 py-8 text-center text-sm text-danger">Search failed.</p>
          )}

          {groups.map((group) => (
            <div key={group.key}>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                {group.icon}
                {group.label}
              </div>
              {group.results.map((result) => {
                const index = flat.indexOf(result);
                return (
                  <button
                    key={result.id}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => void goTo(result)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm",
                      index === activeIndex ? "bg-surface-selected text-text" : "text-text",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{result.text}</span>
                    <span className="shrink-0 text-xs text-text-muted">{result.entityType}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}