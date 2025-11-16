import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[color:var(--border)] bg-white px-3 py-2 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-600)] focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
