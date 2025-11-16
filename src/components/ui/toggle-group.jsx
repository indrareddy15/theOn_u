import React, { createContext, useContext } from 'react';
import { toggleVariants } from './toggle';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const ToggleGroupContext = createContext({
  size: 'default',
  variant: 'default'
});

export const ToggleGroup = ({
  className = '',
  variant = 'default',
  size = 'default',
  children,
  type = 'multiple',
  ...props
}) => {
  const contextValue = {
    size,
    variant
  };

  return (
    <ToggleGroupContext.Provider value={contextValue}>
      <div
        className={cn('flex items-center justify-center gap-1', className)}
        role={type === 'single' ? 'radiogroup' : 'group'}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
};

export const ToggleGroupItem = React.forwardRef(({
  className = '',
  children,
  variant,
  size,
  ...props
}, ref) => {
  const context = useContext(ToggleGroupContext);
  const itemVariant = variant || context.variant;
  const itemSize = size || context.size;

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-gray-100 data-[state=on]:text-gray-900',
        toggleVariants.variant[itemVariant],
        toggleVariants.size[itemSize],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
ToggleGroupItem.displayName = 'ToggleGroupItem';

