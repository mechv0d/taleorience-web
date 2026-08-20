import { type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 px-6 py-12 text-center",
        className,
      )}
    >
      {icon && <div className="mb-1 text-icon-muted">{icon}</div>}
      <h3 className="text-sm font-semibold text-text">{title}</h3>
      {description && <p className="max-w-sm text-sm text-text-secondary">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}