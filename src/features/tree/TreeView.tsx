import { useEffect, useState, type DragEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ChevronDown, ChevronRight, Ellipsis, FilePlus2, FileText, FolderPlus, Trash2 } from "lucide-react";

import { useCreateGameObject, useDeleteGameObject, useGameObjectTree, useMoveGameObject, usePages } from "@/api/hooks";
import { IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ContextMenu, type MenuItemDef } from "@/components/ui/ContextMenu";
import { NameDialog } from "@/components/ui/NameDialog";
import { useRipple } from "@/components/ui/Ripple";
import { Spinner } from "@/components/ui/Spinner";
import { Tooltip } from "@/components/ui/Tooltip";
import { ancestorPath, buildDraftTree, computeMove, emptyDraft, flattenTree, parentKeyOf, type TreeDraft } from "@/lib/tree";
import { useUiStore } from "@/stores/uiStore";
import { useObjectVisuals } from "@/stores/objectVisualsStore";
import { cn } from "@/lib/cn";
import { objectIcon } from "./objectIcons";
import type { GameObjectTreeNode } from "@/api/types";

type DropPosition = "before" | "after" | "inside";

interface DropTarget {
  id: string;
  position: DropPosition;
}

export function TreeView({ nodes }: { nodes?: GameObjectTreeNode[] }) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { data: tree, isLoading, isError } = useGameObjectTree(projectId);
  const createMutation = useCreateGameObject();
  const deleteMutation = useDeleteGameObject();
  const moveMutation = useMoveGameObject();

  const [createRootOpen, setCreateRootOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GameObjectTreeNode | null>(null);
  const [draft, setDraft] = useState<TreeDraft>(emptyDraft());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [rootDrop, setRootDrop] = useState(false);

  const resolved = nodes ?? tree;
  const draftResolved = resolved ? buildDraftTree(resolved, draft) : undefined;

  // Auto-expand the root level when the tree first loads (matches the reference).
  useEffect(() => {
    if (nodes || !draftResolved) return;
    const store = useUiStore.getState();
    const roots = draftResolved.filter((node) => !node.parentId);
    for (const root of roots) {
      if (store.expanded[root.id] === undefined) {
        store.setExpanded(root.id, true);
      }
    }
  }, [nodes, draftResolved]);

  // Reset the local draft when the project changes.
  useEffect(() => {
    setDraft(emptyDraft());
  }, [projectId]);

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
    const parentPath = ancestorPath(draftResolved ?? [], node.id);
    if (parentPath.length > 1) {
      useUiStore.getState().setExpanded(parentPath[parentPath.length - 2].id, false);
    }
  };

  const handleMove = (draggedId: string, targetId: string, position: DropPosition) => {
    if (!projectId || !draftResolved) return;
    const flat = flattenTree(draftResolved);
    const { parentId, order } = computeMove(flat, draggedId, targetId, position);
    setDraft((d) => ({
      parentOf: { ...d.parentOf, [draggedId]: parentId },
      order: { ...d.order, [parentKeyOf(parentId)]: order },
    }));
    const toIndex = order.findIndex((id) => id === draggedId);
    // TODO(backend): needs `POST /game-objects/:goId/move` — see backend-should-implement.md.
    moveMutation.mutate(
      { projectId, gameObjectId: draggedId, parentId, toIndex },
      {
        onSuccess: () => setDraft(emptyDraft()),
        onError: (error) => console.warn("Move not persisted yet:", error),
      },
    );
  };

  const handleDragOverRow = (id: string, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (dragId === id) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    const position: DropPosition = ratio < 0.3 ? "before" : ratio > 0.7 ? "after" : "inside";
    setDropTarget((prev) => (prev && prev.id === id && prev.position === position ? prev : { id, position }));
  };

  const handleDropRow = (_id: string, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const target = dropTarget;
    setDragId(null);
    setDropTarget(null);
    setRootDrop(false);
    if (dragId && target && dragId !== target.id) {
      handleMove(dragId, target.id, target.position);
    }
  };

  const handleDropToRoot = (event: DragEvent<HTMLUListElement>) => {
    event.preventDefault();
    setRootDrop(false);
    if (dragId && draftResolved) {
      const flat = flattenTree(draftResolved);
      const roots = flat.filter((n) => (n.parentId ?? null) === null && n.id !== dragId);
      const order = [...roots.map((n) => n.id), dragId];
      setDraft((d) => ({
        parentOf: { ...d.parentOf, [dragId]: null },
        order: { ...d.order, [parentKeyOf(null)]: order },
      }));
      // TODO(backend): needs `POST /game-objects/:goId/move` — see backend-should-implement.md.
      moveMutation.mutate(
        { projectId: projectId!, gameObjectId: dragId, parentId: null, toIndex: order.length - 1 },
        {
          onSuccess: () => setDraft(emptyDraft()),
          onError: (error) => console.warn("Move not persisted yet:", error),
        },
      );
    }
    setDragId(null);
    setDropTarget(null);
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
      {draftResolved && draftResolved.length === 0 ? (
        <p className="px-3 py-6 text-sm text-text-muted">
          No objects yet. Create the first one.
        </p>
      ) : (
        <ul
          role="tree"
          className={cn("space-y-px", rootDrop && "rounded-small ring-2 ring-primary/40")}
          onDragOver={(e) => {
            if (!dragId) return;
            e.preventDefault();
            setRootDrop(true);
          }}
          onDragLeave={(e) => {
            if (e.currentTarget.contains(e.relatedTarget as Node)) return;
            setRootDrop(false);
          }}
          onDrop={handleDropToRoot}
        >
          {draftResolved?.map((node) => (
            <TreeNodeRow
              key={node.id}
              node={node}
              depth={0}
              onCreateChild={handleCreate}
              onDelete={handleDelete}
              dragId={dragId}
              onDragStart={(id) => setDragId(id)}
              onDragEnd={() => {
                setDragId(null);
                setDropTarget(null);
                setRootDrop(false);
              }}
              dropTarget={dropTarget}
              onDragOver={handleDragOverRow}
              onDrop={handleDropRow}
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

interface RowProps {
  node: GameObjectTreeNode;
  depth: number;
  onCreateChild: (name: string, parentId?: string | null) => void;
  onDelete: (node: GameObjectTreeNode) => void;
  dragId: string | null;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  dropTarget: DropTarget | null;
  onDragOver: (id: string, event: DragEvent<HTMLDivElement>) => void;
  onDrop: (id: string, event: DragEvent<HTMLDivElement>) => void;
}

function TreeNodeRow({
  node,
  depth,
  onCreateChild,
  onDelete,
  dragId,
  onDragStart,
  onDragEnd,
  dropTarget,
  onDragOver,
  onDrop,
}: RowProps) {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { gameObjectId } = useParams<{ gameObjectId: string }>();
  const expanded = useUiStore((s) => s.expanded);
  const toggleExpanded = useUiStore((s) => s.toggleExpanded);
  const visuals = useObjectVisuals();
  const ripple = useRipple<HTMLDivElement>();

  const [createDialog, setCreateDialog] = useState(false);
  const { data: pages } = usePages(projectId, node.id);

  const isExpanded = Boolean(expanded[node.id]);
  const hasChildren = node.children.length > 0;
  const isActive = gameObjectId === node.id;
  const isRoot = depth === 0;
  const visualsKey = `${projectId}:${node.id}`;
  const effectiveIcon = visuals.icon[visualsKey] ?? node.icon;

  const visiblePages = pages?.filter((p) => p.title !== "Main") ?? [];

  const navigateToNode = () => navigate(`/projects/${projectId}/game-objects/${node.id}`);

  const menuItems: MenuItemDef[] = [
    {
      type: "item",
      label: "Create child",
      icon: <FilePlus2 className="h-4 w-4" />,
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

  const drop = dropTarget && dropTarget.id === node.id ? dropTarget.position : null;

  const row = (
    <div
      ref={ripple.ref}
      onPointerDown={ripple.onPointerDown}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isActive}
      tabIndex={0}
      draggable
      onClick={navigateToNode}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", node.id);
        onDragStart(node.id);
      }}
      onDragOver={(e) => onDragOver(node.id, e)}
      onDrop={(e) => onDrop(node.id, e)}
      onDragEnd={onDragEnd}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigateToNode();
        }
      }}
      className={cn(
        "group relative flex h-7 w-full cursor-pointer items-center gap-1 rounded-small pr-1 text-sm",
        "hover:bg-surface-hover",
        isActive ? "bg-surface-selected text-text" : "text-text",
        dragId === node.id && "opacity-50",
        drop === "inside" && "bg-primary/10 ring-1 ring-inset ring-primary/50",
        drop === "before" && "before:absolute before:inset-x-1 before:top-0 before:h-0.5 before:rounded before:bg-primary",
        drop === "after" && "after:absolute after:inset-x-1 after:bottom-0 after:h-0.5 after:rounded after:bg-primary",
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

      <span className={cn("shrink-0", isRoot ? "text-primary" : "text-icon")}>
        {objectIcon(node.name, effectiveIcon)}
      </span>

      <span className={cn("min-w-0 flex-1 truncate", isRoot && "font-medium")}>{node.name}</span>

      <span className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
        <IconButton
          size="icon"
          aria-label={`Create child under ${node.name}`}
          className="h-5 w-5"
          onClick={(e) => {
            e.stopPropagation();
            setCreateDialog(true);
          }}
        >
          <FilePlus2 className="h-3.5 w-3.5" />
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
  );

  return (
    <li data-testid="tree-node">
      <ContextMenu items={menuItems}>
        <Tooltip
          delay={250}
          className="block w-full"
          content={
            <div className="max-w-64">
              <div className="font-semibold">{node.name}</div>
              {visiblePages.length === 0 ? (
                <div className="mt-0.5 text-text-on-dark-muted">No pages inside</div>
              ) : (
                <ul className="mt-0.5">
                  {visiblePages.slice(0, 5).map((page) => (
                    <li key={page.id} className="truncate">
                      {page.title}
                    </li>
                  ))}
                  {visiblePages.length > 5 && (
                    <li className="text-text-on-dark-muted">And {visiblePages.length - 5} more…</li>
                  )}
                </ul>
              )}
            </div>
          }
        >
          {row}
        </Tooltip>
      </ContextMenu>

      {visiblePages.length > 0 && (
        <ul role="group">
          {visiblePages.map((page) => (
            <li
              key={page.id}
              className="flex h-6 cursor-pointer items-center gap-1 rounded-small pr-1 text-sm text-text-secondary hover:bg-surface-hover hover:text-text"
              style={{ paddingLeft: depth * 14 + 6 + 20 }}
              onClick={navigateToNode}
            >
              <FileText className="h-3.5 w-3.5 shrink-0 text-icon-muted" />
              <span className="min-w-0 flex-1 truncate">{page.title}</span>
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
              dragId={dragId}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              dropTarget={dropTarget}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          ))}
        </ul>
      )}

      <NameDialog
        open={createDialog}
        title={`New child object for ${node.name}`}
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