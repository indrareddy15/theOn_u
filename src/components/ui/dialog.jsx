import React, { useState, createContext, useContext, useEffect } from 'react';
import { X } from 'lucide-react';

const DialogContext = createContext();

export const Dialog = ({ children, open, onOpenChange }) => {
    const [internalOpen, setInternalOpen] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const isOpen = open !== undefined ? open : internalOpen;
    const setIsOpen = open !== undefined ? onOpenChange : setInternalOpen;

    const handleOpenChange = (newOpen) => {
        setIsOpen?.(newOpen);
    };

    return (
        <DialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

export const DialogTrigger = ({ children, asChild = false }) => {
    const { setIsOpen } = useContext(DialogContext);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
    };

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: handleClick,
            type: children.props.type || 'button'
        });
    }

    return (
        <button type="button" onClick={handleClick}>
            {children}
        </button>
    );
};

export const DialogContent = ({ children, className = '' }) => {
    const { isOpen, setIsOpen } = useContext(DialogContext);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            // Add CSS animation styles if they don't exist
            if (!document.getElementById('dialog-animations')) {
                const style = document.createElement('style');
                style.id = 'dialog-animations';
                style.textContent = `
                    .dialog-backdrop-enter { opacity: 0; }
                    .dialog-backdrop-enter-active { 
                        opacity: 1; 
                        transition: opacity 200ms ease-out; 
                    }
                    .dialog-content-enter {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    .dialog-content-enter-active {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                        transition: all 200ms ease-out;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm dialog-backdrop-enter dialog-backdrop-enter-active"
                onClick={() => setIsOpen(false)}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={`relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-auto overflow-hidden dialog-content-enter dialog-content-enter-active ${className}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex flex-col max-h-[90vh] overflow-hidden">
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
};

export const DialogHeader = ({ children, className = '', showCloseButton = true }) => {
    const { setIsOpen } = useContext(DialogContext);

    return (
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 ${className}`}>
            <div className="flex flex-col space-y-1.5 flex-1">
                {children}
            </div>
            {showCloseButton && (
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="ml-4 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
                    aria-label="Close dialog"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
};

export const DialogTitle = ({ children, className = '' }) => (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>
        {children}
    </h2>
);

export const DialogDescription = ({ children, className = '' }) => (
    <p className={`text-sm text-gray-600 ${className}`}>
        {children}
    </p>
);

export const DialogFooter = ({ children, className = '' }) => (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-gray-200 ${className}`}>
        {children}
    </div>
);