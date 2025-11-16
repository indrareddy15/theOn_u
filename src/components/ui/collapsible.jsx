import React, { useState } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(" ");

export const Collapsible = React.forwardRef(({ children, defaultOpen = false, onOpenChange, className, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleOpenChange = (newOpen) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isOpen, onOpenChange: handleOpenChange });
        }
        return child;
      })}
    </div>
  );
});

Collapsible.displayName = "Collapsible";

export const CollapsibleTrigger = React.forwardRef(({ children, className, isOpen, onOpenChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "flex w-full items-center justify-between py-2 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      onClick={() => onOpenChange?.(!isOpen)}
      {...props}
    >
      {children}
    </button>
  );
});

CollapsibleTrigger.displayName = "CollapsibleTrigger";

export const CollapsibleContent = React.forwardRef(({ children, className, isOpen, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "animate-in slide-in-from-top-1" : "animate-out slide-out-to-top-1 h-0",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      style={{
        height: isOpen ? "auto" : "0",
        opacity: isOpen ? 1 : 0
      }}
      {...props}
    >
      <div className="pb-2">
        {children}
      </div>
    </div>
  );
});

CollapsibleContent.displayName = "CollapsibleContent";

