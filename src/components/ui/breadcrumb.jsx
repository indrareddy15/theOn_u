import React from "react";
import { ChevronRight } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Breadcrumb = React.forwardRef(({ className, ...props }, ref) => (
  <nav ref={ref} aria-label="breadcrumb" {...props}>
    <ol className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-gray-500", className)} {...props} />
  </nav>
));
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (
  <ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5 break-words", className)} {...props} />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef(({ className, ...props }, ref) => (
  <a ref={ref} className={cn("transition-colors hover:text-gray-900", className)} {...props} />
));
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => (
  <span ref={ref} role="link" aria-disabled="true" aria-current="page" className={cn("font-normal text-gray-900", className)} {...props} />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({ children, className, ...props }) => (
  <li role="presentation" aria-hidden="true" className={cn("[&>svg]:size-3.5", className)} {...props}>
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator };
