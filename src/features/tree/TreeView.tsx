import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ChevronDown, ChevronRight, Ellipsis, EyeOff, FileText, FolderPlus, Trash2 } from "lucide-react";

import { useCreateGameObject, useDeleteGameObject, useGameObjectTree, usePages } from "@/api/hooks";
import { IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ContextMenu, type MenuItemDef } from "@/components/ui/ContextMenu";
import { NameDialog } from "@/components/ui/NameDialog";
import { Spinner } from "@/components/ui/Spinner";
import { ancestorPath } from "@/lib/tree";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/cn";
import { objectIcon } from "./objectIcons";
import type { GameObjectTreeNode } from "@/api/types";

export function TreeView({ nodes }: { nodes?: GameObjectTreeNode[] }) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: tree, isLoading, isError } = useGameObjectTree(projectId);
  const createMutation = useCreateGameObject();
  const deleteMutation = useDeleteGameObject();

  const [createRootOpen, setCreateRootOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GameObjectTreeNode | null>(null);

  const resolved = nodes ?? tree;

  // Auto-expand the root level when the tree first loads (matches the reference).
  useEffect(() => {
    if (nodes || !resolved) return;
    const store = useUiStore.getState();
    const roots = resolved.filter((node) => !node.parentId);
    for (const root of roots) {
      if (store.expanded[root.id] === undefined) {
        store.setExpanded(root.id, true);
      }
    }
  }, [nodes, resolved]);

  if (isLoading && !nodes) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (isError && !nodes) {
    return <p className="px-3 py-6 text-sm text-danger">Could not load the tree.</p>;
  }

  const handleCreate = (name: string, parentId?: string | null) => {
    if (!projectId) return;
    createMutation.mutate(
      { projectId, name, parentId: parentId ?? null },
      {
        onSuccess: (created) => {
          if (parentId) {
            useUiStore.getState().setExpanded(parentId, true);
          }
          navigate(`/projects/${projectId}/game-objects/${created.id}`);
        },
      },
    );
  };

  const handleDelete = (node: GameObjectTreeNode) => {
    if (!projectId) return;
    deleteMutation.mutate({ projectId, gameObjectId: node.id });
    // Collapse the parent row that held the deleted subtree.
    const parentPath = ancestorPath(resolved ?? [], node.id);
    if (parentPath.length > 1) {
      useUiStore.getState().setExpanded(parentPath[parentPath.length - 2].id, false);
    }
  };

  const rootMenuItems: MenuItemDef[] = [
    {
      type: "item",
      label: "New object",
      icon: <FolderPlus className="h-4 w-4" />,
      onSelect: () => setCreateRootOpen(true),
    },
  ];

  return (
    <div data-testid="tree-view">
      {resolved && resolved.length === 0 ? (
        <p className="px-3 py-6 text-sm text-text-muted">
          No objects yet. Create the first one.
        </p>
      ) : (
        <ul role="tree" className="space-y-px">
          {resolved?.map((node) => (
            <TreeNodeRow
              key={node.id}
              node={node}
              depth={0}
              onCreateChild={handleCreate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <ContextMenu items={rootMenuItems}>
        <div className="hidden" aria-hidden />
      </ContextMenu>

      <NameDialog
        open={createRootOpen}
        title="New object"
        placeholder="Object name"
        onSubmit={(name) => {
          setCreateRootOpen(false);
          handleCreate(name, null);
        }}
        onCancel={() => setCreateRootOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        danger
        title={`Delete ${deleteTarget?.name ?? "object"}?`}
        description="The object and all its sub-pages will be removed."
        confirmLabel="Delete"
        busy={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) handleDelete(deleteTarget);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

function TreeNodeRow({
  node,
  depth,
  onCreateChild,
  onDelete,
}: {
  node: GameObjectTreeNode;
  depth: number;
  onCreateChild: (name: string, parentId?: string | null) => void;
  onDelete: (node: GameObjectTreeNode) => void;
}) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { gameObjectId } = useParams<{ gameObjectId: string }>();
  const expanded = useUiStore((s) => s.expanded);
  const toggleExpanded = useUiStore((s) => s.toggleExpanded);

  const [createDialog, setCreateDialog] = useState(false);
  const { data: pages } = usePages(projectId, node.id);

  const isExpanded = Boolean(expanded[node.id]);
  const hasChildren = node.children.length > 0;
  const isActive = gameObjectId === node.id;
  const isRoot = depth === 0;

  const navigateToNode = () => navigate(`/projects/${projectId}/game-objects/${node.id}`);

  const menuItems: MenuItemDef[] = [
    {
      type: "item",
      label: "Create sub-page",
      icon: <FolderPlus className="h-4 w-4" />,
      onSelect: () => setCreateDialog(true),
    },
    { type: "separator" },
    {
      type: "item",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onSelect: () => onDelete(node),
    },
  ];

  return (
    <li data-testid="tree-node">
      <div
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isActive}
        tabIndex={0}
        onClick={navigateToNode}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigateToNode();
          }
        }}
        className={cn(
          "group flex h-7 w-full cursor-pointer items-center gap-1 rounded-small pr-1 text-sm",
          "hover:bg-surface-hover",
          isActive ? "bg-surface-selected text-text" : "text-text",
        )}
        style={{ paddingLeft: depth * 14 + 6 }}
      >
        <span
          role="button"
          tabIndex={-1}
          aria-label={isExpanded ? "Collapse" : "Expand"}
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center text-icon-muted",
            !hasChildren && "invisible",
          )}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded(node.id);
          }}
        >
          {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </span>

        <span className={cn("shrink-0", isRoot ? "text-primary" : "text-icon")}>{objectIcon(node.name)}</span>

        <span className={cn("min-w-0 flex-1 truncate", isRoot && "font-medium")}>{node.name}</span>

        <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
          <IconButton
            size="icon"
            aria-label={`Create sub-page under ${node.name}`}
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              setCreateDialog(true);
            }}
          >
            <FolderPlus className="h-3.5 w-3.5" />
          </IconButton>
          <ContextMenu items={menuItems}>
            <IconButton
              size="icon"
              aria-label={`Options for ${node.name}`}
              className="h-5 w-5"
              onClick={(e) => e.stopPropagation()}
            >
              <Ellipsis className="h-3.5 w-3.5" />
            </IconButton>
          </ContextMenu>
        </span>
      </div>

      {pages && pages.length > 0 && (
        <ul role="group">
          {pages.map((page) => (
            <li
              key={page.id}
              className={cn(
                "flex h-6 cursor-pointer items-center gap-1 rounded-small pr-1 text-sm text-text-secondary",
                "hover:bg-surface-hover hover:text-text",
              )}
              style={{ paddingLeft: depth * 14 + 6 + 20 }}
              onClick={navigateToNode}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-icon-muted" />
              <span className="min-w-0 flex-1 truncate">{page.title}</span>
              <span className="hidden shrink-0 items-center group-hover:flex">
                <EyeOff className="h-3.5 w-3.5 text-icon-muted" />
              </span>
            </li>
          ))}
        </ul>
      )}

      {hasChildren && isExpanded && (
        <ul role="group">
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}

      <NameDialog
        open={createDialog}
        title="New sub-page"
        placeholder="Object name"
        busy={false}
        onSubmit={(name) => {
          setCreateDialog(false);
          onCreateChild(name, node.id);
        }}
        onCancel={() => setCreateDialog(false)}
      />
    </li>
  );
}