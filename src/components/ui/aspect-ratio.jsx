import React from "react";

const AspectRatio = React.forwardRef(({ ratio = 1, className = "", children, ...props }, ref) => (
  <div
    ref={ref}
    style={{ aspectRatio: ratio }}
    className={`relative w-full ${className}`}
    {...props}
  >
    {children}
  </div>
));

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
