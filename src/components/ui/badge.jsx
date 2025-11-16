import React from 'react';

export const Badge = ({ children, className = '', variant = 'default' }) => {
    const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

    const variants = {
        default: 'bg-gray-200 text-gray-900',
        secondary: 'bg-gray-900 text-white',
        destructive: 'bg-red-500 text-white',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white',
        outline: 'border border-gray-400 text-gray-800 bg-white',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};