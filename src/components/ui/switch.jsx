import React from 'react';

export const Switch = React.forwardRef(({
    checked = false,
    onCheckedChange,
    className = '',
    ...props
}, ref) => {
    return (
        <label className={`relative inline-flex cursor-pointer ${className}`}>
            <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={(e) => onCheckedChange?.(e.target.checked)}
                ref={ref}
                {...props}
            />
            <div className={`
        w-11 h-6 bg-gray-200 rounded-full peer 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:border-gray-300 after:border after:rounded-full 
        after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-600
      `} />
        </label>
    );
});

Switch.displayName = 'Switch';