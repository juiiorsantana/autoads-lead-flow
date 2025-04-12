
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdCarouselProps {
  images: string[];
  title: string;
}

export function AdCarousel({ images, title }: AdCarouselProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="bg-black">
      <Carousel className="w-full">
        <CarouselContent>
          {Array.isArray(images) && images.map((img, i) => (
            <CarouselItem key={i}>
              <div className="flex aspect-square items-center justify-center p-0">
                <img 
                  src={img} 
                  alt={`${title} - Imagem ${i+1}`} 
                  className="w-full h-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className={isMobile ? "left-2" : "-left-12"} />
        <CarouselNext className={isMobile ? "right-2" : "-right-12"} />
      </Carousel>
    </div>
  );
}
