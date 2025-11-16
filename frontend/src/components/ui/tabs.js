import * as React from "react";
import { cn } from "../../lib/utils";

const TabsContext = React.createContext();

export const Tabs = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value);
  
  const currentValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-start rounded-md bg-[color:var(--muted)] p-1 gap-1",
        className
      )}
      {...props}
    />
  );
};

export const TabsTrigger = ({ value, className, ...props }) => {
  const context = React.useContext(TabsContext);
  const isActive = context?.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context?.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-600)]",
        isActive
          ? "bg-white text-[color:var(--fg)] shadow-sm"
          : "text-[color:var(--fg-muted)] hover:text-[color:var(--fg)]",
        className
      )}
      {...props}
    />
  );
};

export const TabsContent = ({ value, className, ...props }) => {
  const context = React.useContext(TabsContext);
  
  if (context?.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus:outline-none", className)}
      {...props}
    />
  );
};
