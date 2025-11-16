import React from 'react';

export const Badge = ({ children, className = '', variant = 'default' }) => {
    const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

    const variants = {
        default: 'bg-gray-100 text-gray-800',
        secondary: 'bg-gray-800 text-white',
        destructive: 'bg-red-100 text-red-800',
        outline: 'border border-gray-300 text-gray-700',
    };

    return (
        <span className={`${baseStyles} ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};