import React, { useState, createContext, useContext } from 'react';
import { Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './modal';

const CommandContext = createContext();

export const Command = ({ children, className = '', ...props }) => {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const contextValue = {
    search,
    setSearch,
    open,
    setOpen
  };

  return (
    <CommandContext.Provider value={contextValue}>
      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-gray-950 ${className}`}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
};

export const CommandDialog = ({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className = '',
  open,
  onOpenChange,
  ...props
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`overflow-hidden p-0 shadow-lg ${className}`} {...props}>
        <DialogHeader className="px-4 pb-4 pt-5">
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </DialogHeader>
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-gray-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export const CommandInput = ({ className = '', placeholder = "Type a command or search...", ...props }) => {
  const { search, setSearch } = useContext(CommandContext) || {};

  return (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        className={`flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        placeholder={placeholder}
        value={search || ''}
        onChange={(e) => setSearch?.(e.target.value)}
        {...props}
      />
    </div>
  );
};

export const CommandList = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`max-h-[300px] overflow-y-auto overflow-x-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CommandEmpty = ({ children = "No results found.", className = '', ...props }) => {
  return (
    <div
      className={`py-6 text-center text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CommandGroup = ({ children, heading, className = '', ...props }) => {
  return (
    <div className={`overflow-hidden p-1 text-gray-950 ${className}`} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-gray-500" cmdk-group-heading="">
          {heading}
        </div>
      )}
      <div cmdk-group-items="">
        {children}
      </div>
    </div>
  );
};

export const CommandSeparator = ({ className = '', ...props }) => {
  return (
    <div
      className={`-mx-1 h-px bg-gray-200 ${className}`}
      {...props}
    />
  );
};

export const CommandItem = ({ children, className = '', onSelect, disabled = false, ...props }) => {
  const handleClick = () => {
    if (!disabled && onSelect) {
      onSelect();
    }
  };

  return (
    <div
      className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-gray-100 aria-selected:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-100'
        } ${className}`}
      onClick={handleClick}
      cmdk-item=""
      {...props}
    >
      {children}
    </div>
  );
};

export const CommandShortcut = ({ children, className = '', ...props }) => {
  return (
    <span
      className={`ml-auto text-xs tracking-widest text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

