/* eslint-disable react-refresh/only-export-components */
import React, { useState } from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

const toggleVariants = {
  variant: {
    default: 'bg-transparent',
    outline: 'border border-gray-200 bg-transparent shadow-sm hover:bg-gray-100 hover:text-gray-900'
  },
  size: {
    default: 'h-9 px-2 min-w-9',
    sm: 'h-8 px-1.5 min-w-8',
    lg: 'h-10 px-2.5 min-w-10'
  }
};

export const Toggle = React.forwardRef(({
  className = '',
  variant = 'default',
  size = 'default',
  pressed,
  onPressedChange,
  children,
  ...props
}, ref) => {
  const [isPressed, setIsPressed] = useState(pressed || false);

  const handleClick = () => {
    const newPressed = !isPressed;
    setIsPressed(newPressed);
    onPressedChange?.(newPressed);
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        toggleVariants.variant[variant],
        toggleVariants.size[size],
        isPressed && 'bg-gray-100 text-gray-900',
        className
      )}
      onClick={handleClick}
      aria-pressed={isPressed}
      {...props}
    >
      {children}
    </button>
  );
});
Toggle.displayName = 'Toggle';

export { toggleVariants };

