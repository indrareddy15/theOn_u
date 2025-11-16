import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const ScrollArea = React.forwardRef(({
  className = '',
  children,
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <div className="h-full w-full rounded-[inherit] overflow-auto">
        {children}
      </div>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
    </div>
  );
});
ScrollArea.displayName = 'ScrollArea';

export const ScrollBar = React.forwardRef(({
  className = '',
  orientation = 'vertical',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex touch-none select-none transition-colors',
        orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
        orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-[1px]',
        className
      )}
      {...props}
    >
      <div className="relative flex-1 rounded-full bg-gray-200" />
    </div>
  );
});
ScrollBar.displayName = 'ScrollBar';

