import React, { useState, createContext, useContext } from 'react';

const SheetContext = createContext();

export const Sheet = ({ children, open, onOpenChange }) => {
    const [isOpen, setIsOpen] = useState(open || false);

    const handleOpenChange = (newOpen) => {
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <SheetContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
            {children}
        </SheetContext.Provider>
    );
};

export const SheetTrigger = ({ children, asChild = false }) => {
    const { setIsOpen } = useContext(SheetContext);

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

export const SheetContent = ({ children, side = 'right', className = '' }) => {
    const { isOpen, setIsOpen } = useContext(SheetContext);

    if (!isOpen) return null;

    const sideStyles = {
        right: 'right-0 translate-x-0',
        left: 'left-0 translate-x-0',
        top: 'top-0 translate-y-0',
        bottom: 'bottom-0 translate-y-0'
    };

    const enterStyles = {
        right: 'translate-x-full',
        left: '-translate-x-full',
        top: '-translate-y-full',
        bottom: 'translate-y-full'
    };

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/50"
                onClick={() => setIsOpen(false)}
            />
            <div className={`
                fixed z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out
                ${side === 'right' || side === 'left' ? 'h-full top-0 w-full sm:w-80' : 'w-full left-0 h-auto'}
                ${side === 'right' ? 'right-0' : side === 'left' ? 'left-0' : side === 'top' ? 'top-0' : 'bottom-0'}
                ${isOpen ? sideStyles[side] : enterStyles[side]}
                ${className}
            `}>
                {children}
            </div>
        </>
    );
};

export const SheetHeader = ({ children, className = '' }) => (
    <div className={`p-6 border-b ${className}`}>
        {children}
    </div>
);

export const SheetTitle = ({ children, className = '' }) => (
    <h2 className={`text-lg font-semibold ${className}`}>
        {children}
    </h2>
);