import { useState } from "react";

import { useBlocks, useCreateBlock, useDeleteBlock, useDuplicateBlock, useMoveBlock } from "@/api/hooks";
import { AddBlockMenu } from "./AddBlockMenu";
import { BlockActions } from "./BlockActions";
import { BlockEditor } from "./BlockEditor";
import { TextBlockEditor } from "./TextBlockEditor";
import type { BlockInput } from "@/api/types";

/** Edit-mode document surface: every block becomes editable, with a hover
 *  toolbar (move / duplicate / delete / add-below) and an Add Block control. */
export function PageEditor({ projectId, pageId }: { projectId: string | undefined; pageId: string }) {
  const { data: blocks, isLoading } = useBlocks(projectId, pageId);
  const createBlock = useCreateBlock();
  const deleteBlock = useDeleteBlock();
  const moveBlock = useMoveBlock();
  const duplicateBlock = useDuplicateBlock();
  const [pendingBlockId, setPendingBlockId] = useState<string | null>(null);

  if (isLoading || !projectId) return null;

  const handleAdd = (input: BlockInput) => {
    createBlock.mutate({ projectId, pageId, input }, {
      onSuccess: (block) => setPendingBlockId(block.id),
    });
  };

  const list = blocks ?? [];

  return (
    <div className="space-y-3 pt-6" data-testid="page-editor">
      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <p className="text-sm text-text-muted">This page is empty.</p>
          <AddBlockMenu projectId={projectId} onAdd={handleAdd} />
        </div>
      ) : (
        <>
          <div className="flex justify-end">
            <AddBlockMenu projectId={projectId} onAdd={handleAdd} align="end" />
          </div>
          <div className="space-y-3">
            {list.map((block, index) => (
              <div
                key={block.id}
                data-testid="editable-block"
                className="group/block relative rounded-small p-1 transition-colors hover:bg-surface/60"
              >
                <div className="pointer-events-none absolute right-1 top-1 z-30 opacity-0 transition-opacity group-hover/block:pointer-events-auto group-hover/block:opacity-100">
                  <BlockActions
                    projectId={projectId}
                    canMoveUp={index > 0}
                    canMoveDown={index < list.length - 1}
                    onMoveUp={() =>
                      moveBlock.mutate({ projectId, blockId: block.id, toIndex: block.sortOrder - 1, pageId })
                    }
                    onMoveDown={() =>
                      moveBlock.mutate({ projectId, blockId: block.id, toIndex: block.sortOrder + 1, pageId })
                    }
                    onDuplicate={() => duplicateBlock.mutate({ projectId, blockId: block.id, pageId })}
                    onDelete={() => deleteBlock.mutate({ projectId, blockId: block.id, pageId })}
                    onAdd={handleAdd}
                  />
                </div>
                {block.type === "text" ? (
                  <TextBlockEditor
                    key={block.id}
                    projectId={projectId}
                    pageId={pageId}
                    blockId={block.id}
                    initialContent={block.data.content}
                    autoFocus={pendingBlockId === block.id}
                  />
                ) : (
                  <BlockEditor key={block.id} projectId={projectId} block={block} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center pt-1">
            <AddBlockMenu projectId={projectId} onAdd={handleAdd} />
          </div>
        </>
      )}
    </div>
  );
}