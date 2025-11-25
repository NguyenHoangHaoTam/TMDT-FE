import * as React from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

export function CarouselPlugin({ className }: { readonly className?: string }) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const navigate = useNavigate();

  const slides = React.useMemo(
    () => [
      {
        id: "outdoor-store",
        image: "/assets/img/img5.jpg",
        title: "Cửa hàng dã ngoại",
        subtitle: "Lều và thảm dã ngoại ngoài trời",
        category: 6,
      },
      {
        id: "cooler-box",
        image: "/assets/blog/2.png",
        title: "Thùng Đá Giữ Nhiệt",
        subtitle: "Thùng đá xếp thương hiệu hàng đầu thế giới",
        category: 18,
      },
    ],
    []
  );

  React.useEffect(() => {
    if (!carouselApi || isHovered) return;

    const interval = setInterval(() => {
      if (!carouselApi) return;
      if (carouselApi.canScrollNext()) {
        carouselApi.scrollNext();
      } else {
        carouselApi.scrollTo(0);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselApi, isHovered]);

  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleSetApi = React.useCallback((api: CarouselApi) => {
    setCarouselApi(api);
  }, []);

  return (
    <Carousel
      setApi={handleSetApi}
      opts={{ loop: true }}
      className={cn("w-full h-full", className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <CarouselContent className="h-full p-0 border-none shadow-none">
        {slides.map((slide) => (
          <CarouselItem
            key={slide.id}
            className="h-full border-none shadow-none"
          >
            <div className="h-full border-none">
              <Card className="h-full border-none shadow-none py-0">
                <CardContent className="relative h-full w-full px-0 border-none shadow-none overflow-hidden rounded-2xl group">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl pointer-events-none" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center space-y-4">
                    <div className="text-white space-y-2 drop-shadow-md transition-all duration-300 group-hover:-translate-y-0.5">
                      <p className="text-3xl font-semibold">{slide.title}</p>
                      <p className="text-lg">{slide.subtitle}</p>
                    </div>

                    <div className="flex justify-center items-center">
                      <button
                        className="bg-green-primary px-6 py-2.5 text-base font-medium mx-auto text-white rounded-md transition-all duration-300 hover:bg-green-primary/90 hover:-translate-y-0.5"
                        onClick={() =>
                          navigate(`/products?category=${slide.category}`)
                        }
                      >
                        Xem ngay
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious className="absolute top-1/2 bg-transparent hover:bg-transparent left-4 z-10 border-none text-muted-foreground cursor-pointer" />
      <CarouselNext className="absolute top-1/2 right-4 z-10 border-none text-muted-foreground bg-transparent hover:bg-transparent cursor-pointer" />
    </Carousel>
  );
}
