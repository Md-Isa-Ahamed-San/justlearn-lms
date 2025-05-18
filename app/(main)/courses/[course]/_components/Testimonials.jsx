import React from 'react';
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {

  Star,

} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const Testimonials = () => {
    const testimonials = [
      {
        id: 1,
        name: "Alex Johnson",
        avatar: "https://i.pravatar.cc/150?img=1",
        text: "This course completely transformed my understanding of React and Next.js. The instructor's teaching style made complex concepts easy to grasp.",
        rating: 5,
      },
      {
        id: 2,
        name: "Sarah Williams",
        avatar: "https://i.pravatar.cc/150?img=5",
        text: "Incredibly comprehensive and well-structured. I went from beginner to confidently building full-stack applications in just a few weeks.",
        rating: 5,
      },
      {
        id: 3,
        name: "Michael Chen",
        avatar: "https://i.pravatar.cc/150?img=3",
        text: "The project-based approach really helped solidify my understanding. Each module builds on the previous one in a logical way.",
        rating: 4,
      },
    ];
    return (
       <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              What Our Students Say
            </h2>

            <Carousel
              opts={{
                align: "start",
              }}
              className="mx-auto w-full"
            >
              <CarouselContent>
                {testimonials.map((testimonial) => (
                  <CarouselItem
                    key={testimonial.id}
                    className="md:basis-1/2 lg:basis-1/3 pl-4"
                  >
                    <div className="h-full rounded-xl  p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                          />
                          <AvatarFallback>
                            {testimonial.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{testimonial.name}</p>
                          <div className="flex ">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-4 w-4",
                                    i < testimonial.rating ? "fill-current" : ""
                                  )}
                                />
                              ))}
                          </div>
                        </div>
                      </div>
                      <p className="">{testimonial.text}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex justify-center gap-2">
                <CarouselPrevious className="relative inset-0 translate-y-0 text-secondary-foreground" />
                <CarouselNext className="relative inset-0 translate-y-0 text-secondary-foreground" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>
    );
};

export default Testimonials;