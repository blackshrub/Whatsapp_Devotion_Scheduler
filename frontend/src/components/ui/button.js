import * as React from "react";
import { cn } from "../../lib/utils";

export const Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-700)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-600)]",
      secondary: "bg-[color:var(--muted)] text-[color:var(--fg)] hover:bg-[#e9ecef]",
      ghost: "bg-transparent text-[color:var(--fg)] hover:bg-[rgba(12,18,32,0.04)]",
      destructive: "bg-[color:var(--error)] text-white hover:bg-[#991b1b]"
    };

    const sizes = {
      default: "h-10 px-4",
      sm: "h-9 px-3 text-sm",
      lg: "h-11 px-6",
      icon: "h-10 w-10"
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
