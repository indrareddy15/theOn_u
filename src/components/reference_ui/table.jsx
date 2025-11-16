import React, { useRef, useState, useEffect } from 'react';

export const Table = ({ children, className = '' }) => {
    const scrollContainerRef = useRef(null);
    const [scrollState, setScrollState] = useState({
        canScrollLeft: false,
        canScrollRight: false,
        canScrollTop: false,
        canScrollBottom: false
    });

    const checkScrollability = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const {
            scrollLeft,
            scrollTop,
            scrollWidth,
            scrollHeight,
            clientWidth,
            clientHeight
        } = container;

        setScrollState({
            canScrollLeft: scrollLeft > 0,
            canScrollRight: scrollLeft < scrollWidth - clientWidth - 1,
            canScrollTop: scrollTop > 0,
            canScrollBottom: scrollTop < scrollHeight - clientHeight - 1
        });
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Add custom scrollbar styles
        const style = document.createElement('style');
        style.textContent = `
            .table-container::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            .table-container::-webkit-scrollbar-track {
                background: #f3f4f6;
                border-radius: 4px;
            }
            .table-container::-webkit-scrollbar-thumb {
                background: #d1d5db;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }
            .table-container::-webkit-scrollbar-thumb:hover {
                background: #9ca3af;
            }
            .table-container::-webkit-scrollbar-corner {
                background: #f3f4f6;
            }
        `;

        if (!document.getElementById('table-scrollbar-styles')) {
            style.id = 'table-scrollbar-styles';
            document.head.appendChild(style);
        }

        // Initial check
        checkScrollability();

        // Add scroll listener with throttling for better performance
        let scrollTimeout;
        const throttledCheckScroll = () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                checkScrollability();
                scrollTimeout = null;
            }, 16); // ~60fps
        };

        container.addEventListener('scroll', throttledCheckScroll, { passive: true });

        // Add resize observer to handle dynamic content changes
        const resizeObserver = new ResizeObserver(() => {
            checkScrollability();
        });

        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', throttledCheckScroll);
            resizeObserver.disconnect();
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
        };
    }, []);

    return (
        <div className={`relative w-full ${className}`}>
            {/* Scroll Shadows */}
            {scrollState.canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            )}
            {scrollState.canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            )}
            {scrollState.canScrollTop && (
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
            )}
            {scrollState.canScrollBottom && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
            )}

            {/* Scrollable Container */}
            <div
                ref={scrollContainerRef}
                className="table-container relative w-full overflow-auto"
                style={{
                    maxHeight: 'calc(100vh - 200px)',
                    scrollBehavior: 'smooth'
                }}
            >
                <table className="w-full caption-bottom text-sm border-collapse">
                    {children}
                </table>
            </div>

            {/* Scroll Indicators */}
            <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-70">
                {scrollState.canScrollRight && (
                    <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm border">
                        Scroll →
                    </div>
                )}
                {scrollState.canScrollBottom && (
                    <div className="text-xs text-gray-500 bg-white/80 backdrop-blur-sm px-2 py-1 rounded shadow-sm border">
                        Scroll ↓
                    </div>
                )}
            </div>
        </div>
    );
};

export const TableHeader = ({ children, className = '', sticky = true }) => (
    <thead className={`[&_tr]:border-b ${sticky ? 'sticky top-0 z-30 bg-gray-50/50 shadow-sm' : ''} ${className}`}>
        {children}
    </thead>
);

export const TableBody = ({ children, className = '' }) => (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`}>
        {children}
    </tbody>
);

export const TableFooter = ({ children, className = '' }) => (
    <tfoot className={`bg-gray-50 font-medium [&>tr]:last:border-b-0 ${className}`}>
        {children}
    </tfoot>
);

export const TableRow = ({ children, className = '', onClick }) => (
    <tr
        className={`border-b border-gray-200 transition-colors hover:bg-gray-50/50 data-[state=selected]:bg-gray-50 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
    >
        {children}
    </tr>
);

export const TableHead = ({ children, className = '', sortable = false, onSort, sortDirection, ...props }) => (
    <th
        className={`
            h-12 px-4 text-left align-middle font-medium text-gray-500 border-b border-gray-200 bg-gray-50/50
            [&:has([role=checkbox])]:pr-0 
            ${sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
            ${className}
        `}
        onClick={sortable && onSort ? onSort : undefined}
        {...props}
    >
        <div className="flex items-center gap-2">
            {children}
            {sortable && (
                <span className="text-xs opacity-50">
                    {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
                </span>
            )}
        </div>
    </th>
);

export const TableCell = ({ children, className = '', ...props }) => (
    <td
        className={`px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
        {...props}
    >
        {children}
    </td>
);

export const TableCaption = ({ children, className = '' }) => (
    <caption className={`mt-4 text-sm text-gray-500 ${className}`}>
        {children}
    </caption>
);