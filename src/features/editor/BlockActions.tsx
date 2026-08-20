import { ChevronDown, ChevronUp, Copy, Trash2 } from "lucide-react";

import { IconButton } from "@/components/ui/Button";
import { AddBlockMenu } from "./AddBlockMenu";
import type { BlockInput } from "@/api/types";

interface BlockActionsProps {
  projectId: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAdd: (input: BlockInput) => void;
}

/** Hover actions shown next to a block while editing the page. */
export function BlockActions({
  projectId,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onAdd,
}: BlockActionsProps) {
  return (
    <div className="absolute right-0 top-0 z-30 flex items-center gap-0.5 rounded-small border border-border bg-page px-1 py-0.5 shadow-popover">
      <AddBlockMenu projectId={projectId} align="end" onAdd={onAdd} compact />
      <IconButton aria-label="Move up" title="Move up" disabled={!canMoveUp} onClick={onMoveUp} className="h-6 w-6">
        <ChevronUp className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton aria-label="Move down" title="Move down" disabled={!canMoveDown} onClick={onMoveDown} className="h-6 w-6">
        <ChevronDown className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton aria-label="Duplicate block" title="Duplicate" onClick={onDuplicate} className="h-6 w-6">
        <Copy className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton aria-label="Delete block" title="Delete" onClick={onDelete} className="h-6 w-6 hover:bg-danger-soft hover:text-danger">
        <Trash2 className="h-3.5 w-3.5" />
      </IconButton>
    </div>
  );
}