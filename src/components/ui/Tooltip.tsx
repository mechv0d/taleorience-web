import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}

/** Lightweight CSS-only tooltip wrapper (hover / focus). */
export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  return (
    <span
      role="tooltip"
      className={cn("group relative inline-flex", className)}
      tabIndex={-1}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-medium",
          "bg-app-bar px-2 py-1 text-xs font-medium text-text-on-dark opacity-0 shadow-popover",
          "transition-opacity duration-100 group-hover:opacity-100 group-focus-within:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {label}
      </span>
    </span>
  );
}