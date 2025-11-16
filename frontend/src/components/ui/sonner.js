import { Toaster as Sonner } from "sonner";

export const Toaster = ({ ...props }) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-[color:var(--fg)] group-[.toaster]:border-[color:var(--border)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[color:var(--fg-muted)]",
          actionButton: "group-[.toast]:bg-[color:var(--primary)] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[color:var(--muted)] group-[.toast]:text-[color:var(--fg-muted)]",
          error: "group-[.toaster]:bg-[#FEF2F2] group-[.toaster]:text-[#991b1b] group-[.toaster]:border-[#FCA5A5]",
          success: "group-[.toaster]:bg-[#ECFDF5] group-[.toaster]:text-[#065F46] group-[.toaster]:border-[#6EE7B7]",
        },
      }}
      {...props}
    />
  );
};
