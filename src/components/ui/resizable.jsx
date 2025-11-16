import React from 'react';
import { GripVertical } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const ResizablePanelGroup = React.forwardRef(({
  className = '',
  children,
  direction = 'horizontal',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className
      )}
      data-panel-group-direction={direction}
      {...props}
    >
      {children}
    </div>
  );
});
ResizablePanelGroup.displayName = 'ResizablePanelGroup';

export const ResizablePanel = React.forwardRef(({
  className = '',
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('data-[panel-resize=start]:cursor-e-resize data-[panel-resize=end]:cursor-w-resize', className)}
      {...props}
    >
      {children}
    </div>
  );
});
ResizablePanel.displayName = 'ResizablePanel';

export const ResizableHandle = React.forwardRef(({
  withHandle = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex w-px items-center justify-center bg-gray-200 after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-gray-200">
          <GripVertical className="h-2.5 w-2.5" />
        </div>
      )}
    </div>
  );
});
ResizableHandle.displayName = 'ResizableHandle';

