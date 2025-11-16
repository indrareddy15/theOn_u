import React from 'react';

export const Checkbox = ({
    checked = false,
    onCheckedChange,
    className = '',
    children,
    ...props
}) => {
    return (
        <label className={`flex items-center cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onCheckedChange?.(e.target.checked)}
                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-500"
                {...props}
            />
            {children && <span className="ml-2 text-sm text-gray-900">{children}</span>}
        </label>
    );
};