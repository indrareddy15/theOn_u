import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronRight, ChevronDown, Circle } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Create context for menu state
const MenuContext = createContext();

const useMenu = () => {
    const context = useContext(MenuContext);
    if (!context) {
        throw new Error('Menu components must be used within a Menu');
    }
    return context;
};

// Portal component for rendering outside the DOM tree
const Portal = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (typeof window === 'undefined' || !mounted) return null;

    return createPortal(
        children,
        document.body
    );
};

// Main Menu component
export const Menu = ({
    children,
    variant = 'dropdown', // dropdown | context | menubar | navigation
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [activeItem, setActiveItem] = useState(null);
    const triggerRef = useRef(null);

    const value = {
        open,
        setOpen,
        variant,
        position,
        setPosition,
        activeItem,
        setActiveItem,
        triggerRef
    };

    const getContainerStyles = () => {
        switch (variant) {
            case 'menubar':
                return 'flex h-10 items-center space-x-1 rounded-md border bg-white p-1';
            case 'navigation':
                return 'relative z-10 flex max-w-max flex-1 items-center justify-center';
            default:
                return 'relative';
        }
    };

    return (
        <MenuContext.Provider value={value}>
            <div className={getContainerStyles()} {...props}>
                {children}
            </div>
        </MenuContext.Provider>
    );
};

// Menu trigger component
export const MenuTrigger = React.forwardRef(({
    className = '',
    children,
    asChild = false,
    ...props
}, ref) => {
    const { setOpen, setPosition, variant, triggerRef } = useMenu();

    const handleClick = (e) => {
        if (variant === 'dropdown' || variant === 'menubar') {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setPosition({
                x: rect.left,
                y: rect.bottom
            });
            setOpen(prev => !prev);
        }
    };

    const handleContextMenu = (e) => {
        if (variant === 'context') {
            e.preventDefault();
            setPosition({
                x: e.clientX,
                y: e.clientY
            });
            setOpen(true);
        }
    };

    const combinedRef = (node) => {
        triggerRef.current = node;
        if (ref) {
            if (typeof ref === 'function') ref(node);
            else ref.current = node;
        }
    };

    if (asChild) {
        return React.cloneElement(children, {
            ...props,
            ref: combinedRef,
            onClick: handleClick,
            onContextMenu: handleContextMenu
        });
    }

    const getTriggerStyles = () => {
        switch (variant) {
            case 'menubar':
                return 'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-gray-100 data-[state=open]:bg-gray-100';
            case 'navigation':
                return 'group inline-flex h-10 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-50/50 data-[state=open]:bg-gray-50/50';
            case 'context':
                return 'cursor-context-menu';
            default:
                return 'outline-none';
        }
    };

    return (
        <button
            ref={combinedRef}
            className={cn(getTriggerStyles(), className)}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            {...props}
        >
            {children}
            {variant === 'navigation' && (
                <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" />
            )}
        </button>
    );
});
MenuTrigger.displayName = 'MenuTrigger';

// Menu content container
export const MenuContent = React.forwardRef(({
    className = '',
    children,
    align = 'start',
    sideOffset = 4,
    ...props
}, ref) => {
    const { open, setOpen, variant, position } = useMenu();

    // Handle click outside for dropdown and menubar
    useEffect(() => {
        if (!open) return;

        const handleClickOutside = () => {
            if (variant === 'dropdown' || variant === 'menubar') {
                setOpen(false);
            }
        };

        // Add a small delay to prevent immediate closing
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [open, setOpen, variant]);

    // Handle escape key
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, setOpen]);

    if (!open) return null;

    // Calculate position
    const getPosition = () => {
        let x = position.x;
        let y = position.y + sideOffset;

        // Adjust for align
        if (align === 'center') {
            x = position.x - 100; // Approximate center offset
        } else if (align === 'end') {
            x = position.x - 200; // Approximate end offset
        }

        return { x, y };
    };

    const getContentStyles = () => {
        const baseStyles = 'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md';

        switch (variant) {
            case 'context':
                return `${baseStyles} animate-in fade-in-80`;
            case 'navigation':
                return `${baseStyles} data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95`;
            default:
                return baseStyles;
        }
    };

    const { x, y } = getPosition();

    if (variant === 'context') {
        return (
            <Portal>
                <div
                    ref={ref}
                    className={cn(getContentStyles(), className)}
                    style={{
                        position: 'fixed',
                        left: x,
                        top: y
                    }}
                    {...props}
                >
                    {children}
                </div>
            </Portal>
        );
    }

    // For dropdown, menubar, and navigation - use absolute positioning
    return (
        <>
            {(variant === 'dropdown' || variant === 'menubar') && (
                <div className="fixed inset-0 z-10" />
            )}
            <div
                ref={ref}
                className={cn(
                    getContentStyles(),
                    'absolute top-full mt-1 z-20',
                    align === 'start' && 'left-0',
                    align === 'center' && 'left-1/2 -translate-x-1/2',
                    align === 'end' && 'right-0',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </>
    );
});
MenuContent.displayName = 'MenuContent';

// Menu item component
export const MenuItem = React.forwardRef(({
    className = '',
    children,
    variant = 'default',
    inset = false,
    onClick,
    ...props
}, ref) => {
    const { setOpen } = useMenu();

    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        }
        setOpen(false);
    };

    const getItemStyles = () => {
        const baseStyles = 'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50';

        if (variant === 'destructive') {
            return `${baseStyles} text-red-600 focus:bg-red-50 focus:text-red-900`;
        }

        return baseStyles;
    };

    return (
        <div
            ref={ref}
            className={cn(
                getItemStyles(),
                inset && 'pl-8',
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {children}
        </div>
    );
});
MenuItem.displayName = 'MenuItem';

// Menu checkbox item
export const MenuCheckboxItem = React.forwardRef(({
    className = '',
    children,
    checked = false,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {checked && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    );
});
MenuCheckboxItem.displayName = 'MenuCheckboxItem';

// Menu radio item
export const MenuRadioItem = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <Circle className="h-2 w-2 fill-current" />
            </span>
            {children}
        </div>
    );
});
MenuRadioItem.displayName = 'MenuRadioItem';

// Menu label
export const MenuLabel = React.forwardRef(({
    className = '',
    inset = false,
    children,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'px-2 py-1.5 text-sm font-semibold text-gray-900',
                inset && 'pl-8',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
MenuLabel.displayName = 'MenuLabel';

// Menu separator
export const MenuSeparator = React.forwardRef(({
    className = '',
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn('-mx-1 my-1 h-px bg-gray-200', className)}
            {...props}
        />
    );
});
MenuSeparator.displayName = 'MenuSeparator';

// Menu shortcut
export const MenuShortcut = ({ className = '', ...props }) => {
    return (
        <span
            className={cn('ml-auto text-xs tracking-widest text-gray-500', className)}
            {...props}
        />
    );
};

// Menu group
export const MenuGroup = ({ className = '', children, ...props }) => {
    return (
        <div className={cn('p-1', className)} {...props}>
            {children}
        </div>
    );
};

// Navigation specific components
export const NavigationMenuList = React.forwardRef(({
    className = '',
    ...props
}, ref) => {
    return (
        <ul
            ref={ref}
            className={cn('group flex flex-1 list-none items-center justify-center space-x-1', className)}
            {...props}
        />
    );
});
NavigationMenuList.displayName = 'NavigationMenuList';

export const NavigationMenuItem = React.forwardRef(({
    className = '',
    ...props
}, ref) => {
    return (
        <li ref={ref} className={className} {...props} />
    );
});
NavigationMenuItem.displayName = 'NavigationMenuItem';

export const NavigationMenuViewport = React.forwardRef(({
    className = '',
    ...props
}, ref) => {
    return (
        <div className={cn('absolute left-0 top-full flex justify-center', className)}>
            <div
                ref={ref}
                className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-white text-gray-950 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]"
                {...props}
            />
        </div>
    );
});
NavigationMenuViewport.displayName = 'NavigationMenuViewport';

// Backward compatibility aliases

// DropdownMenu aliases
export const DropdownMenu = ({ children, ...props }) => (
    <Menu variant="dropdown" {...props}>{children}</Menu>
);
export const DropdownMenuTrigger = MenuTrigger;
export const DropdownMenuContent = MenuContent;
export const DropdownMenuItem = MenuItem;
export const DropdownMenuCheckboxItem = MenuCheckboxItem;
export const DropdownMenuRadioItem = MenuRadioItem;
export const DropdownMenuLabel = MenuLabel;
export const DropdownMenuSeparator = MenuSeparator;
export const DropdownMenuShortcut = MenuShortcut;
export const DropdownMenuGroup = MenuGroup;

// ContextMenu aliases
export const ContextMenu = ({ children, ...props }) => (
    <Menu variant="context" {...props}>{children}</Menu>
);
export const ContextMenuTrigger = MenuTrigger;
export const ContextMenuContent = MenuContent;
export const ContextMenuItem = MenuItem;
export const ContextMenuCheckboxItem = MenuCheckboxItem;
export const ContextMenuRadioItem = MenuRadioItem;
export const ContextMenuLabel = MenuLabel;
export const ContextMenuSeparator = MenuSeparator;
export const ContextMenuShortcut = MenuShortcut;
export const ContextMenuGroup = MenuGroup;
export const ContextMenuSub = ({ children, ...props }) => <div {...props}>{children}</div>;
export const ContextMenuSubTrigger = React.forwardRef(({ className = '', inset = false, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-gray-100 data-[state=open]:bg-gray-100',
            inset && 'pl-8',
            className
        )}
        {...props}
    >
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
    </div>
));
ContextMenuSubTrigger.displayName = 'ContextMenuSubTrigger';
export const ContextMenuSubContent = MenuContent;
export const ContextMenuPortal = ({ children }) => children;
export const ContextMenuRadioGroup = MenuGroup;

// Menubar aliases
export const Menubar = ({ children, ...props }) => (
    <Menu variant="menubar" {...props}>{children}</Menu>
);
export const MenubarMenu = ({ children, ...props }) => (
    <div className="relative" {...props}>{children}</div>
);
export const MenubarTrigger = MenuTrigger;
export const MenubarContent = MenuContent;
export const MenubarItem = MenuItem;
export const MenubarCheckboxItem = MenuCheckboxItem;
export const MenubarRadioItem = MenuRadioItem;
export const MenubarLabel = MenuLabel;
export const MenubarSeparator = MenuSeparator;
export const MenubarShortcut = MenuShortcut;
export const MenubarGroup = MenuGroup;

// NavigationMenu aliases
export const NavigationMenu = ({ children, ...props }) => (
    <Menu variant="navigation" {...props}>
        {children}
        <NavigationMenuViewport />
    </Menu>
);
export const NavigationMenuTrigger = MenuTrigger;
export const NavigationMenuContent = MenuContent;