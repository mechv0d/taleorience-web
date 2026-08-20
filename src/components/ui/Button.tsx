import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "dark" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-page hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary",
  secondary: "bg-surface text-text hover:bg-surface-hover disabled:opacity-50",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text disabled:opacity-50",
  dark: "bg-app-bar-active text-text-on-dark hover:bg-app-bar-hover disabled:opacity-50",
  outline:
    "bg-page text-text border border-border hover:bg-surface-hover disabled:opacity-50",
  danger: "bg-danger text-page hover:bg-danger/80 disabled:opacity-50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-7 gap-1.5 px-2 text-xs",
  md: "h-8 gap-2 px-3 text-sm",
  lg: "h-9 gap-2 px-4 text-sm",
  icon: "h-7 w-7 justify-center p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", leadingIcon, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-medium font-medium transition-colors select-none",
        "focus-visible:outline-2 focus-visible:outline-focus",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {leadingIcon}
      {children}
    </button>
  );
});

/** Icon-only button with accessible label. */
export const IconButton = forwardRef<HTMLButtonElement, ButtonProps>(function IconButton(
  { className, variant = "ghost", size = "icon", "aria-label": ariaLabel, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      aria-label={ariaLabel}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
});