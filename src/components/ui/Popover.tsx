import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/cn";

type Align = "start" | "end";

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (props: { close: () => void }) => ReactNode;
  align?: Align;
  /** Render the panel even when closed (allows animations), defaults to false. */
  className?: string;
  panelClassName?: string;
  id?: string;
  label?: string;
}

/** Uncontrolled anchored popover/dropdown with outside-click and Escape close. */
export function Popover({
  trigger,
  children,
  align = "start",
  className,
  panelClassName,
  id,
  label,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: globalThis.MouseEvent | globalThis.TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      {trigger({ open, toggle })}
      {open && (
        <div
          id={id}
          role={label ? "menu" : undefined}
          aria-label={label}
          className={cn(
            "absolute top-full z-40 mt-1 min-w-48 overflow-hidden rounded-large border border-border bg-page shadow-popover animate-popover-in",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}