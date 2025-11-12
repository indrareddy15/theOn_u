import React, { useState, createContext, useContext } from 'react';

const AlertDialogContext = createContext();

export const AlertDialog = ({ children, open, onOpenChange }) => {
    const [isOpen, setIsOpen] = useState(open || false);

    const handleOpenChange = (newOpen) => {
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <AlertDialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
            {children}
        </AlertDialogContext.Provider>
    );
};

export const AlertDialogTrigger = ({ children, asChild = false }) => {
    const { setIsOpen } = useContext(AlertDialogContext);

    const handleClick = () => setIsOpen(true);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { onClick: handleClick });
    }

    return (
        <button onClick={handleClick}>
            {children}
        </button>
    );
};

export const AlertDialogContent = ({ children, className = '' }) => {
    const { isOpen } = useContext(AlertDialogContext);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className={`bg-white rounded-lg shadow-lg max-w-md w-full ${className}`}>
                    {children}
                </div>
            </div>
        </>
    );
};

export const AlertDialogHeader = ({ children, className = '' }) => (
    <div className={`p-6 border-b ${className}`}>
        {children}
    </div>
);

export const AlertDialogTitle = ({ children, className = '' }) => (
    <h2 className={`text-lg font-semibold ${className}`}>
        {children}
    </h2>
);

export const AlertDialogDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-600 ${className}`}>
        {children}
    </p>
);

export const AlertDialogFooter = ({ children, className = '' }) => (
    <div className={`p-6 border-t flex justify-end gap-2 ${className}`}>
        {children}
    </div>
);

export const AlertDialogAction = ({ children, onClick, className = '' }) => {
    const { setIsOpen } = useContext(AlertDialogContext);

    const handleClick = () => {
        onClick?.();
        setIsOpen(false);
    };

    return (
        <button
            onClick={handleClick}
            className={`px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 ${className}`}
        >
            {children}
        </button>
    );
};

export const AlertDialogCancel = ({ children, onClick, className = '' }) => {
    const { setIsOpen } = useContext(AlertDialogContext);

    const handleClick = () => {
        onClick?.();
        setIsOpen(false);
    };

    return (
        <button
            onClick={handleClick}
            className={`px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 ${className}`}
        >
            {children}
        </button>
    );
};