import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "neutral" | "primary" | "danger" | "secret";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-surface text-text-secondary border border-border",
  primary: "bg-primary-soft text-primary border border-transparent",
  danger: "bg-danger-soft text-danger border border-transparent",
  secret: "bg-secret-soft text-secret border border-secret-border",
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}