import React from 'react';

export const Separator = ({ className = '', orientation = 'horizontal', ...props }) => {
    const orientationClasses = {
        horizontal: 'w-full h-px',
        vertical: 'w-px h-full',
    };

    return (
        <div
            className={`bg-gray-200 ${orientationClasses[orientation]} ${className}`}
            {...props}
        />
    );
};