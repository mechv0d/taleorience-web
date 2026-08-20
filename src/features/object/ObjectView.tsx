import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  ChevronRight,
  Ellipsis,
  FilePlus2,
  House,
  ImagePlus,
  Pencil,
  Check,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useBlocks,
  useCreatePage,
  useDeletePage,
  useGameObjectTree,
  useMovePage,
  usePages,
  useUpdateGameObject,
  useUpdatePage,
} from "@/api/hooks";
import { assetContentUrl } from "@/api/endpoints";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ContextMenu, type MenuItemDef } from "@/components/ui/ContextMenu";
import { NameDialog } from "@/components/ui/NameDialog";
import { Popover } from "@/components/ui/Popover";
import { useRipple } from "@/components/ui/Ripple";
import { Spinner } from "@/components/ui/Spinner";
import { ancestorPath, findNode } from "@/lib/tree";
import { cn } from "@/lib/cn";
import { objectIcon } from "@/features/tree/objectIcons";
import { IconGrid, IconPicker } from "@/features/tree/IconPicker";
import { AssetGrid } from "@/features/editor/AssetGrid";
import { BlockRenderer } from "@/features/editor/BlockRenderer";
import { PageEditor } from "@/features/editor/PageEditor";
import { useSaveStore } from "@/features/editor/saveStore";
import { useObjectVisuals } from "@/stores/objectVisualsStore";
import type { ObjectIconName, Page } from "@/api/types";

export function ObjectView() {
  const { projectId, gameObjectId } = useParams<{ projectId: string; gameObjectId: string }>();
  const { data: tree, isLoading: treeLoading } = useGameObjectTree(projectId);
  const { data: pages, isLoading: pagesLoading } = usePages(projectId, gameObjectId);

  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [renameTarget, setRenameTarget] = useState<Page | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
  const [createPageOpen, setCreatePageOpen] = useState(false);
  const [dragPageId, setDragPageId] = useState<string | null>(null);
  const savePending = useSaveStore((s) => s.pending);
  const lastSavedAt = useSaveStore((s) => s.lastSavedAt);

  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const deletePage = useDeletePage();
  const movePage = useMovePage();
  const updateGameObject = useUpdateGameObject();
  const visuals = useObjectVisuals();
  const [headerView, setHeaderView] = useState<"menu" | "icon" | "banner">("menu");

  const node = useMemo(() => findNode(tree ?? [], gameObjectId ?? ""), [tree, gameObjectId]);
  const path = useMemo(() => ancestorPath(tree ?? [], gameObjectId ?? ""), [tree, gameObjectId]);

  const activePage: Page | undefined =
    pages?.find((p) => p.id === activePageId) ??
    pages?.find((p) => p.sortOrder === 0) ??
    pages?.[0];

  if (treeLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
        <h1 className="text-lg font-semibold text-text">Object not found</h1>
        <p className="text-sm text-text-secondary">
          It may have been deleted or the link is wrong.
        </p>
      </div>
    );
  }

  const isRoot = path.length <= 1;
  const visualsKey = `${projectId}:${gameObjectId}`;
  const effectiveIcon = visuals.icon[visualsKey] ?? node.icon;
  const bannerAssetId = visuals.banner[visualsKey] ?? node.bannerAssetId ?? null;

  const selectIcon = (icon: ObjectIconName) => {
    if (!projectId || !gameObjectId) return;
    useObjectVisuals.getState().setIcon(visualsKey, icon);
    // TODO(backend): needs `POST /game-objects/:goId/update` — see backend-should-implement.md.
    updateGameObject.mutate(
      { projectId, gameObjectId, input: { icon } },
      { onError: (error) => console.warn("Icon not persisted yet:", error) },
    );
  };

  const selectBanner = (assetId: string | null) => {
    if (!projectId || !gameObjectId) return;
    useObjectVisuals.getState().setBanner(visualsKey, assetId);
    // TODO(backend): needs `POST /game-objects/:goId/update` — see backend-should-implement.md.
    updateGameObject.mutate(
      { projectId, gameObjectId, input: { bannerAssetId: assetId } },
      { onError: (error) => console.warn("Banner not persisted yet:", error) },
    );
  };

  const handleCreatePage = (title: string) => {
    if (!projectId || !gameObjectId) return;
    // TODO(backend): needs `POST /game-objects/:goId/pages` — see backend-should-implement.md.
    createPage.mutate(
      { projectId, gameObjectId, title },
      {
        onSuccess: (page) => setActivePageId(page.id),
        onError: (error) => console.warn("Page not created yet:", error),
      },
    );
  };

  const handleRenamePage = (title: string) => {
    if (!projectId || !gameObjectId || !renameTarget) return;
    // TODO(backend): needs `POST /game-objects/:goId/pages/:pageId/update` — see backend-should-implement.md.
    updatePage.mutate(
      { projectId, gameObjectId, pageId: renameTarget.id, title },
      { onError: (error) => console.warn("Page not renamed yet:", error) },
    );
  };

  const handleDeletePage = () => {
    if (!projectId || !gameObjectId || !deleteTarget) return;
    // TODO(backend): needs `POST /game-objects/:goId/pages/:pageId/delete` — see backend-should-implement.md.
    deletePage.mutate(
      { projectId, gameObjectId, pageId: deleteTarget.id },
      {
        onSuccess: () => {
          if (activePageId === deleteTarget.id) setActivePageId(null);
        },
        onError: (error) => console.warn("Page not deleted yet:", error),
      },
    );
  };

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-page">
      <div className="mx-auto w-full max-w-3xl flex-1 px-8 py-6">
        {bannerAssetId && projectId && (
          <div className="mb-4 overflow-hidden rounded-large border border-border-subtle">
            <img
              src={assetContentUrl(projectId, bannerAssetId)}
              alt=""
              className="aspect-[21/9] w-full object-cover"
            />
          </div>
        )}

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1 text-sm text-text-muted">
          {path.map((item, index) => {
            const isLast = index === path.length - 1;
            return (
              <span key={item.id} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                {isLast ? (
                  <span className="text-text-secondary">{item.name}</span>
                ) : (
                  <Link
                    to={`/projects/${projectId}/game-objects/${item.id}`}
                    className="hover:text-text"
                  >
                    {item.name}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        {/* Title */}
        <div className="flex items-center gap-3">
          <IconPicker value={effectiveIcon} onSelect={selectIcon} trigger={({ toggle }) => (
            <button
              onClick={toggle}
              aria-label="Change icon"
              title="Change icon"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-medium text-icon transition-colors hover:bg-surface-hover hover:text-text"
            >
              <span className="text-3xl">{objectIcon(node.name, effectiveIcon)}</span>
            </button>
          )} />
          <h1 className="min-w-0 flex-1 truncate text-4xl font-bold text-text">{node.name}</h1>
          {isRoot && (
            <Badge variant="primary">
              <House className="h-3 w-3" />
              Home
            </Badge>
          )}
          <Popover
            label="Object options"
            trigger={({ open, toggle }) => (
              <IconButton
                size="icon"
                aria-label={`Options for ${node.name}`}
                aria-expanded={open}
                className="h-8 w-8 self-start"
                onClick={() => {
                  setHeaderView("menu");
                  toggle();
                }}
              >
                <Ellipsis className="h-4 w-4" />
              </IconButton>
            )}
          >
            {({ close }) => {
              if (headerView === "icon") {
                return (
                  <IconGrid
                    value={effectiveIcon}
                    onSelect={(icon) => {
                      selectIcon(icon);
                      close();
                      setHeaderView("menu");
                    }}
                    onBack={() => setHeaderView("menu")}
                  />
                );
              }
              if (headerView === "banner") {
                return (
                  <div className="w-72 p-3">
                    <div className="mb-2 flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Back"
                        onClick={() => setHeaderView("menu")}
                        className="h-7 w-7 justify-center p-0"
                      >
                        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                      </Button>
                      <p className="text-xs font-medium text-text">Banner</p>
                    </div>
                    <AssetGrid
                      projectId={projectId ?? ""}
                      multi={false}
                      selected={bannerAssetId ? [bannerAssetId] : []}
                      onSelect={(ids) => {
                        selectBanner(ids[0] ?? null);
                        close();
                        setHeaderView("menu");
                      }}
                    />
                  </div>
                );
              }
              return (
                <div className="py-1">
                  <button
                    onClick={() => setHeaderView("icon")}
                    className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-sm text-text hover:bg-surface-hover"
                  >
                    <span className="text-icon">{objectIcon(node.name, effectiveIcon)}</span>
                    Change icon
                  </button>
                  <button
                    onClick={() => setHeaderView("banner")}
                    className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left text-sm text-text hover:bg-surface-hover"
                  >
                    <ImagePlus className="h-4 w-4 text-icon" />
                    Set banner
                  </button>
                </div>
              );
            }}
          </Popover>
        </div>

        {/* Page tabs */}
        {pagesLoading ? (
          <div className="mt-6 flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : pages && pages.length > 0 ? (
          <>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div
                className="flex items-center gap-1 border-b border-border"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragPageId && projectId && gameObjectId) {
                    // TODO(backend): needs `POST /game-objects/:goId/pages/:pageId/move` — see backend-should-implement.md.
                    movePage.mutate(
                      { projectId, gameObjectId, pageId: dragPageId, toIndex: pages.length - 1 },
                      { onError: (error) => console.warn("Page not moved yet:", error) },
                    );
                  }
                  setDragPageId(null);
                }}
              >
                {pages.map((page) => (
                  <PageTab
                    key={page.id}
                    page={page}
                    active={page.id === activePage?.id}
                    onSelect={() => setActivePageId(page.id)}
                    onRename={() => setRenameTarget(page)}
                    onDelete={() => setDeleteTarget(page)}
                    onDragStart={(id) => setDragPageId(id)}
                  />
                ))}
                <button
                  onClick={() => setCreatePageOpen(true)}
                  aria-label="New page"
                  title="New page"
                  className="-mb-px flex h-9 w-9 items-center justify-center rounded-small text-icon-muted hover:bg-surface-hover hover:text-text"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 pb-1.5">
                {editing && (
                  <span data-testid="save-status" className="text-xs text-text-muted">
                    {savePending > 0 ? "Saving…" : lastSavedAt ? "Saved" : "Edit mode"}
                  </span>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setEditing((v) => !v)}
                  data-testid="edit-toggle"
                  leadingIcon={editing ? <Check className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                >
                  {editing ? "Done" : "Edit page"}
                </Button>
              </div>
            </div>

            {editing && activePage ? (
              <PageEditor key={activePage.id} projectId={projectId} pageId={activePage.id} />
            ) : (
              <PageBlocks key={activePage?.id} pageId={activePage?.id} projectId={projectId} />
            )}
          </>
        ) : (
          <p className="mt-8 text-sm text-text-muted">This object has no pages yet.</p>
        )}
      </div>

      <NameDialog
        open={createPageOpen}
        title="New page"
        placeholder="Page title"
        confirmLabel="Create"
        busy={createPage.isPending}
        onSubmit={(title) => {
          setCreatePageOpen(false);
          handleCreatePage(title);
        }}
        onCancel={() => setCreatePageOpen(false)}
      />

      <NameDialog
        open={Boolean(renameTarget)}
        title={`Rename page`}
        placeholder="Page title"
        confirmLabel="Rename"
        busy={updatePage.isPending}
        defaultValue={renameTarget?.title ?? ""}
        onSubmit={(title) => {
          setRenameTarget(null);
          handleRenamePage(title);
        }}
        onCancel={() => setRenameTarget(null)}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        danger
        title={`Delete ${deleteTarget?.title ?? "page"}?`}
        description="The page and its blocks will be removed."
        confirmLabel="Delete"
        busy={deletePage.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          handleDeletePage();
          setDeleteTarget(null);
        }}
      />
    </main>
  );
}

function PageBlocks({ pageId, projectId }: { pageId?: string; projectId?: string }) {
  const { data: blocks, isLoading } = useBlocks(projectId, pageId);

  if (!pageId || !projectId) return null;
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-6" data-testid="page-blocks">
      {blocks && blocks.length > 0 ? (
        blocks.map((block) => <BlockRenderer key={block.id} block={block} />)
      ) : (
        <p className="text-sm text-text-muted">This page is empty.</p>
      )}
    </div>
  );
}

function PageTab({
  page,
  active,
  onSelect,
  onRename,
  onDelete,
  onDragStart,
}: {
  page: Page;
  active: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
  onDragStart: (id: string) => void;
}) {
  const ripple = useRipple<HTMLButtonElement>();
  const menuItems: MenuItemDef[] = [
    {
      type: "item",
      label: "Rename",
      icon: <Pencil className="h-4 w-4" />,
      onSelect: onRename,
    },
    {
      type: "item",
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      danger: true,
      onSelect: onDelete,
    },
  ];

  return (
    <ContextMenu items={menuItems}>
      <button
        ref={ripple.ref}
        onPointerDown={ripple.onPointerDown}
        onClick={onSelect}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", page.id);
          onDragStart(page.id);
        }}
        aria-selected={active}
        className={cn(
          "-mb-px flex h-9 items-center gap-1.5 border-b-2 px-3 py-2 text-sm",
          active
            ? "border-primary font-semibold text-text"
            : "border-transparent text-text-secondary hover:text-text",
        )}
      >
        <FilePlus2 className="h-3.5 w-3.5 text-icon-muted" />
        {page.title}
      </button>
    </ContextMenu>
  );
}