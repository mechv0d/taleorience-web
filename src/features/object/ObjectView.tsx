import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ChevronRight, House } from "lucide-react";

import { useBlocks, useGameObjectTree, usePages } from "@/api/hooks";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ancestorPath, findNode } from "@/lib/tree";
import { cn } from "@/lib/cn";
import { objectIcon } from "@/features/tree/objectIcons";
import { BlockRenderer } from "@/features/editor/BlockRenderer";
import type { Page } from "@/api/types";

export function ObjectView() {
  const { projectId, gameObjectId } = useParams<{ projectId: string; gameObjectId: string }>();
  const { data: tree, isLoading: treeLoading } = useGameObjectTree(projectId);
  const { data: pages, isLoading: pagesLoading } = usePages(projectId, gameObjectId);

  const [activePageId, setActivePageId] = useState<string | null>(null);

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

  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-page">
      <div className="mx-auto w-full max-w-3xl flex-1 px-8 py-6">
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
          <span className="text-4xl text-icon">{objectIcon(node.name)}</span>
          <h1 className="text-4xl font-bold text-text">{node.name}</h1>
          {isRoot && (
            <Badge variant="primary">
              <House className="h-3 w-3" />
              Home
            </Badge>
          )}
        </div>

        {/* Page tabs */}
        {pagesLoading ? (
          <div className="mt-6 flex justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : pages && pages.length > 0 ? (
          <>
            <div className="mt-6 flex items-center gap-1 border-b border-border">
              {pages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setActivePageId(page.id)}
                  aria-selected={page.id === activePage?.id}
                  className={cn(
                    "-mb-px border-b-2 px-3 py-2 text-sm",
                    page.id === activePage?.id
                      ? "border-primary font-semibold text-text"
                      : "border-transparent text-text-secondary hover:text-text",
                  )}
                >
                  {page.title}
                </button>
              ))}
            </div>

            <PageBlocks key={activePage?.id} pageId={activePage?.id} projectId={projectId} />
          </>
        ) : (
          <p className="mt-8 text-sm text-text-muted">This object has no pages yet.</p>
        )}
      </div>
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