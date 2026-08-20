import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { Filter, List, Map as MapIcon, Search } from "lucide-react";

import { useGameObjectTree, useTags } from "@/api/hooks";
import { IconButton } from "@/components/ui/Button";
import { Popover } from "@/components/ui/Popover";
import { Tooltip } from "@/components/ui/Tooltip";
import { useUiStore } from "@/stores/uiStore";
import { filterTree } from "@/lib/tree";
import { cn } from "@/lib/cn";
import type { GameObjectTreeNode } from "@/api/types";
import { TreeView } from "./TreeView";
import { useObjectTagMap } from "./useObjectTagMap";

export function ProjectBrowser() {
  const { projectId } = useParams<{ projectId: string }>();
  const sidebarView = useUiStore((s) => s.sidebarView);
  const setSidebarView = useUiStore((s) => s.setSidebarView);

  const [query, setQuery] = useState("");
  const { data: tags } = useTags(projectId);
  const { data: tree } = useGameObjectTree(projectId);
  const { data: tagMap } = useObjectTagMap(projectId);

  const trimmed = query.trim().toLowerCase();

  const visibleTree = useMemo<GameObjectTreeNode[] | undefined>(() => {
    if (!tree) return undefined;
    // No filter: let TreeView manage expansion of the unfiltered tree.
    if (!trimmed) return undefined;

    if (trimmed.startsWith("#")) {
      const tagName = trimmed.slice(1);
      if (!tagMap) return undefined;
      const idsWithTag = new Set(
        [...tagMap.entries()]
          .filter(([, names]) => names.includes(tagName))
          .map(([id]) => id),
      );
      return filterTree(tree, (node) => idsWithTag.has(node.id));
    }

    return filterTree(tree, (node) => node.name.toLowerCase().includes(trimmed));
  }, [tree, trimmed, tagMap]);

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 pb-2 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-icon-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find by name or #tag"
            aria-label="Find by name or #tag"
            className="h-8 w-full rounded-small border border-border bg-page pl-8 pr-8 text-sm text-text placeholder:text-text-muted focus:border-focus focus:outline-none"
          />
          <Popover
            align="end"
            label="Filters"
            trigger={({ toggle, open }) => (
              <IconButton
                size="icon"
                aria-label="Filters"
                aria-expanded={open}
                className="absolute right-1.5 top-1/2 h-6 w-6 -translate-y-1/2"
                onClick={toggle}
              >
                <Filter className="h-3.5 w-3.5" />
              </IconButton>
            )}
          >
            {({ close }) => (
              <div className="py-1">
                <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Tags
                </p>
                {tags && tags.length === 0 && (
                  <p className="px-3 py-1.5 text-sm text-text-muted">No tags yet.</p>
                )}
                {tags?.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      setQuery(`#${tag.name}`);
                      close();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text hover:bg-surface-hover"
                  >
                    <span className="truncate">#{tag.name}</span>
                  </button>
                ))}
              </div>
            )}
          </Popover>
        </div>

        <div className="mt-2 flex items-center gap-1">
          <Tooltip label="Hierarchy">
            <IconButton
              size="icon"
              aria-label="Hierarchy view"
              className={cn(sidebarView === "list" && "bg-surface-selected text-text")}
              onClick={() => setSidebarView("list")}
            >
              <List className="h-4 w-4" />
            </IconButton>
          </Tooltip>
          <Tooltip label="Map view">
            <IconButton
              size="icon"
              aria-label="Map view"
              className={cn(sidebarView === "map" && "bg-surface-selected text-text")}
              onClick={() => setSidebarView("map")}
            >
              <MapIcon className="h-4 w-4" />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {sidebarView === "list" ? (
          <TreeView nodes={visibleTree} />
        ) : (
          <p className="px-3 py-6 text-sm text-text-muted">
            Map view is not available yet.
          </p>
        )}
      </div>
    </div>
  );
}