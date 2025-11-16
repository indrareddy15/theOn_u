import React from "react";

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const Alert = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const baseStyles = "relative w-full rounded-lg border px-4 py-3 text-sm";
  
  const variants = {
    default: "bg-white text-gray-900 border-gray-200",
    destructive: "text-red-800 bg-red-50 border-red-200",
  };

  return (
    <div
      ref={ref}
      role="alert"
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
});

Alert.displayName = "Alert";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));

AlertTitle.displayName = "AlertTitle";

export { Alert, AlertDescription, AlertTitle };