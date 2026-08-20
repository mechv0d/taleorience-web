import { type InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-8 w-full rounded-small border border-border bg-page px-2.5 text-sm text-text",
        "placeholder:text-text-muted",
        "hover:border-text-disabled",
        "focus:border-focus focus:outline-none",
        invalid && "border-danger",
        className,
      )}
      {...props}
    />
  );
});