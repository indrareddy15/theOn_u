import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const cn = (...classes) => classes.filter(Boolean).join(' ');

export const Pagination = ({ className = '', ...props }) => {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    />
  );
};

export const PaginationContent = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <ul
      ref={ref}
      className={cn('flex flex-row items-center gap-1', className)}
      {...props}
    />
  );
});
PaginationContent.displayName = 'PaginationContent';

export const PaginationItem = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <li
      ref={ref}
      className={className}
      {...props}
    />
  );
});
PaginationItem.displayName = 'PaginationItem';

export const PaginationLink = React.forwardRef(({
  className = '',
  isActive = false,
  size = 'icon',
  children,
  ...props
}, ref) => {
  const sizeClasses = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-8',
    icon: 'h-9 w-9'
  };

  return (
    <a
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-gray-900 text-white hover:bg-gray-900/90' : 'hover:bg-gray-100 hover:text-gray-900',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
});
PaginationLink.displayName = 'PaginationLink';

export const PaginationPrevious = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <PaginationLink
      ref={ref}
      aria-label="Go to previous page"
      size="default"
      className={cn('gap-1 pl-2.5', className)}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Previous</span>
    </PaginationLink>
  );
});
PaginationPrevious.displayName = 'PaginationPrevious';

export const PaginationNext = React.forwardRef(({
  className = '',
  ...props
}, ref) => {
  return (
    <PaginationLink
      ref={ref}
      aria-label="Go to next page"
      size="default"
      className={cn('gap-1 pr-2.5', className)}
      {...props}
    >
      <span>Next</span>
      <ChevronRight className="h-4 w-4" />
    </PaginationLink>
  );
});
PaginationNext.displayName = 'PaginationNext';

export const PaginationEllipsis = ({
  className = '',
  ...props
}) => {
  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center', className)}
      {...props}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
};

