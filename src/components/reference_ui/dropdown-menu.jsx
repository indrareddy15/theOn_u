import React, { useState, createContext, useContext } from 'react';

const DropdownMenuContext = createContext();

export const DropdownMenu = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative">{children}</div>
        </DropdownMenuContext.Provider>
    );
};

export const DropdownMenuTrigger = ({ children, asChild = false }) => {
    const { isOpen, setIsOpen } = useContext(DropdownMenuContext);

    const handleClick = () => setIsOpen(!isOpen);

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, { onClick: handleClick });
    }

    return (
        <button onClick={handleClick} className="outline-none">
            {children}
        </button>
    );
};

export const DropdownMenuContent = ({ children, align = 'start', className = '' }) => {
    const { isOpen, setIsOpen } = useContext(DropdownMenuContext);

    if (!isOpen) return null;

    const alignmentStyles = {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
    };

    return (
        <>
            <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
            />
            <div className={`
        absolute top-full mt-1 z-20 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md
        ${alignmentStyles[align]} ${className}
      `}>
                {children}
            </div>
        </>
    );
};

export const DropdownMenuItem = ({ children, className = '', onClick, ...props }) => {
    const { setIsOpen } = useContext(DropdownMenuContext);

    const handleClick = (e) => {
        onClick?.(e);
        setIsOpen(false);
    };

    return (
        <button
            className={`
        flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 
        focus:bg-gray-100 focus:outline-none text-left ${className}
      `}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
};

export const DropdownMenuSeparator = ({ className = '' }) => (
    <div className={`-mx-1 my-1 h-px bg-gray-200 ${className}`} />
);

export const DropdownMenuLabel = ({ children, className = '' }) => (
    <div className={`px-2 py-1.5 text-sm font-semibold text-gray-900 ${className}`}>
        {children}
    </div>
);