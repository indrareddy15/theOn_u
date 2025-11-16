/* eslint-disable no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { useState, useCallback, useEffect, useMemo, createContext, useContext } from 'react';
import { PanelLeft } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Simple mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

const SidebarContext = createContext(null);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
};

export const SidebarProvider = ({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className = '',
  style,
  children,
  ...props
}) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = useState(false);

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = useCallback(
    (value) => {
      const openState = typeof value === 'function' ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );

  // Helper to toggle the sidebar.
  const toggleSidebar = useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Adds a keyboard shortcut to toggle the sidebar.
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? 'expanded' : 'collapsed';

  const contextValue = useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        className={cn('flex min-h-screen w-full', className)}
        style={style}
        data-sidebar={state}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  className = '',
  children,
  ...props
}) => {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div className={cn('flex h-full w-64 flex-col', className)} {...props}>
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 md:hidden">
        <div
          className={cn(
            'fixed inset-y-0 z-50 flex h-full w-64 flex-col border-r bg-white transition-transform duration-300',
            side === 'left' ? 'left-0' : 'right-0',
            openMobile ? 'translate-x-0' : side === 'left' ? '-translate-x-full' : 'translate-x-full',
            className
          )}
          style={{
            '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
          }}
          {...props}
        >
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Sidebar</h2>
            <p className="text-sm text-gray-500">Displays the mobile sidebar.</p>
          </div>
          {children}
        </div>
        {openMobile && (
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpenMobile(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} {...props}>
      {/* This is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          'fixed inset-y-0 z-30 flex h-full flex-col border-r bg-white transition-all duration-300',
          side === 'left' ? 'left-0' : 'right-0',
          state === 'expanded' ? 'w-64' : 'w-16'
        )}
      >
        <div className="flex flex-col h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export const SidebarTrigger = React.forwardRef(({
  className = '',
  onClick,
  ...props
}, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 h-9 w-9',
        className
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

export const SidebarRail = ({ className = '', ...props }) => {
  const { toggleSidebar } = useSidebar();

  return (
    <div
      className={cn('absolute inset-y-0 left-full w-2 cursor-ew-resize', className)}
      onClick={toggleSidebar}
      {...props}
    />
  );
};

export const SidebarInset = ({ className = '', ...props }) => {
  return (
    <main
      className={cn('flex min-h-screen flex-1 flex-col bg-gray-50/40', className)}
      {...props}
    />
  );
};

export const SidebarInput = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});
SidebarInput.displayName = 'SidebarInput';

export const SidebarHeader = ({ className = '', ...props }) => {
  return (
    <div
      className={cn('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
};

export const SidebarFooter = ({ className = '', ...props }) => {
  return (
    <div
      className={cn('flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
};

export const SidebarSeparator = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mx-4 my-2 h-px bg-gray-200', className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = 'SidebarSeparator';

export const SidebarContent = ({ className = '', ...props }) => {
  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-4', className)}
      {...props}
    />
  );
};

export const SidebarGroup = ({ className = '', ...props }) => {
  return (
    <div
      className={cn('relative flex w-full min-w-0 flex-col', className)}
      {...props}
    />
  );
};

export const SidebarGroupLabel = React.forwardRef(({
  className = '',
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? 'div' : 'div';

  return (
    <Comp
      ref={ref}
      className={cn(
        'duration-200 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-gray-500 outline-none ring-gray-950 transition-[margin,opa] ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  );
});
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

export const SidebarGroupAction = React.forwardRef(({
  className = '',
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? 'div' : 'button';

  return (
    <Comp
      ref={ref}
      className={cn(
        'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-gray-500 outline-none ring-gray-950 transition-transform hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 peer-hover/menu-button:text-gray-900 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
});
SidebarGroupAction.displayName = 'SidebarGroupAction';

export const SidebarGroupContent = ({ className = '', ...props }) => {
  return (
    <div
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
};

export const SidebarMenu = ({ className = '', ...props }) => {
  return (
    <ul
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
};

export const SidebarMenuItem = ({ className = '', ...props }) => {
  return (
    <li
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
};

const sidebarMenuButtonVariants = {
  variant: {
    default: 'hover:bg-gray-100 hover:text-gray-900',
    outline: 'bg-white shadow-sm border hover:bg-gray-100 hover:text-gray-900'
  },
  size: {
    default: 'h-8 text-sm',
    sm: 'h-7 text-xs',
    lg: 'h-12 text-sm group-data-[collapsible=icon]:p-0'
  }
};

export const SidebarMenuButton = React.forwardRef(({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className = '',
  children,
  ...props
}, ref) => {
  const Comp = asChild ? 'div' : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      ref={ref}
      className={cn(
        'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-gray-950 transition-colors focus-visible:ring-2 active:bg-gray-100 active:text-gray-900 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
        isActive && 'bg-gray-100 font-medium text-gray-900',
        sidebarMenuButtonVariants.variant[variant],
        sidebarMenuButtonVariants.size[size],
        'group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        className
      )}
      data-active={isActive}
      {...props}
    >
      {children}
    </Comp>
  );

  if (!tooltip) {
    return button;
  }

  const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip;

  return (
    <div className="relative">
      {button}
      <div className="absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-md bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
        {tooltipProps.children}
      </div>
    </div>
  );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarMenuAction = React.forwardRef(({
  className = '',
  asChild = false,
  showOnHover = false,
  ...props
}, ref) => {
  const Comp = asChild ? 'div' : 'button';

  return (
    <Comp
      ref={ref}
      className={cn(
        'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-gray-500 outline-none ring-gray-950 transition-transform hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-2 peer-hover/menu-button:text-gray-900 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
        'peer-data-[active=true]/menu-button:text-gray-900 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0',
        className
      )}
      {...props}
    />
  );
});
SidebarMenuAction.displayName = 'SidebarMenuAction';

export const SidebarMenuBadge = ({
  className = '',
  ...props
}) => {
  return (
    <div
      className={cn(
        'absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md bg-gray-900 px-1 text-xs font-medium tabular-nums text-white select-none pointer-events-none',
        className
      )}
      {...props}
    />
  );
};

export const SidebarMenuSkeleton = ({
  className = '',
  showIcon = false,
  ...props
}) => {
  // Random width between 50 to 90%.
  const width = useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, []);

  return (
    <div
      className={cn('rounded-md h-8 flex gap-2 px-2 items-center', className)}
      {...props}
    >
      {showIcon && (
        <div className="w-4 h-4 rounded bg-gray-200 animate-pulse" />
      )}
      <div
        className="h-4 bg-gray-200 rounded animate-pulse"
        style={{ width }}
      />
    </div>
  );
};

export const SidebarMenuSub = ({ className = '', ...props }) => {
  return (
    <ul
      className={cn('mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-l-gray-200 px-2.5 py-0.5', className)}
      {...props}
    />
  );
};

export const SidebarMenuSubItem = ({
  className = '',
  ...props
}) => {
  return (
    <li
      className={className}
      {...props}
    />
  );
};

export const SidebarMenuSubButton = React.forwardRef(({
  asChild = false,
  size = 'md',
  isActive = false,
  className = '',
  ...props
}, ref) => {
  const Comp = asChild ? 'div' : 'a';

  return (
    <Comp
      ref={ref}
      className={cn(
        'hover:bg-gray-100 hover:text-gray-900 flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        isActive && 'bg-gray-100 text-gray-900',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      data-active={isActive}
      {...props}
    />
  );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

