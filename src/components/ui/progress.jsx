import React from 'react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Progress = React.forwardRef(({
  className = '',
  value = 0,
  max = 100,
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      ref={ref}
      className={cn('relative h-4 w-full overflow-hidden rounded-full bg-gray-100', className)}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-gray-900 transition-all"
        style={{
          transform: `translateX(-${100 - percentage}%)`
        }}
      />
    </div>
  );
});
Progress.displayName = 'Progress';

