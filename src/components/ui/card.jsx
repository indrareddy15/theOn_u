import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`rounded-lg border bg-white shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardContent = ({ children, className = '', ...props }) => {
    return (
        <div className={`p-6 ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '', ...props }) => {
    return (
        <div className={`flex flex-row space-y-1.5 p-6 ${className}`} {...props}>
            {children}
        </div>
    );
};

export const CardTitle = ({ children, className = '', ...props }) => {
    return (
        <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
            {children}
        </h3>
    );
};