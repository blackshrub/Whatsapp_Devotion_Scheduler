import * as React from "react";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";

const DialogContext = React.createContext();

export const Dialog = ({ open, onOpenChange, children }) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild }) => {
  const { onOpenChange } = React.useContext(DialogContext);
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true)
    });
  }
  
  return (
    <button onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
};

export const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(DialogContext);
    
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
          onClick={() => onOpenChange(false)}
        />
        <div
          ref={ref}
          className={cn(
            "relative z-50 w-full max-w-lg bg-white rounded-lg shadow-lg p-6",
            "animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        >
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
            data-testid="dialog-close"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    );
  }
);

export const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
    {...props}
  />
);

export const DialogTitle = React.forwardRef(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);

export const DialogDescription = React.forwardRef(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-[color:var(--fg-muted)]", className)}
      {...props}
    />
  )
);
