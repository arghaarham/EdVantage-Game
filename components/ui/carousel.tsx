"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "./utils";
import { Button } from "./button";

type CarouselProps = React.ComponentProps<"div"> & {
  options?: any;
  plugins?: any[];
};

export function Carousel({ className, children, options, plugins, ...props }: CarouselProps) {
  const [viewportRef, embla] = useEmblaCarousel(options, plugins);

  const scrollPrev = React.useCallback(() => embla && embla.scrollPrev(), [embla]);
  const scrollNext = React.useCallback(() => embla && embla.scrollNext(), [embla]);

  return (
    <div className={cn("relative", className)} {...props}>
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex">{children}</div>
      </div>

      <Button
        data-slot="carousel-previous"
        variant="ghost"
        size="icon"
        className="absolute left-2 top-1/2 -translate-y-1/2"
        onClick={scrollPrev}
      >
        <ArrowLeft />
      </Button>

      <Button
        data-slot="carousel-next"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 -translate-y-1/2"
        onClick={scrollNext}
      >
        <ArrowRight />
      </Button>
    </div>
  );
}

export function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-w-0 shrink-0 grow-0 basis-full", className)} {...props} />;
}

export default Carousel;
