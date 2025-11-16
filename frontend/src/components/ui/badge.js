import * as React from "react";
import { cn } from "../../lib/utils";

export const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "bg-[color:var(--muted)] text-[color:var(--fg)]",
    scheduled: "bg-[#E6F6F1] text-[#2C8E78]",
    sent: "bg-[#ECFDF5] text-[#2E7D32]",
    delivered: "bg-[#E6F6FF] text-[#2563EB]",
    read: "bg-[#F0F9FF] text-[#0C4A6E]",
    failed: "bg-[#FEF2F2] text-[#B91C1C]",
    canceled: "bg-[#F3F4F6] text-[#6B7280]"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

Badge.displayName = "Badge";
