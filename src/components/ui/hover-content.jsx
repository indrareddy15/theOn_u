import React, { createContext, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const cn = (...classes) => classes.filter(Boolean).join(' ');

// Create context for hover state
const HoverContext = createContext();

const useHover = () => {
    const context = useContext(HoverContext);
    if (!context) {
        throw new Error('Hover components must be used within a HoverContent');
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

// Main HoverContent component
export const HoverContent = ({
    children,
    variant = 'tooltip', // tooltip | card
    ...props
}) => {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const value = {
        open,
        setOpen,
        variant,
        position,
        setPosition
    };

    return (
        <HoverContext.Provider value={value}>
            <div {...props}>
                {children}
            </div>
        </HoverContext.Provider>
    );
};

// Hover trigger component
export const HoverTrigger = React.forwardRef(({
    className = '',
    children,
    asChild = false,
    delayDuration = 700,
    ...props
}, ref) => {
    const { setOpen, setPosition } = useHover();
    const [hoverTimeout, setHoverTimeout] = useState(null);

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top
        });

        const timeout = setTimeout(() => {
            setOpen(true);
        }, delayDuration);
        setHoverTimeout(timeout);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        setOpen(false);
    };

    useEffect(() => {
        return () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
            }
        };
    }, [hoverTimeout]);

    if (asChild) {
        return React.cloneElement(children, {
            ...props,
            ref,
            onMouseEnter: handleMouseEnter,
            onMouseLeave: handleMouseLeave
        });
    }

    return (
        <div
            ref={ref}
            className={className}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            {children}
        </div>
    );
});
HoverTrigger.displayName = 'HoverTrigger';

// Hover content container
export const HoverPanel = React.forwardRef(({
    className = '',
    children,
    side = 'top',
    align = 'center',
    sideOffset = 4,
    ...props
}, ref) => {
    const { open, variant, position } = useHover();

    if (!open) return null;

    // Calculate position based on side and align
    const getPosition = () => {
        let x = position.x;
        let y = position.y;

        // Adjust for side
        switch (side) {
            case 'top':
                y = position.y - sideOffset;
                break;
            case 'bottom':
                y = position.y + sideOffset;
                break;
            case 'left':
                x = position.x - sideOffset;
                break;
            case 'right':
                x = position.x + sideOffset;
                break;
        }

        // Adjust for align
        if (side === 'top' || side === 'bottom') {
            switch (align) {
                case 'start':
                    x = position.x - 50;
                    break;
                case 'center':
                    x = position.x;
                    break;
                case 'end':
                    x = position.x + 50;
                    break;
            }
        }

        return { x, y };
    };

    const { x, y } = getPosition();

    // Get variant styles
    const getVariantStyles = () => {
        switch (variant) {
            case 'card':
                return {
                    container: 'z-50 w-64 rounded-md border bg-white p-4 text-sm shadow-md',
                    transform: side === 'top' ? 'translate(-50%, -100%)' :
                        side === 'bottom' ? 'translate(-50%, 0%)' :
                            side === 'left' ? 'translate(-100%, -50%)' :
                                'translate(0%, -50%)'
                };

            default: // tooltip
                return {
                    container: 'z-50 overflow-hidden rounded-md border bg-gray-900 px-3 py-1.5 text-xs text-white animate-in fade-in-0 zoom-in-95',
                    transform: side === 'top' ? 'translate(-50%, -100%)' :
                        side === 'bottom' ? 'translate(-50%, 0%)' :
                            side === 'left' ? 'translate(-100%, -50%)' :
                                'translate(0%, -50%)'
                };
        }
    };

    const { container, transform } = getVariantStyles();

    return (
        <Portal>
            <div
                ref={ref}
                className={cn(container, className)}
                style={{
                    position: 'fixed',
                    left: x,
                    top: y,
                    transform
                }}
                {...props}
            >
                {children}
                {variant === 'tooltip' && (
                    <div
                        className={cn(
                            'absolute h-2 w-2 rotate-45 bg-gray-900',
                            side === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                            side === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                            side === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2',
                            side === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2'
                        )}
                    />
                )}
            </div>
        </Portal>
    );
});
HoverPanel.displayName = 'HoverPanel';

// Hover card header
export const HoverHeader = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn('mb-2', className)}
        {...props}
    >
        {children}
    </div>
));
HoverHeader.displayName = 'HoverHeader';

// Hover card footer
export const HoverFooter = React.forwardRef(({
    className = '',
    children,
    ...props
}, ref) => (
    <div
        ref={ref}
        className={cn('mt-2', className)}
        {...props}
    >
        {children}
    </div>
));
HoverFooter.displayName = 'HoverFooter';

// Backward compatibility aliases
export const Tooltip = ({ children, ...props }) => (
    <HoverContent variant="tooltip" {...props}>{children}</HoverContent>
);
export const TooltipTrigger = HoverTrigger;
export const TooltipContent = HoverPanel;

export const HoverCard = ({ children, ...props }) => (
    <HoverContent variant="card" {...props}>{children}</HoverContent>
);
export const HoverCardTrigger = HoverTrigger;
export const HoverCardContent = HoverPanel;
export const HoverCardHeader = HoverHeader;
export const HoverCardFooter = HoverFooter;