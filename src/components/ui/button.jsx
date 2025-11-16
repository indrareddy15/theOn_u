import React from 'react';

export const Button = React.forwardRef(({
    className = '',
    variant = 'default',
    size = 'default',
    children,
    ...props
}, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        default: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
        outline: 'border border-gray-400 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-900',
        ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-900',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600',
    };

    const sizes = {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-12 px-8',
        icon: 'h-10 w-10',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';