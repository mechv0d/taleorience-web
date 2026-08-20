import { useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "./Button";
import { Input } from "./Input";

interface NameDialogProps {
  open: boolean;
  title: string;
  placeholder?: string;
  confirmLabel?: string;
  busy?: boolean;
  defaultValue?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function NameDialog({
  open,
  title,
  placeholder,
  confirmLabel = "Create",
  busy,
  defaultValue = "",
  onSubmit,
  onCancel,
}: NameDialogProps) {
  const [value, setValue] = useState(defaultValue);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-large border border-border bg-page p-5 shadow-popover"
      >
        <h2 className="text-base font-semibold text-text">{title}</h2>
        <form
          className="mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed) onSubmit(trimmed);
          }}
        >
          <Input
            autoFocus
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label={title}
          />
          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!value.trim() || busy}>
              {confirmLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}