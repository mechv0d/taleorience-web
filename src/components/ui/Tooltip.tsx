import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

interface TooltipProps {
  /** Short text label. Prefer this over `content` for plain tooltips. */
  label?: ReactNode;
  /** Rich content (e.g. a list of pages). Overrides `label` when both are set. */
  content?: ReactNode;
  children: ReactNode;
  /** Preferred side; flips to the opposite one when there is no room. Defaults to below. */
  side?: "top" | "bottom";
  /** Delay (ms) before showing on hover — used for tree-row previews. */
  delay?: number;
  /** Keep the tooltip open when the pointer moves onto it (clickable content). */
  interactive?: boolean;
  className?: string;
  contentClassName?: string;
}

const GAP = 6;
const VIEWPORT_PADDING = 8;

/**
 * Positioned tooltip rendered in a portal. Appears below the trigger by default
 * (a top-anchored tooltip gets clipped by the browser chrome), flips/clamps to
 * stay inside the viewport, and closes on click, Escape, blur or mouse leave.
 */
export function Tooltip({
  label,
  content,
  children,
  side = "bottom",
  delay = 0,
  interactive = false,
  className,
  contentClassName,
}: TooltipProps) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [positioned, setPositioned] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number; side: "top" | "bottom" } | null>(null);
  const showTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);

  const clearTimers = () => {
    if (showTimer.current) window.clearTimeout(showTimer.current);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    showTimer.current = null;
    hideTimer.current = null;
  };

  const close = useCallback(() => {
    clearTimers();
    setOpen(false);
    setPositioned(false);
    setPos(null);
  }, []);

  const openNow = useCallback(() => {
    if (open) return;
    clearTimers();
    setOpen(true);
  }, [open]);

  const scheduleShow = useCallback(() => {
    clearTimers();
    if (delay > 0) {
      showTimer.current = window.setTimeout(openNow, delay);
    } else {
      openNow();
    }
  }, [delay, openNow]);

  const scheduleHide = useCallback(() => {
    clearTimers();
    hideTimer.current = window.setTimeout(close, interactive ? 120 : 60);
  }, [close, interactive]);

  // Measure and clamp once the panel is rendered.
  useLayoutEffect(() => {
    if (!open) return;
    const trigger = wrapperRef.current;
    const panel = panelRef.current;
    if (!trigger || !panel) return;
    const t = trigger.getBoundingClientRect();
    const p = panel.getBoundingClientRect();

    let x = t.left + t.width / 2 - p.width / 2;
    x = Math.max(VIEWPORT_PADDING, Math.min(x, window.innerWidth - p.width - VIEWPORT_PADDING));

    let y = side === "bottom" ? t.bottom + GAP : t.top - p.height - GAP;
    let effectiveSide = side;
    const overflowBottom = y + p.height + GAP > window.innerHeight - VIEWPORT_PADDING;
    const overflowTop = y < VIEWPORT_PADDING;
    if (overflowBottom && side === "bottom" && t.top - p.height - GAP >= VIEWPORT_PADDING) {
      y = t.top - p.height - GAP;
      effectiveSide = "top";
    } else if (overflowTop && side === "top" && t.bottom + p.height + GAP <= window.innerHeight - VIEWPORT_PADDING) {
      y = t.bottom + GAP;
      effectiveSide = "bottom";
    }
    y = Math.max(VIEWPORT_PADDING, Math.min(y, window.innerHeight - p.height - VIEWPORT_PADDING));

    setPos({ x, y, side: effectiveSide });
    setPositioned(true);
  }, [open, side]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = () => {
      if (!interactive) close();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open, interactive, close]);

  useEffect(() => clearTimers, []);

  return (
    <>
      <span
        ref={wrapperRef}
        className={cn("group relative", className)}
        onMouseEnter={scheduleShow}
        onMouseLeave={scheduleHide}
        onFocus={scheduleShow}
        onBlur={scheduleHide}
        onClick={close}
      >
        {children}
      </span>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            role="tooltip"
            className={cn(
              "pointer-events-none fixed z-50 rounded-medium",
              "bg-app-bar px-2 py-1 text-xs font-medium text-text-on-dark shadow-popover",
              "animate-tooltip-in",
              interactive && "pointer-events-auto",
              !positioned && "invisible",
              contentClassName,
            )}
            style={pos ? { left: pos.x, top: pos.y } : undefined}
            onMouseEnter={interactive ? () => clearTimers() : undefined}
            onMouseLeave={interactive ? scheduleHide : undefined}
          >
            {content ?? label}
          </div>,
          document.body,
        )}
    </>
  );
}