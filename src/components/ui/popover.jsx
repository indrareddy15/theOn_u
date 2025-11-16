/* eslint-disable no-unused-vars */
import React, { useState, createContext, useContext } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const PopoverContext = createContext();

export const Popover = ({ children, ...props }) => {
  const [open, setOpen] = useState(false);

  const contextValue = {
    open,
    onOpenChange: setOpen
  };

  return (
    <PopoverContext.Provider value={contextValue}>
      <div className="relative" {...props}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
};

export const PopoverTrigger = React.forwardRef(({
  className = '',
  children,
  ...props
}, ref) => {
  const { open, onOpenChange } = useContext(PopoverContext) || {};

  const handleClick = () => {
    onOpenChange?.(!open);
  };

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center ${className}`}
      onClick={handleClick}
      aria-expanded={open}
      {...props}
    >
      {children}
    </button>
  );
});
PopoverTrigger.displayName = 'PopoverTrigger';

export const PopoverContent = React.forwardRef(({
  className = '',
  align = 'center',
  sideOffset = 4,
  children,
  ...props
}, ref) => {
  const { open, onOpenChange } = useContext(PopoverContext) || {};

  if (!open) return null;

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div
      ref={ref}
      className={cn(
        'z-50 w-72 rounded-md border bg-white p-4 text-gray-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        `absolute top-full mt-${sideOffset}`,
        alignmentClasses[align],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
PopoverContent.displayName = 'PopoverContent';

export const PopoverAnchor = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  );
});
PopoverAnchor.displayName = 'PopoverAnchor';

