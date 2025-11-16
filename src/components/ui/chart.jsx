/* eslint-disable react-refresh/only-export-components */
import React from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const ChartContext = React.createContext(null);

const useChart = () => {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return context;
};

const ChartContainer = React.forwardRef(({
  id,
  className,
  children,
  config = {},
  ...props
}, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        data-chart={chartId}
        className={cn("flex aspect-video justify-center text-xs", className)}
        {...props}
      >
        <div className="w-full">
          {children}
        </div>
      </div>
    </ChartContext.Provider>
  );
});

ChartContainer.displayName = "ChartContainer";

const ChartTooltip = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-background p-2 shadow-md",
      className
    )}
    {...props}
  />
));

ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef(({
  active,
  payload,
  label,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  labelFormatter,
  formatter,
  ...props
}, ref) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
      {...props}
    >
      {!hideLabel && (
        <div className="font-medium text-foreground">
          {labelFormatter ? labelFormatter(label, payload) : label}
        </div>
      )}
      <div className="grid gap-1.5">
        {payload.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {!hideIndicator && (
              <div
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-[2px]",
                  indicator === "dot" ? "rounded-full" : "",
                  indicator === "dashed" ? "border-2 border-dashed" : "bg-current"
                )}
                style={{ color: item.color }}
              />
            )}
            <div className="flex flex-1 justify-between gap-2">
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-mono font-medium text-foreground">
                {formatter ? formatter(item.value, item.name, item, index, payload) : item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

ChartTooltipContent.displayName = "ChartTooltipContent";

const ChartLegend = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center justify-center space-x-4", className)}
    {...props}
  />
));

ChartLegend.displayName = "ChartLegend";

const ChartLegendContent = React.forwardRef(({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  ...props
}, ref) => {
  if (!payload?.length) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-wrap items-center gap-2",
        verticalAlign === "top" && "mb-2",
        verticalAlign === "bottom" && "mt-2",
        className
      )}
      {...props}
    >
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {!hideIcon && (
            <div
              className="h-3 w-3 shrink-0 rounded-[2px]"
              style={{ backgroundColor: item.color }}
            />
          )}
          <span className="text-sm text-muted-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
});

ChartLegendContent.displayName = "ChartLegendContent";

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  useChart,
};

