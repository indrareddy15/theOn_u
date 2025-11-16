import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const CarouselContext = React.createContext(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a Carousel");
  }
  return context;
}

const Carousel = React.forwardRef(({
  orientation = "horizontal",
  className,
  children,
  ...props
}, ref) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [itemsCount, setItemsCount] = React.useState(0);

  const scrollPrev = React.useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const scrollNext = React.useCallback(() => {
    setCurrentIndex(prev => Math.min(itemsCount - 1, prev + 1));
  }, [itemsCount]);

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < itemsCount - 1;

  const contextValue = {
    orientation,
    currentIndex,
    setCurrentIndex,
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
    itemsCount,
    setItemsCount
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});

Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation, currentIndex } = useCarousel();

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <div
        className={cn(
          "flex transition-transform duration-300 ease-in-out",
          orientation === "vertical" ? "flex-col" : "flex-row"
        )}
        style={{
          transform: orientation === "vertical"
            ? `translateY(-${currentIndex * 100}%)`
            : `translateX(-${currentIndex * 100}%)`
        }}
      >
        {props.children}
      </div>
    </div>
  );
});

CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation, setItemsCount } = useCarousel();

  React.useEffect(() => {
    setItemsCount(prev => prev + 1);
    return () => setItemsCount(prev => Math.max(0, prev - 1));
  }, [setItemsCount]);

  return (
    <div
      ref={ref}
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "vertical" ? "min-h-0" : "",
        className
      )}
      {...props}
    />
  );
});

CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel();

  return (
    <button
      ref={ref}
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={cn(
        "absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
        orientation === "horizontal"
          ? "left-4 top-1/2 -translate-y-1/2"
          : "top-4 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </button>
  );
});

CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef(({
  className,
  ...props
}, ref) => {
  const { scrollNext, canScrollNext, orientation } = useCarousel();

  return (
    <button
      ref={ref}
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={cn(
        "absolute z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
        orientation === "horizontal"
          ? "right-4 top-1/2 -translate-y-1/2"
          : "bottom-4 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </button>
  );
});

CarouselNext.displayName = "CarouselNext";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};

