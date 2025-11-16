import React from 'react';

export const Switch = React.forwardRef(({
    checked = false,
    onCheckedChange,
    className = '',
    disabled = false,
    ...props
}, ref) => {
    const handleChange = (e) => {
        if (!disabled && onCheckedChange) {
            onCheckedChange(e.target.checked);
        }
    };

    return (
        <label className={`relative inline-flex cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
            <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                ref={ref}
                {...props}
            />
            <div className={`
                w-11 h-6 rounded-full peer transition-colors duration-200 ease-in-out
                ${checked ? 'bg-gray-900' : 'bg-gray-200'}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}>
                <div className={`
                    absolute top-[2px] left-[2px] bg-white border border-gray-300 
                    rounded-full h-5 w-5 transition-transform duration-200 ease-in-out
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `} />
            </div>
        </label>
    );
});

Switch.displayName = 'Switch';