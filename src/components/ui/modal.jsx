import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Create context for modal state
const ModalContext = createContext();

const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('Modal components must be used within a Modal');
    }
    return context;
};

// Portal component for rendering outside the DOM tree
const Portal = ({ children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (typeof window === 'undefined' || !mounted) return null;

    return createPortal(
        children,
        document.body
    );
};

// Main Modal component
export const Modal = ({
    children,
    variant = 'dialog', // dialog | alert | sheet | drawer
    position = 'center', // center | top | bottom | left | right
    open: controlledOpen,
    onOpenChange,
    ...props
}) => {
    const [internalOpen, setInternalOpen] = useState(false);

    // Use controlled open state if provided, otherwise use internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const setOpen = (newOpen) => {
        if (controlledOpen === undefined) {
            setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
    };

    const value = {
        open,
        setOpen,
        variant,
        position
    };

    return (
        <ModalContext.Provider value={value}>
            <div {...props}>
                {children}
            </div>
        </ModalContext.Provider>
    );
};

// Modal trigger button
export const ModalTrigger = React.forwardRef(({
    className = '',
    children,
    asChild = false,
    ...props
}, ref) => {
    const { setOpen } = useModal();

    const handleClick = () => {
        setOpen(true);
    };

    if (asChild) {
        return React.cloneElement(children, {
            ...props,
            ref,
            onClick: handleClick
        });
    }

    return (
        <button
            ref={ref}
            className={className}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
});
ModalTrigger.displayName = 'ModalTrigger';

// Modal content container
export const ModalContent = React.forwardRef(({
    className = '',
    children,
    onEscapeKeyDown,
    onInteractOutside,
    ...props
}, ref) => {
    const { open, setOpen, variant, position } = useModal();

    // Handle escape key
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (onEscapeKeyDown) {
                    onEscapeKeyDown(e);
                } else {
                    setOpen(false);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onEscapeKeyDown, setOpen]);

    // Handle click outside
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            if (onInteractOutside) {
                onInteractOutside(e);
            } else {
                setOpen(false);
            }
        }
    };

    if (!open) return null;

    // Base styles for different variants
    const getVariantStyles = () => {
        switch (variant) {
            case 'sheet':
                return {
                    overlay: 'fixed inset-0 z-50 bg-black/50',
                    content: cn(
                        'fixed z-50 bg-white shadow-lg transition-transform duration-300 ease-in-out',
                        position === 'left' && 'left-0 top-0 h-full w-80 border-r',
                        position === 'right' && 'right-0 top-0 h-full w-80 border-l',
                        position === 'top' && 'top-0 left-0 right-0 h-80 border-b',
                        position === 'bottom' && 'bottom-0 left-0 right-0 h-80 border-t'
                    )
                };

            case 'drawer':
                return {
                    overlay: 'fixed inset-0 z-50 bg-black/50',
                    content: 'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-lg shadow-lg border-t transition-transform duration-300 ease-in-out'
                };

            case 'alert':
                return {
                    overlay: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center',
                    content: 'relative z-50 bg-white rounded-lg shadow-lg border max-w-lg w-full mx-4'
                };

            default: // dialog
                return {
                    overlay: 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center',
                    content: 'relative z-50 bg-white rounded-lg shadow-lg border max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto'
                };
        }
    };

    const { overlay, content } = getVariantStyles();

    return (
        <Portal>
            <div className={overlay} onClick={handleOverlayClick}>
                <div
                    ref={ref}
                    className={cn(content, className)}
                    {...props}
                >
                    {children}
                </div>
            </div>
        </Portal>
    );
});
ModalContent.displayName = 'ModalContent';

// Modal header
export const ModalHeader = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
        {...props}
    >
        {children}
    </div>
));
ModalHeader.displayName = 'ModalHeader';

// Modal footer
export const ModalFooter = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4', className)}
        {...props}
    >
        {children}
    </div>
));
ModalFooter.displayName = 'ModalFooter';

// Modal title
export const ModalTitle = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => (
    <h2
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
    >
        {children}
    </h2>
));
ModalTitle.displayName = 'ModalTitle';

// Modal description
export const ModalDescription = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => (
    <p
        ref={ref}
        className={cn('text-sm text-gray-500', className)}
        {...props}
    >
        {children}
    </p>
));
ModalDescription.displayName = 'ModalDescription';

// Modal close button
export const ModalClose = React.forwardRef(({
    className = '',
    children,
    asChild = false,
    ...props
}, ref) => {
    const { setOpen } = useModal();

    const handleClick = () => {
        setOpen(false);
    };

    if (asChild) {
        return React.cloneElement(children, {
            ...props,
            ref,
            onClick: handleClick
        });
    }

    return (
        <button
            ref={ref}
            className={cn(
                'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none',
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {children || (
                <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path d="m18 6-12 12M6 6l12 12" />
                </svg>
            )}
        </button>
    );
});
ModalClose.displayName = 'ModalClose';

// For alert dialogs - action and cancel buttons
export const ModalAction = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => {
    const { setOpen } = useModal();

    const handleClick = (e) => {
        if (props.onClick) {
            props.onClick(e);
        }
        setOpen(false);
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white ring-offset-white transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
});
ModalAction.displayName = 'ModalAction';

export const ModalCancel = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => {
    const { setOpen } = useModal();

    const handleClick = (e) => {
        if (props.onClick) {
            props.onClick(e);
        }
        setOpen(false);
    };

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium ring-offset-white transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                className
            )}
            onClick={handleClick}
            {...props}
        >
            {children}
        </button>
    );
});
ModalCancel.displayName = 'ModalCancel';

// Backward compatibility aliases
export const Dialog = ({ children, open, onOpenChange, ...props }) => (
    <Modal open={open} onOpenChange={onOpenChange} {...props}>{children}</Modal>
);
export const DialogTrigger = ModalTrigger;
export const DialogContent = ModalContent;
export const DialogHeader = ModalHeader;
export const DialogFooter = ModalFooter;
export const DialogTitle = ModalTitle;
export const DialogDescription = ModalDescription;
export const DialogClose = ModalClose;

export const AlertDialog = ({ children, open, onOpenChange, ...props }) => (
    <Modal variant="alert" open={open} onOpenChange={onOpenChange} {...props}>{children}</Modal>
);
export const AlertDialogTrigger = ModalTrigger;
export const AlertDialogContent = ModalContent;
export const AlertDialogHeader = ModalHeader;
export const AlertDialogFooter = ModalFooter;
export const AlertDialogTitle = ModalTitle;
export const AlertDialogDescription = ModalDescription;
export const AlertDialogAction = ModalAction;
export const AlertDialogCancel = ModalCancel;

export const Sheet = ({ children, position = 'right', open, onOpenChange, ...props }) => (
    <Modal variant="sheet" position={position} open={open} onOpenChange={onOpenChange} {...props}>{children}</Modal>
);
export const SheetTrigger = ModalTrigger;
export const SheetContent = ModalContent;
export const SheetHeader = ModalHeader;
export const SheetFooter = ModalFooter;
export const SheetTitle = ModalTitle;
export const SheetDescription = ModalDescription;
export const SheetClose = ModalClose;

export const Drawer = ({ children, open, onOpenChange, ...props }) => (
    <Modal variant="drawer" position="bottom" open={open} onOpenChange={onOpenChange} {...props}>{children}</Modal>
);
export const DrawerTrigger = ModalTrigger;
export const DrawerContent = ModalContent;
export const DrawerHeader = ModalHeader;
export const DrawerFooter = ModalFooter;
export const DrawerTitle = ModalTitle;
export const DrawerDescription = ModalDescription;
export const DrawerClose = ModalClose;