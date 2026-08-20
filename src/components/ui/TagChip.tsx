import { X } from "lucide-react";

import { IconButton } from "./Button";
import { cn } from "@/lib/cn";

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

/** Neutral tag pill with optional remove action. */
export function TagChip({ label, onRemove, className }: TagChipProps) {
  return (
    <span
      data-testid="tag-chip"
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded-pill border border-tag-border bg-tag-background py-0.5 pl-2.5 pr-1",
        "text-xs font-medium text-tag-text",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      {onRemove && (
        <IconButton
          aria-label={`Remove tag ${label}`}
          onClick={onRemove}
          size="icon"
          className="h-4 w-4 rounded-full text-tag-remove hover:bg-surface-hover hover:text-text"
        >
          <X className="h-3 w-3" />
        </IconButton>
      )}
    </span>
  );
}